/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

/**
 * Result of hash calculation operation
 */
export interface HashResult {
  readonly fileName: string;
  readonly hash: string;
}

/**
 * Result of CID calculation operation
 */
export interface CIDResult {
  readonly fileName: string;
  readonly cid: string;
}

/**
 * Result of upload operation
 */
export interface UploadResult {
  readonly fileName: string;
  readonly cid: string;
  readonly success: boolean;
  readonly error?: string;
}

/**
 * File mapping interface for hash/CID mappings
 */
export interface FileMapping {
  [fileName: string]: string;
}
