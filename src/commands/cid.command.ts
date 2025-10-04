/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command } from 'commander';

import { CIDProcessor } from '../core';
import { CommandOptions } from '../types';
import { BaseCommand } from './base.command';
import { DefaultOutputs, OptionGroups } from './options';

export class CIDCommand extends BaseCommand {
  constructor() {
    super('CIDCommand');
  }

  public configure(program: Command): void {
    const command = program.command('cid').description('Calculate IPFS CIDs for files in a folder');

    // Add reusable options
    OptionGroups.batchProcessing.forEach(option => {
      command.addOption(option);
    });

    // Set default for output if not specified
    command.option('-o, --output <path>', 'Output path for CID results', DefaultOutputs.fileCids);

    command.action(async (options: CommandOptions) => {
      await this.execute(options);
    });
  }

  private async execute(options: CommandOptions): Promise<void> {
    try {
      this.validateOptions(options);
      this.logger.info('Starting CID calculation process');

      const processor = new CIDProcessor(this.createRateLimitConfig(options));

      const processingOptions = {
        folderPath: options.folder || 'files',
        outputPath: options.output || './output/file-cids.json',
      };

      const cidMapping = await processor.process(processingOptions);
      const fileCount = Object.keys(cidMapping).length;

      this.logSuccess(`CID calculation completed for ${fileCount} files`);
    } catch (error) {
      this.handleError(error);
    }
  }
}
