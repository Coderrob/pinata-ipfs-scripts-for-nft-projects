/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import Bottleneck from 'bottleneck';
import { createHash, type BinaryToTextEncoding } from 'crypto';

import { FileMapping, IHashCalculator, IHashDigestStrategy } from '../types';
import { FileUtils } from '../utils';
import { RateLimitedFileMappingDependencies, RateLimitedFileMappingService } from './rate-limited-file-mapping.service';

/**
 * Dependencies for HashCalculatorService allowing custom strategies and collaborators.
 */
export type HashCalculatorDependencies = RateLimitedFileMappingDependencies & {
  /**
   * Strategy used to convert file content into a hash digest.
   */
  readonly hashStrategy?: IHashDigestStrategy;
};

/**
 * Default hashing strategy that leverages Node's crypto implementation.
 */
class NodeCryptoHashStrategy implements IHashDigestStrategy {
  public readonly name: string;

  constructor(
    public readonly algorithm: string = 'sha256',
    public readonly encoding: BinaryToTextEncoding = 'hex'
  ) {
    this.name = `crypto:${algorithm}:${encoding}`;
  }

  /**
   * Generates a digest for the provided content.
   * @param content - Content to hash.
   */
  public digest(content: Buffer): string {
    return createHash(this.algorithm).update(content).digest(this.encoding);
  }
}

export class HashCalculatorService
  extends RateLimitedFileMappingService<string, FileMapping>
  implements IHashCalculator
{
  private readonly hashStrategy: IHashDigestStrategy;

  constructor(rateLimiter: Bottleneck, dependencies: HashCalculatorDependencies = {}) {
    super(rateLimiter, 'HashCalculatorService', dependencies);
    this.hashStrategy = dependencies.hashStrategy ?? new NodeCryptoHashStrategy();
  }

  /**
   * Calculates SHA-256 hash for a single file (interface method)
   * @param filePath - Path to the file
   * @returns SHA-256 hash of the file
   */
  public async calculateHash(filePath: string): Promise<string> {
    const fileName = FileUtils.getFileName(filePath);

    try {
      const fileData = this.readFileContent(filePath);
      const hash = this.hashStrategy.digest(fileData);
      this.logger.info(`${fileName} hash calculated`, {
        hash,
        algorithm: this.hashStrategy.algorithm,
        encoding: this.hashStrategy.encoding,
      });
      return hash;
    } catch (error) {
      this.logger.error(`Failed to calculate hash for file: ${fileName}`, error);
      throw error;
    }
  }

  /**
   * Calculates SHA-256 hashes for all files in the provided array
   * @param files - Array of file paths
   * @returns Object mapping file names to their SHA-256 hashes
   */
  public async calculateHashes(files: string[]): Promise<FileMapping> {
    return this.processFiles(files);
  }

  /**
   * Calculates hash of all hashes concatenated (interface method)
   * @param hashes - Array of hash strings
   * @returns Single hash representing all file hashes
   */
  public async calculateHashOfHashes(hashes: string[]): Promise<string> {
    const concatenated = hashes.join('');
    this.logger.info('Calculating hash of concatenated hashes', {
      length: concatenated.length,
    });

    return this.computeAggregateHash(concatenated);
  }

  /**
   * Calculates hash of all hashes concatenated from FileMapping
   * @param hashes - Object containing file name to hash mappings
   * @returns Single hash representing all file hashes
   */
  public calculateHashOfHashesFromMapping(hashes: FileMapping): string {
    const concatenated = Object.values(hashes).join('');
    this.logger.info('Calculating hash of concatenated hashes', {
      length: concatenated.length,
    });

    return this.computeAggregateHash(concatenated);
  }

  /**
   * Provides a descriptive token for log messages.
   */
  protected getOperationToken(): string {
    return 'hashing';
  }

  /**
   * Computes the hash for the provided file content.
   * @param filePath - Path to the file being processed.
   * @param fileName - Name of the file being processed.
   * @param fileContent - File content buffer.
   */
  protected async computeResult(_: string, fileName: string, fileContent: Buffer): Promise<string> {
    const hash = this.hashStrategy.digest(fileContent);
    this.logger.debug(`${fileName} hash computed`, { hash });
    return hash;
  }

  /**
   * Logs final hash information once processing completes.
   * @param fileName - Name of the file processed.
   * @param result - Resulting hash for the file.
   */
  protected override onAfterProcessing(fileName: string, result: string): void {
    this.logger.info(`${fileName} SHA-256`, {
      hash: result,
      algorithm: this.hashStrategy.algorithm,
      encoding: this.hashStrategy.encoding,
    });
  }

  /**
   * Computes a final aggregated hash using the configured strategy.
   * @param concatenated - Concatenated string of hashes.
   * @returns Aggregated hash value.
   */
  private computeAggregateHash(concatenated: string): string {
    const finalHash = this.hashStrategy.digest(Buffer.from(concatenated, 'utf8'));
    this.logger.info('Hash of hashes calculated', {
      finalHash,
      algorithm: this.hashStrategy.algorithm,
      encoding: this.hashStrategy.encoding,
    });
    return finalHash;
  }
}
