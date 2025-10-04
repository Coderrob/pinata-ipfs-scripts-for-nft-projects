/**
 * MIT License
 * Copyright (c) 2025 Robert (Coderrob) Lindley
 */

import { PinStatus } from './enums';

/**
 * Response from Pinata upload operations
 */
export interface IPinataResponse {
  readonly IpfsHash: string;
  readonly PinSize: number;
  readonly Timestamp: string;
}

/**
 * Pin object from Pinata list response
 */
export interface IPinataPin {
  readonly id: string;
  readonly ipfs_pin_hash: string;
  readonly size: number;
  readonly user_id: string;
  readonly date_pinned: string;
  readonly date_unpinned?: string;
  readonly metadata: {
    readonly name?: string;
    readonly keyvalues?: Record<string, unknown>;
  };
  readonly regions: ReadonlyArray<{
    readonly regionId: string;
    readonly currentReplicationCount: number;
    readonly desiredReplicationCount: number;
  }>;
}

/**
 * Response from Pinata list pins API
 */
export interface IPinListResponse {
  readonly count: number;
  readonly rows: ReadonlyArray<IPinataPin>;
}

export interface IPinListFilter {
  status: PinStatus;
  pageOffset?: number;
  pageLimit?: number;
}

export interface IFileCheck {
  exists: boolean;
  ipfsHash?: string;
}
