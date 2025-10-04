/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import Bottleneck from 'bottleneck';

import { IFileProcessor, ProcessingOptions, RateLimitConfig } from '../types';
import { isNonEmptyString, Logger } from '../utils';

export abstract class BaseFileProcessor<TResult> implements IFileProcessor<TResult> {
  protected readonly logger: Logger;
  protected readonly rateLimiter: Bottleneck;

  constructor(
    protected readonly processorName: string,
    rateLimitConfig: RateLimitConfig = { maxConcurrent: 5 }
  ) {
    this.logger = new Logger(processorName);
    this.rateLimiter = new Bottleneck(rateLimitConfig);
  }

  /**
   * Abstract method to be implemented by concrete processors
   */
  public abstract process(options: ProcessingOptions): Promise<TResult>;

  /**
   * Validates processing options
   * @param options - The processing options to validate
   */
  protected validateOptions(options: ProcessingOptions): void {
    if (!isNonEmptyString(options.folderPath)) {
      throw new Error('Folder path is required');
    }

    if (!isNonEmptyString(options.outputPath)) {
      throw new Error('Output path is required');
    }
  }

  /**
   * Logs the start of processing
   * @param options - The processing options
   */
  protected logProcessingStart(options: ProcessingOptions): void {
    this.logger.info(`Starting ${this.processorName} processing`, {
      folderPath: options.folderPath,
      outputPath: options.outputPath,
    });
  }

  /**
   * Logs the completion of processing
   * @param fileCount - Number of files processed
   */
  protected logProcessingComplete(fileCount: number): void {
    this.logger.info(`${this.processorName} processing completed`, {
      filesProcessed: fileCount,
    });
  }

  /**
   * Handles processing errors
   * @param error - The error that occurred
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected handleError(error: any): never {
    this.logger.error(`${this.processorName} processing failed`, error);
    throw error;
  }
}
