import { BaseApplicationError, ErrorCode, ErrorContext, ErrorSeverity } from './base-error';

/**
 * Pinata API specific errors
 */

export class PinataError extends BaseApplicationError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.PINATA_UPLOAD_FAILED,
    context: ErrorContext = {},
    isRetryable: boolean = true,
    cause?: Error
  ) {
    const severity = code === ErrorCode.PINATA_AUTH_FAILED ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    super(message, code, severity, context, isRetryable, cause);
  }
}
