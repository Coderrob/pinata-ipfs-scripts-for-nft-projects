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
   * Output path option - used by: all commands
   */
  static readonly output = new Option('-o, --output <path>', 'Output path for results');

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
