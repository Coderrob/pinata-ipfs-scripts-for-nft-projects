/**
 * MIT License
 * Copyright (c) 2022 Rob (Coderrob) Lindley
 */

import { Command } from 'commander';

import { FileUploadProcessor } from '../core';
import { CommandOptions, UploadResult } from '../types';
import { isFailure } from '../utils';
import { BaseCommand } from './base.command';
import { DefaultOutputs, OptionGroups } from './options';

export class UploadFilesCommand extends BaseCommand {
  constructor() {
    super('UploadFilesCommand');
  }

  public configure(program: Command): void {
    const command = program.command('upload-files').description('Upload individual files to Pinata IPFS');

    // Add reusable options
    OptionGroups.uploadFiles.forEach(option => {
      command.addOption(option);
    });

    // Set default for output if not specified
    command.option('-o, --output <path>', 'Output path for upload results', DefaultOutputs.uploadedFiles);

    command.action(async (...args: unknown[]) => {
      const options = (args[0] ?? {}) as CommandOptions;
      await this.execute(options);
    });
  }

  private async execute(options: CommandOptions): Promise<void> {
    try {
      this.validateOptions(options);
      this.logger.info('Starting file upload process');

      const rateLimitConfig = this.buildRateLimitConfig(options);
      const processor = this.createProcessor(rateLimitConfig);
      const processingOptions = this.buildProcessingOptions(options, rateLimitConfig);

      const results = await processor.process(processingOptions);
      this.reportResults(results);
    } catch (error) {
      this.handleError(error);
    }
  }

  /**
   * Constructs rate limit configuration for the upload processor.
   * @param options - User supplied command options.
   * @returns Rate limiting configuration object.
   */
  private buildRateLimitConfig(options: CommandOptions): { maxConcurrent: number; minTime: number } {
    return {
      maxConcurrent: options.concurrent ?? 1,
      minTime: options.minTime ?? 3000,
    };
  }

  /**
   * Creates the file upload processor with resolved dependencies.
   * @param rateLimitConfig - Rate limiting configuration.
   * @returns Configured file upload processor instance.
   */
  private createProcessor(rateLimitConfig: { maxConcurrent: number; minTime: number }) {
    const config = this.getPinataConfig();
    return new FileUploadProcessor(config, rateLimitConfig);
  }

  /**
   * Generates processing options consumed by the file upload processor.
   * @param options - Command options provided by the user.
   * @param rateLimitConfig - Rate limiting configuration.
   * @returns Processing options ready for execution.
   */
  private buildProcessingOptions(
    options: CommandOptions,
    rateLimitConfig: { maxConcurrent: number; minTime: number }
  ) {
    return {
      folderPath: options.folder ?? 'files',
      outputPath: options.output ?? './output/uploaded-files.json',
      rateLimitConfig,
    };
  }

  /**
   * Summarises results and emits structured logs for successes and failures.
   * @param results - Result set returned by the processor.
   */
  private reportResults(results: UploadResult[]): void {
    const successCount = results.filter(result => result.success).length;
    const failureCount = results.length - successCount;

    if (failureCount > 0) {
      this.logFailureDetails(results, failureCount);
    }

    this.logSuccess(`File upload completed: ${successCount} successful, ${failureCount} failed`);
  }

  /**
   * Logs detailed failure information for unsuccessful uploads.
   * @param results - Result set returned by the processor.
   * @param failureCount - Number of failed uploads.
   */
  private logFailureDetails(results: UploadResult[], failureCount: number): void {
    this.logger.warn(`Upload completed with ${failureCount} failures out of ${results.length} files`);
    results.filter(isFailure).forEach(result => {
      this.logger.error(`Failed to upload ${result.fileName}: ${result.error}`);
    });
  }
}
