/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command } from 'commander';

import { DownloadProcessor } from '../core';
import { CommandOptions, PinStatus } from '../types';
import { BaseCommand } from './base.command';
import { DefaultOutputs, OptionGroups } from './options';

export class DownloadCommand extends BaseCommand {
  constructor() {
    super('DownloadCommand');
  }

  public configure(program: Command): void {
    const command = program.command('download').description('Download CID mappings from Pinata');

    // Add reusable options
    OptionGroups.download.forEach(option => {
      command.addOption(option);
    });

    // Set default for output if not specified
    command.option('-o, --output <path>', 'Output path for CID mappings', DefaultOutputs.downloadedCids);

    command.action(async (options: CommandOptions & { status?: string }) => {
      await this.execute(options);
    });
  }

  private async execute(options: CommandOptions & { status?: string }): Promise<void> {
    try {
      this.validateOptions(options);
      this.logger.info('Starting CID download process');

      const config = this.getPinataConfig();
      const processor = new DownloadProcessor(config);

      // Validate and convert status
      const status = this.validatePinStatus(options.status || 'all');

      const processingOptions = {
        folderPath: '', // Not used for download
        outputPath: options.output || './output/downloaded-cids.json',
      };

      const cidMappings = await processor.process(processingOptions, status);
      const count = Object.keys(cidMappings).length;

      this.logSuccess(`Downloaded ${count} CID mappings from Pinata`);
    } catch (error) {
      this.handleError(error);
    }
  }

  private validatePinStatus(status: string): PinStatus {
    const normalizedStatus = status.toLowerCase();

    switch (normalizedStatus) {
      case 'all':
        return PinStatus.ALL;
      case 'pinned':
        return PinStatus.PINNED;
      case 'unpinned':
        return PinStatus.UNPINNED;
      default:
        throw new Error(`Invalid pin status: ${status}. Use 'all', 'pinned', or 'unpinned'`);
    }
  }
}
