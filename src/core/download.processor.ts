/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { PinataService } from '../services';
import { FileMapping, PinataConfig, PinStatus, ProcessingOptions } from '../types';
import { isEmptyObject } from '../utils/guards';
import { BaseFileProcessor } from './base.processor';

export class DownloadProcessor extends BaseFileProcessor<FileMapping> {
  private readonly pinataService: PinataService;

  constructor(config: PinataConfig) {
    super('DownloadProcessor');
    this.pinataService = new PinataService(config);
  }

  /**
   * Downloads CID mappings from Pinata
   * @param options - Processing options including output path
   * @param status - Pin status filter (default: ALL)
   * @returns Object mapping file names to their CIDs
   */
  public async process(options: ProcessingOptions, status: PinStatus = PinStatus.ALL): Promise<FileMapping> {
    this.validateOptions(options);
    this.logProcessingStart(options);

    try {
      const cidMappings = await this.pinataService.downloadCIDMappings(status);

      if (isEmptyObject(cidMappings)) {
        this.logger.warn('No CID mappings found');
        return {};
      }

      // Log the mappings in table format
      console.table(cidMappings);

      // Save the mappings
      const { FileService } = await import('../services');
      const fileService = new FileService();
      await fileService.saveJson(options.outputPath, cidMappings);

      this.logProcessingComplete(Object.keys(cidMappings).length);
      return cidMappings;
    } catch (error) {
      this.handleError(error);
    }
  }
}
