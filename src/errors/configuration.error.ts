import { BaseApplicationError, ErrorContext, ErrorCode, ErrorSeverity } from './base-error';

/**
 * Configuration related errors
 */

export class ConfigurationError extends BaseApplicationError {
  constructor(message: string, context: ErrorContext = {}, cause?: Error) {
    super(message, ErrorCode.CONFIG_INVALID, ErrorSeverity.HIGH, context, false, cause);
  }
}
