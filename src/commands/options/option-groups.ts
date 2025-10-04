/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { PathOptions } from './path.options';
import { PinataOptions } from './pinata.options';
import { RateLimitOptions } from './rate-limit.options';

/**
 * Pre-configured option groups for specific command types
 */
export class OptionGroups {
  /**
   * Standard file processing options (folder + output)
   */
  static readonly fileProcessing = [PathOptions.folder, PathOptions.output];

  /**
   * Upload files options (folder + output + concurrency + rate limiting)
   */
  static readonly uploadFiles = [
    PathOptions.folder,
    PathOptions.output,
    RateLimitOptions.concurrentUploads,
    RateLimitOptions.minTime,
  ];

  /**
   * Upload folder options (metadata folder + output + name)
   */
  static readonly uploadFolder = [PathOptions.metadataFolder, PathOptions.output, PinataOptions.displayName];

  /**
   * Batch processing options (folder + output + concurrency)
   */
  static readonly batchProcessing = [PathOptions.folder, PathOptions.output, RateLimitOptions.concurrent];

  /**
   * Hash calculation options (includes final output for hash of hashes)
   */
  static readonly hashCalculation = [
    PathOptions.folder,
    PathOptions.output,
    PathOptions.finalOutput,
    RateLimitOptions.concurrent,
  ];

  /**
   * Download options (output + status filter)
   */
  static readonly download = [PathOptions.output, PinataOptions.status];
}

/**
 * Default output paths for different command types
 */
export const DefaultOutputs = {
  fileHashes: './output/file-hashes.json',
  fileCids: './output/file-cids.json',
  uploadedFiles: './output/uploaded-files.json',
  folderCid: './output/folder-cid.json',
  downloadedCids: './output/downloaded-cids.json',
  hashOfHashes: './output/file-hashOfHashes.json',
} as const;
