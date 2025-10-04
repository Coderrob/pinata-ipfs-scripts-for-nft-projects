import { BaseApplicationError, ErrorCode, ErrorContext, ErrorSeverity } from './base-error';

/**
 * Network related errors
 */

export class NetworkError extends BaseApplicationError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.NETWORK_UNAVAILABLE,
    context: ErrorContext = {},
    isRetryable: boolean = true,
    cause?: Error
  ) {
    super(message, code, ErrorSeverity.MEDIUM, context, isRetryable, cause);
  }
}
