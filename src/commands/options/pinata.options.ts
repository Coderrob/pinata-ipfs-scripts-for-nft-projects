/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { Option } from 'commander';

/**
 * Pinata-specific options used across multiple commands
 */
export class PinataOptions {
  /**
   * Display name for uploads - used by: upload-folder
   */
  static readonly displayName = new Option('-n, --name <name>', 'Display name for the folder in Pinata');

  /**
   * Pin status filter - used by: download
   */
  static readonly status = new Option('-s, --status <status>', 'Pin status filter (all|pinned|unpinned)')
    .choices(['all', 'pinned', 'unpinned'])
    .default('all');
}
