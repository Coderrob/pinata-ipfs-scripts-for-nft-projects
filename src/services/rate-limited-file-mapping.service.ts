/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import Bottleneck from 'bottleneck';

import { FileUtils, Logger, ObjectUtils } from '../utils';
import { FileService } from './file.service';

/**
 * Minimal contract for synchronous file reading to support digest operations.
 */
export interface FileReader {
  /**
   * Reads file content as a Buffer.
   * @param filePath - Absolute or relative path to the file.
   */
  readFileSync(filePath: string): Buffer;
}

/**
 * Optional dependencies for the rate-limited file mapping service.
 */
export interface RateLimitedFileMappingDependencies {
  /**
   * Custom file reader implementation; defaults to FileService.
   */
  readonly fileReader?: FileReader;

  /**
   * Custom logger instance; defaults to a scoped Logger built from the service name.
   */
  readonly logger?: Logger;
}

/**
 * Base class that coordinates rate-limited processing of files into key/value mappings.
 * Provides a template method hook for computing results while handling logging and error propagation.
 */
export abstract class RateLimitedFileMappingService<TResult, TMapping extends Record<string, TResult>> {
  protected readonly logger: Logger;
  private readonly fileReader: FileReader;

  protected constructor(
    protected readonly rateLimiter: Bottleneck,
    serviceName: string,
    dependencies: RateLimitedFileMappingDependencies = {}
  ) {
    this.logger = dependencies.logger ?? new Logger(serviceName);
    this.fileReader = dependencies.fileReader ?? new FileService();
  }

  /**
   * Returns the descriptor used in log messages to describe the operation.
   */
  protected abstract getOperationToken(): string;

  /**
   * Computes the mapping result for a single file.
   * @param filePath - Path to the file being processed.
   * @param fileName - File name derived from the path.
   * @param fileContent - File content as a buffer.
   */
  protected abstract computeResult(filePath: string, fileName: string, fileContent: Buffer): Promise<TResult> | TResult;

  /**
   * Converts the raw record into the mapping type expected by the concrete service.
   * @param mapping - Raw record keyed by file name.
   */
  protected transformMapping(mapping: Record<string, TResult>): TMapping {
    return mapping as TMapping;
  }

  /**
   * Reads file content synchronously via the configured reader.
   * @param filePath - Path to the file to read.
   */
  protected readFileContent(filePath: string): Buffer {
    return this.fileReader.readFileSync(filePath);
  }

  /**
   * Hook executed before a file is processed; can be overridden for custom logging.
   * @param fileName - Name of the file being processed.
   */
  protected onBeforeProcessing(fileName: string): void {
    this.logger.info(`${fileName} ${this.getOperationToken()} started`);
  }

  /**
   * Hook executed after a file is processed; can be overridden for custom logging.
   * @param fileName - Name of the file that was processed.
   * @param result - Result computed for the file.
   */
  protected onAfterProcessing(fileName: string, result: TResult): void {
    this.logger.info(`${fileName} ${this.getOperationToken()} completed`, { result });
  }

  /**
   * Handles errors raised while processing a file and rethrows them.
   * @param fileName - Name of the file being processed.
   * @param error - Error thrown during processing.
   */
  protected handleProcessingError(fileName: string, error: unknown): never {
    this.logger.error(`Failed to process ${this.getOperationToken()} for file: ${fileName}`, error);
    throw error;
  }

  /**
   * Processes the provided files in a rate-limited fashion and returns an ordered mapping.
   * @param files - Collection of file paths to process.
   */
  public async processFiles(files: readonly string[]): Promise<TMapping> {
    const mapping: Record<string, TResult> = {};

    await Promise.all(
      files.map(filePath =>
        this.rateLimiter.schedule(async () => {
          const fileName = FileUtils.getFileName(filePath);
          this.onBeforeProcessing(fileName);

          try {
            const fileContent = this.readFileContent(filePath);
            const result = await this.computeResult(filePath, fileName, fileContent);
            mapping[fileName] = result;
            this.onAfterProcessing(fileName, result);
          } catch (error) {
            this.handleProcessingError(fileName, error);
          }
        })
      )
    );

    const sortedMapping = ObjectUtils.sortObjectByKeys(mapping);
    return this.transformMapping(sortedMapping);
  }
}
