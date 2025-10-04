/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command } from 'commander';

import { FolderUploadProcessor } from '../core';
import { CommandOptions } from '../types';
import { BaseCommand } from './base.command';
import { DefaultOutputs, OptionGroups } from './options';

export class UploadFolderCommand extends BaseCommand {
  constructor() {
    super('UploadFolderCommand');
  }

  public configure(program: Command): void {
    const command = program.command('upload-folder').description('Upload an entire folder to Pinata IPFS');

    // Add reusable options
    OptionGroups.uploadFolder.forEach(option => {
      command.addOption(option);
    });

    // Set default for output if not specified
    command.option('-o, --output <path>', 'Output path for upload result', DefaultOutputs.folderCid);

    command.action(async (options: CommandOptions & { name?: string }) => {
      await this.execute(options);
    });
  }

  private async execute(options: CommandOptions & { name?: string }): Promise<void> {
    try {
      this.validateOptions(options);
      this.logger.info('Starting folder upload process');

      const config = this.getPinataConfig();
      const processor = new FolderUploadProcessor(config);

      const processingOptions = {
        folderPath: options.folder || 'metadata',
        outputPath: options.output || './output/folder-cid.json',
      };

      const result = await processor.process(processingOptions, options.name);

      if (result.success) {
        this.logSuccess(`Folder '${result.folderName}' uploaded successfully. CID: ${result.cid}`);
      } else {
        throw new Error(`Folder upload failed: ${result.error}`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }
}
