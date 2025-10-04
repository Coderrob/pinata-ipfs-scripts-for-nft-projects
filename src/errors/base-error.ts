/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

/**
 * Error codes for application errors
 */
export enum ErrorCode {
  // Configuration errors
  CONFIG_INVALID = 'CONFIG_INVALID',
  CONFIG_MISSING = 'CONFIG_MISSING',

  // File system errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_ACCESS_DENIED = 'FILE_ACCESS_DENIED',
  DIRECTORY_NOT_FOUND = 'DIRECTORY_NOT_FOUND',
  DIRECTORY_ACCESS_DENIED = 'DIRECTORY_ACCESS_DENIED',

  // Network errors
  NETWORK_TIMEOUT = 'NETWORK_TIMEOUT',
  NETWORK_UNAVAILABLE = 'NETWORK_UNAVAILABLE',
  API_ERROR = 'API_ERROR',

  // Pinata specific errors
  PINATA_AUTH_FAILED = 'PINATA_AUTH_FAILED',
  PINATA_UPLOAD_FAILED = 'PINATA_UPLOAD_FAILED',
  PINATA_RATE_LIMITED = 'PINATA_RATE_LIMITED',

  // Processing errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PROCESSING_FAILED = 'PROCESSING_FAILED',
  HASH_CALCULATION_FAILED = 'HASH_CALCULATION_FAILED',
  CID_CALCULATION_FAILED = 'CID_CALCULATION_FAILED',

  // System errors
  INSUFFICIENT_MEMORY = 'INSUFFICIENT_MEMORY',
  DISK_FULL = 'DISK_FULL',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface IApplicationError {
  name: string;
  message: string;
  code: ErrorCode;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: string;
  isRetryable: boolean;
  stack?: string;
}

/**
 * Error context interface
 */
export interface ErrorContext {
  readonly operation?: string;
  readonly requestId?: string;
  readonly userId?: string;
  readonly fileName?: string;
  readonly filePath?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Base application error class
 */
export abstract class BaseApplicationError extends Error implements IApplicationError {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly timestamp: string;
  public readonly isRetryable: boolean;
  public readonly cause?: Error;

  constructor(
    message: string,
    code: ErrorCode,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {},
    isRetryable: boolean = false,
    cause?: Error
  ) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date().toISOString();
    this.isRetryable = isRetryable;

    if (cause) {
      this.cause = cause;
    }

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Get serializable error information
   */
  public toJSON(): IApplicationError {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: IApplicationError = {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      ...(this.stack && { stack: this.stack }),
      timestamp: this.timestamp,
      isRetryable: this.isRetryable,
    };

    return result;
  }
}
