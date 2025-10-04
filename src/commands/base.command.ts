/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Command } from 'commander';

import { CommandOptions, PinataConfig } from '../types';
import { isDefined, isNonEmptyString, isNumberInRange, Logger } from '../utils';

export abstract class BaseCommand {
  protected readonly logger: Logger;

  constructor(protected readonly commandName: string) {
    this.logger = new Logger(commandName);
  }

  /**
   * Abstract method to configure the command
   * @param program - Commander program instance
   */
  public abstract configure(program: Command): void;

  /**
   * Gets Pinata configuration from environment variables
   * @returns Pinata configuration object
   */
  protected getPinataConfig(): PinataConfig {
    const apiKey = process.env.PINATA_API_KEY;
    const apiSecret = process.env.PINATA_API_SECRET;

    if (!isNonEmptyString(apiKey) || !isNonEmptyString(apiSecret)) {
      throw new Error('PINATA_API_KEY and PINATA_API_SECRET environment variables are required');
    }

    return { apiKey, apiSecret };
  }

  /**
   * Validates common command options
   * @param options - Command options to validate
   */
  protected validateOptions(options: CommandOptions): void {
    this.ensureOptionalPath(options.folder, 'Folder path cannot be empty');
    this.ensureOptionalPath(options.output, 'Output path cannot be empty');
    this.ensureOptionalNumber(options.concurrent, 1, 10, 'Concurrent operations must be between 1 and 10');
    this.ensureOptionalNumber(options.minTime, 100, Infinity, 'Minimum time between operations must be at least 100ms');
  }

  /**
   * Creates rate limiting configuration from options
   * @param options - Command options
   * @returns Rate limiting configuration
   */
  protected createRateLimitConfig(options: CommandOptions) {
    return {
      maxConcurrent: options.concurrent || 5,
      minTime: options.minTime,
    };
  }

  /**
   * Handles command execution errors
   * @param error - The error that occurred
   */
  protected handleError(error: unknown): void {
    this.logger.error('Command execution failed', error);
    process.exit(1);
  }

  /**
   * Logs command completion
   * @param message - Completion message
   */
  protected logSuccess(message: string): void {
    this.logger.info(`?o. ${message}`);
  }

  /**
   * Validates optional string-based options.
   * @param value - Option value to validate.
   * @param errorMessage - Message to throw when invalid.
   */
  private ensureOptionalPath(value: string | undefined, errorMessage: string): void {
    if (!isDefined(value)) {
      return;
    }

    if (!isNonEmptyString(value)) {
      throw new Error(errorMessage);
    }
  }

  /**
   * Validates optional numeric options bound by a range.
   * @param value - Numeric value to validate.
   * @param min - Inclusive lower bound.
   * @param max - Inclusive upper bound.
   * @param errorMessage - Message to throw when invalid.
   */
  private ensureOptionalNumber(value: number | undefined, min: number, max: number, errorMessage: string): void {
    if (!isDefined(value)) {
      return;
    }

    if (!isNumberInRange(value, min, max)) {
      throw new Error(errorMessage);
    }
  }
}
