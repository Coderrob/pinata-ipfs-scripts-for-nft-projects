/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

// Export feature-based type structure
export * from './pinata';
export * from './file-processing';
export * from './commands';

// Re-export for backward compatibility
export type {
  PinataConfig,
  IPinataResponse as PinataResponse,
  IPinataPin as PinataPin,
  IPinListResponse as PinListResponse,
  IPinataService,
} from './pinata';
export { PinStatus } from './pinata';

export type {
  HashResult,
  CIDResult,
  UploadResult,
  FileMapping,
  IFileService,
  IHashCalculator,
  ICIDCalculator,
  IFileProcessor,
} from './file-processing';

export type { RateLimitConfig, ProcessingOptions, CommandOptions } from './commands';
