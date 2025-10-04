/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command } from 'commander';

import { HashProcessor } from '../core';
import { CommandOptions } from '../types';
import { BaseCommand } from './base.command';
import { CommandBuilder } from './command-builder';

/**
 * Alternative implementation using CommandBuilder pattern
 * This demonstrates how to use the CommandBuilder for cleaner command setup
 */
export class HashCommand extends BaseCommand {
  constructor() {
    super('HashCommand');
  }

  public configure(program: Command): void {
    const command = new CommandBuilder('hash', 'Calculate SHA-256 hashes for files in a folder (v2)')
      .addHashCalculationOptions()
      .setDefaultOutput('fileHashes')
      .setAction(async (...args: unknown[]) => {
        const options = (args[0] ?? {}) as CommandOptions & { finalOutput?: string };
        await this.execute(options);
      })
      .build();

    program.addCommand(command);
  }

  private async execute(options: CommandOptions & { finalOutput?: string }): Promise<void> {
    try {
      this.validateOptions(options);
      this.logger.info('Starting hash calculation process (v2)');

      const processor = new HashProcessor(this.createRateLimitConfig(options));

      const processingOptions = {
        folderPath: options.folder || 'files',
        outputPath: options.output || './output/file-hashes.json',
      };

      if (options.finalOutput) {
        // Calculate both regular hashes and hash of hashes
        const finalHash = await processor.processWithFinalHash(processingOptions, options.finalOutput);
        this.logSuccess(`Hash calculation completed. Final hash: ${finalHash}`);
      } else {
        // Calculate only regular hashes
        const hashMapping = await processor.process(processingOptions);
        const fileCount = Object.keys(hashMapping).length;
        this.logSuccess(`Hash calculation completed for ${fileCount} files`);
      }
    } catch (error) {
      this.handleError(error);
    }
  }
}
