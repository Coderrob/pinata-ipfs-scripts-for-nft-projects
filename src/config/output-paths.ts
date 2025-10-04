/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

/**
 * Centralized configuration for default output paths
 */
export const OutputPaths = {
  // Base output directory
  BASE_DIR: './output',

  // Default output files for each command type
  FILES: {
    fileHashes: './output/file-hashes.json',
    fileCids: './output/file-cids.json',
    uploadedFiles: './output/uploaded-files.json',
    folderCid: './output/folder-cid.json',
    downloadedCids: './output/downloaded-cids.json',
    hashOfHashes: './output/file-hashOfHashes.json',
  },

  // Helper to create a custom output path
  createPath: (filename: string): string => `./output/${filename}`,
} as const;

/**
 * Legacy compatibility - can be removed once all references are updated
 * @deprecated Use OutputPaths.FILES instead
 */
export const DefaultOutputs = OutputPaths.FILES;
