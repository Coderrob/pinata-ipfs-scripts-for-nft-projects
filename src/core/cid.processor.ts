/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { CIDCalculatorService, FileService } from '../services';
import { FileMapping, ProcessingOptions } from '../types';
import { ObjectUtils } from '../utils';
import { isEmptyArray } from '../utils/guards';
import { BaseFileProcessor } from './base.processor';

export class CIDProcessor extends BaseFileProcessor<FileMapping> {
  private readonly fileService = new FileService();
  private readonly cidCalculatorService: CIDCalculatorService;

  constructor(rateLimitConfig = { maxConcurrent: 5 }) {
    super('CIDProcessor', rateLimitConfig);
    this.cidCalculatorService = new CIDCalculatorService(this.rateLimiter);
  }

  /**
   * Processes files to calculate their IPFS CIDs
   * @param options - Processing options including folder path and output path
   * @returns Object mapping file names to their CIDs
   */
  public async process(options: ProcessingOptions): Promise<FileMapping> {
    this.validateOptions(options);
    this.logProcessingStart(options);

    try {
      const files = await this.fileService.readFiles(options.folderPath);

      if (isEmptyArray(files)) {
        this.logger.warn(`No files found in folder: ${options.folderPath}`);
        return {};
      }

      const cidMapping = await this.cidCalculatorService.calculateCIDs(files);
      const sortedMapping = ObjectUtils.sortObjectByKeys(cidMapping) as FileMapping;

      await this.fileService.saveJson(options.outputPath, sortedMapping);
      this.logProcessingComplete(files.length);

      return sortedMapping;
    } catch (error) {
      this.handleError(error);
    }
  }
}
