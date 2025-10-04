import { BaseApplicationError, ErrorCode, ErrorContext, ErrorSeverity } from './base-error';

/**
 * Processing related errors
 */

export class ProcessingError extends BaseApplicationError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.PROCESSING_FAILED,
    context: ErrorContext = {},
    cause?: Error
  ) {
    super(message, code, ErrorSeverity.MEDIUM, context, false, cause);
  }
}
