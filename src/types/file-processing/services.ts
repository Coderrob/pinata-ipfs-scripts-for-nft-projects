/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import type { BinaryToTextEncoding } from 'crypto';

import { ProcessingOptions } from '../commands';

/**
 * Service interface for file operations
 */
export interface IFileService {
  getFiles(folderPath: string): Promise<string[]>;
  ensureDirectoryExists(dirPath: string): Promise<void>;
  writeJsonFile(filePath: string, data: unknown): Promise<void>;
}

/**
 * Service interface for hash calculations
 */
export interface IHashCalculator {
  calculateHash(filePath: string): Promise<string>;
  calculateHashOfHashes(hashes: string[]): Promise<string>;
}

/**
 * Service interface for CID calculations
 */
export interface ICIDCalculator {
  calculateCID(filePath: string): Promise<string>;
}

/**
 * Generic file processor interface
 */
export interface IFileProcessor<TResult> {
  process(options: ProcessingOptions): Promise<TResult>;
}

/**
 * Strategy interface describing how to produce a digest from file content.
 */
export interface IFileDigestStrategy<TResult> {
  readonly name: string;
  readonly algorithm: string;
  digest(content: Buffer): Promise<TResult> | TResult;
}

/**
 * Hash-specific strategy that provides additional encoding metadata.
 * Implementations must be synchronous to support deterministic aggregation pipelines.
 */
export interface IHashDigestStrategy extends IFileDigestStrategy<string> {
  readonly encoding: BinaryToTextEncoding;
  digest(content: Buffer): string;
}
