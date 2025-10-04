/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Option } from 'commander';

/**
 * Common file system path options used across multiple commands
 */
export class PathOptions {
  /**
   * Folder path option - used by: upload-files, upload-folder, hash, cid
   */
  static readonly folder = new Option('-f, --folder <path>', 'Folder path containing files to process').default(
    'files'
  );

  /**
   * Create an output option with a specific default path
   */
  static createOutput(defaultPath?: string, description = 'Output path for results'): Option {
    const option = new Option('-o, --output <path>', description);
    if (defaultPath) {
      option.default(defaultPath);
    }
    return option;
  }

  /**
   * Basic output option without default - used when default is set elsewhere
   */
  static readonly output = PathOptions.createOutput();

  /**
   * Metadata folder specific option - used by: upload-folder
   */
  static readonly metadataFolder = new Option('-f, --folder <path>', 'Folder path to upload').default('metadata');

  /**
   * Additional output path for hash of hashes - used by: hash
   */
  static readonly finalOutput = new Option('--final-output <path>', 'Output path for hash of hashes').default(
    './output/file-hashOfHashes.json'
  );
}
