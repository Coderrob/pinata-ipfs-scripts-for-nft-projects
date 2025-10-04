/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { IPinListFilter, IPinListResponse } from './models';

/**
 * Service interface for Pinata IPFS operations
 */
export interface IPinataService {
  uploadFile(filePath: string, fileName: string): Promise<string>;
  uploadFolder(folderPath: string, folderName: string): Promise<string>;
  listPins(filter?: IPinListFilter): Promise<IPinListResponse>;
}

export interface IPinataClient {
  pinFileToIPFS(stream: any, options?: any): Promise<any>;
  pinList(filter?: IPinListFilter): Promise<IPinListResponse>;
}
