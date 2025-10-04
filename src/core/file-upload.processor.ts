/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { ErrorCode, ErrorHandler, ProcessingError } from '../errors';
import { PerformanceMonitor } from '../observability';
import { FileService, PinataService } from '../services';
import { FileMapping, PinataConfig, ProcessingOptions, UploadResult } from '../types';
import { FileUtils, isEmptyArray } from '../utils';
import { BaseFileProcessor } from './base.processor';

type BatchTracker = ReturnType<typeof PerformanceMonitor.trackBatchOperation>;

export class FileUploadProcessor extends BaseFileProcessor<UploadResult[]> {
  private readonly fileService = new FileService();
  private readonly pinataService: PinataService;
  private readonly errorHandler: ErrorHandler;

  constructor(config: PinataConfig, rateLimitConfig = { maxConcurrent: 1, minTime: 3000 }) {
    super('FileUploadProcessor', rateLimitConfig);
    this.pinataService = new PinataService(config);
    this.errorHandler = new ErrorHandler('FileUploadProcessor');
  }

  /**
   * Processes files for upload to Pinata.
   * @param options - Processing options including folder path and output path.
   * @returns Array of upload results.
   */
  public async process(options: ProcessingOptions): Promise<UploadResult[]> {
    return PerformanceMonitor.monitorFunction(
      'file-upload-process',
      async () => {
        this.validateOptions(options);
        this.logProcessingStart(options);

        try {
          const existingCIDs = await this.loadExistingCIDs();
          const files = await this.collectFiles(options.folderPath);

          if (this.shouldShortCircuitForEmptyFolder(files, options.folderPath)) {
            return [];
          }

          this.logUploadStart(files.length, options.folderPath);
          const batchTracker = this.createBatchTracker(files.length);
          const results = await this.executeUploads(files, existingCIDs, batchTracker);
          const batchMetrics = batchTracker.complete();

          await this.persistSuccessfulUploads(results, options.outputPath);
          this.logCompletion(files.length, results, options.outputPath, batchMetrics);

          return results;
        } catch (error) {
          throw this.handleProcessFailure(error, options);
        }
      },
      { folderPath: options.folderPath, outputPath: options.outputPath }
    );
  }

  /**
   * Loads existing CID mappings from file.
   * @returns Existing CID mappings or empty object.
   */
  private async loadExistingCIDs(): Promise<FileMapping> {
    try {
      return await this.fileService.readJson<FileMapping>('./output/downloaded-cids.json');
    } catch {
      this.logger.warn('No existing CID mappings found, starting fresh');
      return {};
    }
  }

  /**
   * Reads file paths from the target folder.
   * @param folderPath - Source folder containing files to upload.
   * @returns List of file paths discovered.
   */
  private async collectFiles(folderPath: string): Promise<string[]> {
    return this.fileService.readFiles(folderPath);
  }

  /**
   * Determines if the processor should exit due to an empty folder and logs context.
   * @param files - Candidate file list.
   * @param folderPath - Path that was scanned.
   * @returns True when no files were found.
   */
  private shouldShortCircuitForEmptyFolder(files: string[], folderPath: string): boolean {
    if (!isEmptyArray(files)) {
      return false;
    }

    this.logger.warn(
      `No files found in folder: ${folderPath}`,
      { folderPath },
      { operation: 'file-upload-process', metadata: { fileCount: 0 } }
    );
    return true;
  }

  /**
   * Emits the initial upload log entry with context metadata.
   * @param totalFiles - Number of files selected for upload.
   * @param folderPath - Folder being processed.
   */
  private logUploadStart(totalFiles: number, folderPath: string): void {
    this.logger.info(
      `Starting upload of ${totalFiles} files`,
      { fileCount: totalFiles, folderPath },
      {
        operation: 'file-upload-process',
        metadata: { totalFiles },
      }
    );
  }

  /**
   * Creates a batch tracker for reporting progress through PerformanceMonitor.
   * @param totalFiles - Total number of files in the batch.
   * @returns Configured batch tracker instance.
   */
  private createBatchTracker(totalFiles: number): BatchTracker {
    return PerformanceMonitor.trackBatchOperation('batch-file-upload', totalFiles, (processed, total) => {
      if (processed % Math.max(1, Math.floor(total / 10)) === 0) {
        this.logger.info(`Upload progress: ${processed}/${total} files completed`, {
          processed,
          total,
          percentComplete: Math.round((processed / total) * 100),
        });
      }
    });
  }

  /**
   * Executes uploads for every file while respecting the rate limiter.
   * @param files - Files to upload.
   * @param existingCIDs - Cached CID mappings to skip duplicates.
   * @param batchTracker - Tracker capturing progress and errors.
   * @returns Collection of upload results.
   */
  private async executeUploads(
    files: string[],
    existingCIDs: FileMapping,
    batchTracker: BatchTracker
  ): Promise<UploadResult[]> {
    const tasks = files.map(filePath =>
      this.rateLimiter.schedule(() => this.processFileUploadWithTracking(filePath, existingCIDs, batchTracker))
    );
    return Promise.all(tasks);
  }

  /**
   * Persists successful uploads to the output file.
   * @param results - Upload results for the batch.
   * @param outputPath - Destination path for the JSON mapping.
   */
  private async persistSuccessfulUploads(results: UploadResult[], outputPath: string): Promise<void> {
    const successfulUploads = results.reduce<FileMapping>((acc, result) => {
      if (result.success && result.cid) {
        acc[result.fileName] = result.cid;
      }
      return acc;
    }, {});

    await this.fileService.saveJson(outputPath, successfulUploads);
  }

  /**
   * Logs completion metrics and summaries once uploads finish.
   * @param totalFiles - Number of files attempted.
   * @param results - Upload results.
   * @param outputPath - Path where results were persisted.
   * @param batchMetrics - Metrics captured by the batch tracker.
   */
  private logCompletion(totalFiles: number, results: UploadResult[], outputPath: string, batchMetrics: unknown): void {
    const { successCount, errorCount } = this.calculateOutcome(results);

    this.logger.info(
      'File upload process completed',
      {
        totalFiles,
        successful: successCount,
        failed: errorCount,
        outputPath,
        batchMetrics,
      },
      {
        operation: 'file-upload-process',
        metadata: this.buildOutcomeMetadata(totalFiles, successCount, errorCount),
      }
    );
  }

  /**
   * Normalizes and rethrows a process-level failure.
   * @param error - Error raised during processing.
   * @param options - Processing options that were in effect.
   * @returns Normalized processing error.
   */
  private handleProcessFailure(error: unknown, options: ProcessingOptions): ProcessingError {
    const normalizedError = this.errorHandler.normalizeError(error, 'file-upload-process');
    this.logger.error('File upload process failed', normalizedError, {
      operation: 'file-upload-process',
      metadata: {
        errorCode: normalizedError.code,
        folderPath: options.folderPath,
        outputPath: options.outputPath,
      },
    });
    return normalizedError;
  }

  /**
   * Calculates upload outcome tallies.
   * @param results - Upload results to analyse.
   * @returns Success and error counts.
   */
  private calculateOutcome(results: UploadResult[]): { successCount: number; errorCount: number } {
    const successCount = results.filter(result => result.success).length;
    return {
      successCount,
      errorCount: results.length - successCount,
    };
  }

  /**
   * Builds metadata payload for completion logging.
   * @param totalFiles - Total number of files processed.
   * @param successCount - Successful uploads.
   * @param errorCount - Failed uploads.
   * @returns Metadata object for logging.
   */
  private buildOutcomeMetadata(totalFiles: number, successCount: number, errorCount: number): Record<string, number> {
    if (totalFiles === 0) {
      return { successRate: 0, errorRate: 0 };
    }

    return {
      successRate: Math.round((successCount / totalFiles) * 100),
      errorRate: Math.round((errorCount / totalFiles) * 100),
    };
  }

  /**
   * Processes upload for a single file with batch tracking.
   * @param filePath - Path to the file.
   * @param existingCIDs - Existing CID mappings.
   * @param batchTracker - Batch operation tracker.
   * @returns Upload result with success/error details.
   */
  private async processFileUploadWithTracking(
    filePath: string,
    existingCIDs: FileMapping,
    batchTracker: BatchTracker
  ): Promise<UploadResult> {
    const fileName = FileUtils.getFileName(filePath);

    try {
      const result = await this.processFileUpload(filePath, existingCIDs);
      return this.handleTrackedResult(result, batchTracker);
    } catch (error) {
      return this.handleTrackedException(fileName, error, batchTracker);
    }
  }

  /**
   * Updates batch tracker state based on the upload result.
   * @param result - Result returned from the upload attempt.
   * @param batchTracker - Batch operation tracker.
   * @returns Original upload result.
   */
  private handleTrackedResult(result: UploadResult, batchTracker: BatchTracker): UploadResult {
    if (result.success) {
      batchTracker.recordSuccess();
      return result;
    }

    batchTracker.recordError(new ProcessingError(result.error ?? 'Upload failed', ErrorCode.PROCESSING_FAILED));
    return result;
  }

  /**
   * Normalises an exception thrown during upload and records it against the tracker.
   * @param fileName - Name of the file being processed.
   * @param error - Error thrown during upload.
   * @param batchTracker - Batch operation tracker.
   * @returns Upload result capturing the failure details.
   */
  private handleTrackedException(fileName: string, error: unknown, batchTracker: BatchTracker): UploadResult {
    const failure: UploadResult = {
      fileName,
      cid: '',
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };

    batchTracker.recordError(error instanceof Error ? error : new Error(String(error)));
    return failure;
  }

  /**
   * Processes upload for a single file.
   * @param filePath - Path to the file.
   * @param existingCIDs - Existing CID mappings.
   * @returns Upload result for the file.
   */
  private async processFileUpload(filePath: string, existingCIDs: FileMapping): Promise<UploadResult> {
    const fileName = FileUtils.getFileName(filePath);

    return PerformanceMonitor.monitorFunction(
      'single-file-upload',
      async () => {
        const { exists, ipfsHash } = this.pinataService.checkFileExists(fileName, existingCIDs);

        if (exists && ipfsHash) {
          this.logger.debug(
            `File already uploaded: ${fileName}`,
            { fileName, cid: ipfsHash },
            { operation: 'single-file-upload', metadata: { cached: true } }
          );
          return { fileName, cid: ipfsHash, success: true };
        }

        try {
          this.logger.debug(
            `Starting upload: ${fileName}`,
            { fileName, filePath },
            { operation: 'single-file-upload' }
          );

          const cid = await this.pinataService.uploadFile(filePath, fileName);

          this.logger.info(
            `Upload successful: ${fileName}`,
            { fileName, cid },
            { operation: 'single-file-upload', metadata: { uploaded: true } }
          );

          return { fileName, cid, success: true };
        } catch (error) {
          const normalizedError = this.errorHandler.normalizeError(error, 'single-file-upload');

          this.logger.error(`Upload failed: ${fileName}`, normalizedError, {
            operation: 'single-file-upload',
            metadata: {
              fileName,
              filePath,
              errorCode: normalizedError.code,
              errorType: normalizedError.constructor.name,
            },
          });

          return {
            fileName,
            cid: '',
            success: false,
            error: normalizedError.message,
          };
        }
      },
      { fileName, filePath }
    );
  }
}
