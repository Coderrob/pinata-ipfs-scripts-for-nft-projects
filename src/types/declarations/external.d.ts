/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'ipfs-only-hash' {
  export function of(data: Buffer): Promise<string>;
}

declare module 'recursive-fs' {
  export interface ReadResult {
    files: string[];
    dirs: string[];
  }
  export function read(path: string): Promise<ReadResult>;
}

declare module 'base-path-converter' {
  function basePathConverter(basePath: string, fullPath: string): string;
  export = basePathConverter;
}

declare module '@pinata/sdk' {
  interface PinataClient {
    pinFileToIPFS(stream: any, options?: any): Promise<any>;
    pinList(filter?: any): Promise<any>;
  }

  function pinataSDK(apiKey: string, apiSecret: string): PinataClient;
  export = pinataSDK;
}
