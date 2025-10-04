/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { LogContext, StructuredLogger } from '../observability';
import { SystemError } from './system.error';
import { PinataError } from './pinata.error';
import { NetworkError } from './network.error';
import { FileSystemError } from './file-system.error';
import { BaseApplicationError, ErrorCode } from './base-error';

/**
 * Error handler utility for centralized error processing
 */
export class ErrorHandler {
  private readonly logger: StructuredLogger;

  constructor(context: string = 'ErrorHandler') {
    this.logger = new StructuredLogger(context);
  }

  /**
   * Handle and log application errors
   */
  public handleError(error: Error | BaseApplicationError, operation?: string): never {
    if (error instanceof BaseApplicationError) {
      this.logApplicationError(error, operation);
    } else {
      this.logUnknownError(error, operation);
    }

    throw error;
  }

  /**
   * Handle errors with recovery attempt
   */
  public async handleErrorWithRecovery<T>(
    error: Error | BaseApplicationError,
    operation: string,
    recoveryFn?: () => Promise<T>
  ): Promise<T> {
    if (error instanceof BaseApplicationError) {
      this.logApplicationError(error, operation);

      if (error.isRetryable && recoveryFn) {
        this.logger.info('Attempting error recovery', {
          operation,
          errorCode: error.code,
          isRetryable: error.isRetryable,
        });

        try {
          return await recoveryFn();
        } catch (recoveryError) {
          this.logger.error('Error recovery failed', recoveryError as Error, {
            operation,
            metadata: { originalError: error.code },
          });
          throw error; // Throw original error
        }
      }
    } else {
      this.logUnknownError(error, operation);
    }

    throw error;
  }

  /**
   * Convert unknown errors to application errors
   */
  public normalizeError(error: unknown, operation?: string): BaseApplicationError {
    if (error instanceof BaseApplicationError) {
      return error;
    }

    if (error instanceof Error) {
      return this.normalizeFromErrorInstance(error, operation);
    }

    return this.createSystemErrorForUnknown(error, operation);
  }

  /**
   * Create retry wrapper for operations
   */
  public async withRetry<T>(
    operation: () => Promise<T>,
    operationName: string,
    maxRetries: number = 3,
    backoffMs: number = 1000
  ): Promise<T> {
    let lastError: BaseApplicationError | undefined;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        this.logger.debug('Executing operation', {
          operation: operationName,
          attempt,
          maxRetries,
        });

        return await operation();
      } catch (error) {
        const normalizedError = this.normalizeError(error, operationName);
        lastError = normalizedError;

        this.logRetryFailure(normalizedError, operationName, attempt, maxRetries);

        if (!this.shouldRetry(normalizedError, attempt, maxRetries)) {
          break;
        }

        await this.delayWithBackoff(backoffMs, attempt, operationName);
      }
    }

    if (!lastError) {
      throw new SystemError('Operation failed without captured error', ErrorCode.UNKNOWN_ERROR, {
        operation: operationName,
      });
    }

    throw lastError;
  }

  /**
   * Log application error with structured context
   */
  private logApplicationError(error: BaseApplicationError, operation?: string): void {
    const effectiveOperation = operation || error.context.operation;
    const logContext: LogContext = {
      ...(effectiveOperation && { operation: effectiveOperation }),
      ...(error.context.requestId && { requestId: error.context.requestId }),
      metadata: {
        code: error.code,
        severity: error.severity,
        isRetryable: error.isRetryable,
        timestamp: error.timestamp,
        context: error.context,
      },
    };

    this.logger.error(`${error.constructor.name}: ${error.message}`, error, logContext);
  }

  /**
   * Log unknown error
   */
  private logUnknownError(error: Error, operation?: string): void {
    this.logger.error(`Unhandled error: ${error.message}`, error, {
      ...(operation && { operation }),
      metadata: {
        errorName: error.name,
        errorType: 'unhandled',
      },
    });
  }

  /**
   * Normalizes known error instances into application errors.
   * @param error - Original error instance.
   * @param operation - Optional operation identifier.
   * @returns Categorised application error.
   */
  private normalizeFromErrorInstance(error: Error, operation?: string): BaseApplicationError {
    const context = this.buildOperationContext(operation);

    if (this.isNetworkError(error)) {
      return new NetworkError(error.message, ErrorCode.NETWORK_UNAVAILABLE, context, true, error);
    }

    if (this.isFileSystemError(error)) {
      return new FileSystemError(error.message, ErrorCode.FILE_ACCESS_DENIED, context, error);
    }

    if (this.isPinataError(error)) {
      return new PinataError(error.message, ErrorCode.PINATA_UPLOAD_FAILED, context, true, error);
    }

    return new SystemError(error.message, ErrorCode.UNKNOWN_ERROR, context, error);
  }

  /**
   * Creates a system error for unknown error payloads.
   * @param error - Unknown error payload.
   * @param operation - Optional operation identifier.
   * @returns Wrapped system error instance.
   */
  private createSystemErrorForUnknown(error: unknown, operation?: string): BaseApplicationError {
    const message = typeof error === 'string' ? error : 'Unknown error occurred';
    return new SystemError(message, ErrorCode.UNKNOWN_ERROR, this.buildOperationContext(operation));
  }

  /**
   * Builds contextual metadata for error instances.
   * @param operation - Optional operation identifier.
   * @returns Context object for error constructors.
   */
  private buildOperationContext(operation?: string): Record<string, unknown> {
    return operation ? { operation } : {};
  }

  /**
   * Emits retry failure telemetry.
   * @param error - Normalized error instance.
   * @param operationName - Name of the operation.
   * @param attempt - Current attempt count.
   * @param maxRetries - Maximum allowed retries.
   */
  private logRetryFailure(
    error: BaseApplicationError,
    operationName: string,
    attempt: number,
    maxRetries: number
  ): void {
    this.logger.warn('Operation failed', undefined, {
      operation: operationName,
      metadata: {
        attempt,
        maxRetries,
        errorCode: error.code,
        isRetryable: error.isRetryable,
        willRetry: this.shouldRetry(error, attempt, maxRetries),
      },
    });
  }

  /**
   * Determines whether the operation should be retried.
   * @param error - Normalized error instance.
   * @param attempt - Current attempt count.
   * @param maxRetries - Maximum allowed retries.
   */
  private shouldRetry(error: BaseApplicationError, attempt: number, maxRetries: number): boolean {
    return error.isRetryable && attempt < maxRetries;
  }

  /**
   * Waits for the exponential backoff interval before retrying.
   * @param backoffMs - Base backoff duration in milliseconds.
   * @param attempt - Current attempt count.
   * @param operationName - Name of the operation being retried.
   */
  private async delayWithBackoff(backoffMs: number, attempt: number, operationName: string): Promise<void> {
    const delay = backoffMs * 2 ** (attempt - 1);
    this.logger.debug('Retrying after delay', {
      operation: operationName,
      delay,
      nextAttempt: attempt + 1,
    });

    await new Promise(resolve => {
      setTimeout(resolve, delay);
    });
  }

  /**
   * Check if error is network related
   */
  private isNetworkError(error: Error): boolean {
    const networkErrorPatterns = [/ECONNREFUSED/, /ENOTFOUND/, /ETIMEDOUT/, /ECONNRESET/, /timeout/i, /network/i];

    return networkErrorPatterns.some(pattern => pattern.test(error.message) || pattern.test(error.name));
  }

  /**
   * Check if error is file system related
   */
  private isFileSystemError(error: Error): boolean {
    const fsErrorPatterns = [/ENOENT/, /EACCES/, /EPERM/, /EMFILE/, /ENFILE/, /no such file/i, /permission denied/i];

    return fsErrorPatterns.some(pattern => pattern.test(error.message) || pattern.test(error.name));
  }

  /**
   * Check if error is Pinata API related
   */
  private isPinataError(error: Error): boolean {
    const pinataErrorPatterns = [
      /pinata/i,
      /ipfs/i,
      /unauthorized/i,
      /401/,
      /403/,
      /429/, // Rate limiting
    ];

    return pinataErrorPatterns.some(pattern => pattern.test(error.message) || pattern.test(error.name));
  }
}
