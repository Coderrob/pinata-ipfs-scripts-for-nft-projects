/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { FileService, HashCalculatorService } from '../services';
import { FileMapping, ProcessingOptions } from '../types';
import { ObjectUtils } from '../utils';
import { isEmptyArray } from '../utils/guards';
import { BaseFileProcessor } from './base.processor';

export class HashProcessor extends BaseFileProcessor<FileMapping> {
  private readonly fileService = new FileService();
  private readonly hashCalculatorService: HashCalculatorService;

  constructor(rateLimitConfig = { maxConcurrent: 5 }) {
    super('HashProcessor', rateLimitConfig);
    this.hashCalculatorService = new HashCalculatorService(this.rateLimiter);
  }

  /**
   * Processes files to calculate their SHA-256 hashes
   * @param options - Processing options including folder path and output path
   * @returns Object mapping file names to their hashes
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

      const hashMapping = await this.hashCalculatorService.calculateHashes(files);
      const sortedMapping = ObjectUtils.sortObjectByKeys(hashMapping);

      await this.fileService.saveJson(options.outputPath, sortedMapping);
      this.logProcessingComplete(files.length);

      return sortedMapping;
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Processes files and calculates hash of all hashes
   * @param options - Processing options
   * @param finalOutputPath - Path for the final hash output
   * @returns The final hash of all hashes
   */
  public async processWithFinalHash(options: ProcessingOptions, finalOutputPath: string): Promise<string> {
    const hashMapping = await this.process(options);
    const hashValues = Object.values(hashMapping);
    const finalHash = await this.hashCalculatorService.calculateHashOfHashes(hashValues);

    await this.fileService.saveJson(finalOutputPath, finalHash);
    this.logger.info('Final hash calculated and saved', {
      hash: finalHash,
      path: finalOutputPath,
    });

    return finalHash;
  }
}
