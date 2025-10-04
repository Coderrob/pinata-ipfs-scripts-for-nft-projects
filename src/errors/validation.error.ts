import { BaseApplicationError, ErrorContext, ErrorCode, ErrorSeverity } from './base-error';

/**
 * Validation related errors
 */

export class ValidationError extends BaseApplicationError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.VALIDATION_ERROR, ErrorSeverity.LOW, context, false, cause);
  }
}
