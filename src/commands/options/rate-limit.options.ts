/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Option } from 'commander';

/**
 * Rate limiting and concurrency options used across multiple commands
 */
export class RateLimitOptions {
  /**
   * Concurrent operations option - used by: upload-files, hash, cid
   */
  static readonly concurrent = new Option('-c, --concurrent <number>', 'Number of concurrent operations (1-10)')
    .argParser(value => parseInt(value, 10))
    .default(5);

  /**
   * Minimum time between operations option - used by: upload-files
   */
  static readonly minTime = new Option('--min-time <number>', 'Minimum time between uploads (ms)')
    .argParser(value => parseInt(value, 10))
    .default(3000);

  /**
   * Concurrent uploads specific option - used by: upload-files
   */
  static readonly concurrentUploads = new Option('-c, --concurrent <number>', 'Number of concurrent uploads (1-10)')
    .argParser(value => parseInt(value, 10))
    .default(1);
}
