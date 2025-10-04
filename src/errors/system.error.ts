import { BaseApplicationError, ErrorCode, ErrorContext, ErrorSeverity } from './base-error';

/**
 * System resource related errors
 */

export class SystemError extends BaseApplicationError {
  constructor(message: string, code: ErrorCode = ErrorCode.UNKNOWN_ERROR, context: ErrorContext = {}, cause?: Error) {
    const severity = [ErrorCode.INSUFFICIENT_MEMORY, ErrorCode.DISK_FULL].includes(code)
      ? ErrorSeverity.CRITICAL
      : ErrorSeverity.HIGH;

    super(message, code, severity, context, false, cause);
  }
}
