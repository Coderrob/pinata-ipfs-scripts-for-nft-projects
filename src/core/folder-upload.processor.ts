/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { PinataService } from '../services';
import { PinataConfig, ProcessingOptions } from '../types';
import { BaseFileProcessor } from './base.processor';

export interface FolderUploadResult {
  folderName: string;
  cid: string;
  success: boolean;
  error?: string;
}

export class FolderUploadProcessor extends BaseFileProcessor<FolderUploadResult> {
  private readonly pinataService: PinataService;

  constructor(config: PinataConfig) {
    super('FolderUploadProcessor');
    this.pinataService = new PinataService(config);
  }

  /**
   * Processes folder upload to Pinata
   * @param options - Processing options including folder path and output path
   * @param folderName - Display name for the folder in Pinata
   * @returns Upload result
   */
  public async process(options: ProcessingOptions, folderName?: string): Promise<FolderUploadResult> {
    this.validateOptions(options);
    this.logProcessingStart(options);

    const displayName = folderName || options.folderPath.split('/').pop() || 'metadata';

    try {
      const cid = await this.pinataService.uploadFolder(options.folderPath, displayName);

      const result: FolderUploadResult = {
        folderName: displayName,
        cid,
        success: true,
      };

      // Save the result
      await this.saveResult(options.outputPath, result);
      this.logger.info('Folder upload completed successfully', result);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error('Folder upload failed', error);

      const result: FolderUploadResult = {
        folderName: displayName,
        cid: '',
        success: false,
        error: errorMessage,
      };

      await this.saveResult(options.outputPath, result);
      return result;
    }
  }

  /**
   * Saves the upload result to file
   * @param outputPath - Path to save the result
   * @param result - Upload result to save
   */
  private async saveResult(outputPath: string, result: FolderUploadResult): Promise<void> {
    // For folder uploads, we typically just save the CID
    if (result.success) {
      const { FileService } = await import('../services');
      const service = new FileService();
      await service.saveJson(outputPath, result.cid);
    }
  }
}
