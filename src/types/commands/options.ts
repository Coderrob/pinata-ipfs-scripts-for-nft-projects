/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

/**
 * Rate limiting configuration for concurrent operations
 */
export type RateLimitConfig = {
  readonly maxConcurrent: number;
  readonly minTime?: number;
};

/**
 * Processing options for file operations
 */
export type ProcessingOptions = {
  readonly folderPath: string;
  readonly outputPath: string;
  readonly rateLimitConfig?: RateLimitConfig;
};

/**
 * Command line options interface
 */
export type CommandOptions = {
  readonly folder?: string;
  readonly output?: string;
  readonly concurrent?: number;
  readonly minTime?: number;
};
