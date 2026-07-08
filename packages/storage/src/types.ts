import type { Readable } from "node:stream";

export interface StorageAdapter {
  save(path: string, buffer: Buffer, mimeType: string): Promise<void>;
  delete(path: string): Promise<boolean>;
  getStream(path: string): Promise<Readable>;
  exists(path: string): Promise<boolean>;
}
