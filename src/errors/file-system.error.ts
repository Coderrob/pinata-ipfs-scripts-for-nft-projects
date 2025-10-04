import { BaseApplicationError, ErrorCode, ErrorContext, ErrorSeverity } from './base-error';

/**
 * File system related errors
 */

export class FileSystemError extends BaseApplicationError {
  constructor(message: string, code: ErrorCode = ErrorCode.FILE_NOT_FOUND, context: ErrorContext = {}, cause?: Error) {
    super(message, code, ErrorSeverity.MEDIUM, context, false, cause);
  }
}
