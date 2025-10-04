/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { isNonEmptyString } from './guards';
import { Logger } from './logger';

export class FileUtils {
  private static readonly logger = new Logger('FileUtils');

  /**
   * Gets the file name from a provided file path.
   * @param filePath - The file path to extract a file name from
   * @returns The file name from a file path; otherwise an empty string
   */
  public static getFileName(filePath: string): string {
    if (!isNonEmptyString(filePath)) {
      this.logger.warn('Empty file path provided');
      return '';
    }

    const fileName = filePath.replace(/^.*[\\/]/, '');
    if (!isNonEmptyString(fileName)) {
      this.logger.warn(`Could not extract file name from path: ${filePath}`);
      return '';
    }

    return fileName;
  }

  /**
   * Validates if a file path is valid and not empty
   * @param filePath - The file path to validate
   * @returns True if valid, false otherwise
   */
  public static isValidPath(filePath: string): boolean {
    return isNonEmptyString(filePath);
  }

  /**
   * Normalizes a file path by removing extra slashes and standardizing separators
   * @param filePath - The file path to normalize
   * @returns Normalized file path
   */
  public static normalizePath(filePath: string): string {
    if (!this.isValidPath(filePath)) {
      return '';
    }

    return filePath.replace(/[\\/]+/g, '/').replace(/\/$/, '');
  }
}
