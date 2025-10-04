/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import axios from 'axios';
import basePathConverter from 'base-path-converter';
import FormData from 'form-data';
import * as fs from 'fs-extra';
import { read } from 'recursive-fs';

import pinataSdk from '@pinata/sdk';
import {
  FileMapping,
  IPinataService,
  PinataConfig,
  IPinListResponse,
  IPinataClient,
  IPinListFilter,
  PinStatus,
  IPinataPin,
  IFileCheck,
} from '../types';
import { isEmptyArray, isTruthy, Logger } from '../utils';

export class PinataService implements IPinataService {
  private readonly logger = new Logger('PinataService');
  private readonly pinata: IPinataClient;
  private readonly PINATA_API_PINFILETOIPFS = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  constructor(private readonly config: PinataConfig) {
    this.pinata = pinataSdk(config.apiKey, config.apiSecret);
  }

  /**
   * Uploads a single file to Pinata
   * @param filePath - Path to the file to upload
   * @param fileName - Name to use for the uploaded file
   * @returns The IPFS hash of the uploaded file
   */
  public async uploadFile(filePath: string, fileName: string): Promise<string> {
    this.logger.info(Uploading file: );

    try {
      const readableStreamForFile = fs.createReadStream(filePath);
      const response = await this.pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: fileName,
        },
      });

      this.logger.info(File uploaded successfully: , {
        cid: response.IpfsHash,
      });
      return response.IpfsHash;
    } catch (error) {
      this.logger.error(Failed to upload file: , error);
      throw error;
    }
  }

  /**
   * Uploads an entire folder to Pinata
   * @param folderPath - Path to the folder to upload
   * @param folderName - Name to use for the uploaded folder
   * @returns The IPFS hash of the uploaded folder
   */
  public async uploadFolder(folderPath: string, folderName: string): Promise<string> {
    this.logger.info(Uploading folder: );

    try {
      const { files } = await read(folderPath);
      if (!files || isEmptyArray(files)) {
        throw new Error(No files found in folder: );
      }

      const formData = new FormData();
      files.forEach((filePath: string) => {
        this.logger.info(Adding file: );
        formData.append('file', fs.createReadStream(filePath), {
          filepath: basePathConverter(folderPath, filePath),
        });
      });

      formData.append(
        'pinataMetadata',
        JSON.stringify({
          name: folderName,
        })
      );

      const response = await axios.post(this.PINATA_API_PINFILETOIPFS, formData, {
        maxBodyLength: Infinity,
        headers: {
          'Content-Type': multipart/form-data; boundary=,
          pinata_api_key: this.config.apiKey,
          pinata_secret_api_key: this.config.apiSecret,
        },
      });

      this.logger.info(Folder uploaded successfully: , {
        cid: response.data.IpfsHash,
      });
      return response.data.IpfsHash;
    } catch (error) {
      this.logger.error(Failed to upload folder: , error);
      throw error;
    }
  }

  /**
   * Lists pinned files from Pinata
   * @param status - Pin status filter
   * @param pageOffset - Page offset for pagination
   * @param pageLimit - Page limit for pagination
   * @returns List of pinned files
   */
  public async listPins({ status, pageOffset = 0, pageLimit = 1000 }: IPinListFilter): Promise<IPinListResponse> {
    this.logger.info('Fetching pins from Pinata', {
      status,
      pageOffset,
      pageLimit,
    });

    try {
      const filter: IPinListFilter = { status, pageLimit, pageOffset };
      const response = await this.pinata.pinList(filter);

      this.logger.info('Pins fetched successfully', { count: response.count });
      return response;
    } catch (error) {
      this.logger.error('Failed to fetch pins', error);
      throw error;
    }
  }

  /**
   * Downloads CID mappings from Pinata and returns as a file mapping object
   * @param status - Pin status to filter by
   * @returns Object mapping file names to their CIDs
   */
  public async downloadCIDMappings(status: PinStatus): Promise<FileMapping> {
    const pins = await this.collectPins(status);
    const mapping = this.mapPinsToFileMapping(pins);

    this.logger.info('Pinata CID data retrieved', { totalCount: pins.length });
    return mapping;
  }

  /**
   * Checks if a file already exists in Pinata based on existing CID mappings
   * @param fileName - Name of the file to check
   * @param existingCIDs - Existing CID mappings
   * @returns Object with exists flag and IPFS hash if it exists
   */
  public checkFileExists(fileName: string, existingCIDs: FileMapping): IFileCheck {
    return {
      exists: isTruthy(existingCIDs[fileName]),
      ipfsHash: existingCIDs[fileName],
    };
  }

  /**
   * Retrieves and aggregates pin pages until all records are collected.
   * @param status - Pin status to filter by.
   * @returns Aggregated pin entries from Pinata.
   */
  private async collectPins(status: PinStatus): Promise<IPinataPin[]> {
    const pins: IPinataPin[] = [];
    const pageLimit = 1000;
    let pageOffset = 0;
    let hasMore = true;

    this.logger.info('Requesting Pinata CID data...');

    while (hasMore) {
      const response = await this.listPins({ status, pageOffset, pageLimit });
      const rows = this.normalizeRows(response.rows);

      if (this.isEmptyResult(response.count, rows.length, status)) {
        break;
      }

      pins.push(...rows);
      hasMore = this.hasMoreResults(rows.length, pageLimit);
      if (hasMore) {
        pageOffset += rows.length;
      }
    }

    return pins;
  }

  /**
   * Normalises optional row arrays returned by the Pinata API.
   * @param rows - Rows returned from the API.
   */
  private normalizeRows(rows?: ReadonlyArray<IPinataPin>): IPinataPin[] {
    if (!rows || rows.length === 0) {
      return [];
    }

    return Array.from(rows);
  }

  /**
   * Determines if result set is empty and logs accordingly.
   * @param totalResults - Total results reported by the API.
   * @param rowCount - Number of rows returned for the page.
   * @param status - Pin status filter applied.
   */
  private isEmptyResult(totalResults: number, rowCount: number, status: PinStatus): boolean {
    if (totalResults === 0 || rowCount <= 0) {
      if (totalResults === 0) {
        this.logger.info(No '' files or folders were found);
      }
      return true;
    }

    return false;
  }

  /**
   * Determines whether additional pages should be requested.
   * @param rowCount - Number of records returned in the current page.
   * @param pageLimit - Maximum page size used for the request.
   */
  private hasMoreResults(rowCount: number, pageLimit: number): boolean {
    return rowCount >= pageLimit;
  }

  /**
   * Converts pin entries to a file-name keyed mapping.
   * @param pins - Aggregated pin entries.
   * @returns File to CID mapping.
   */
  private mapPinsToFileMapping(pins: IPinataPin[]): FileMapping {
    return pins.reduce<FileMapping>((acc, pin) => {
      const fileName = pin.metadata?.name;
      if (!fileName) {
        return acc;
      }

      return {
        ...acc,
        [fileName]: pin.ipfs_pin_hash,
      };
    }, {});
  }
}
