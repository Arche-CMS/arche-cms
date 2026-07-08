import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, dirname } from "node:path";
import type { Readable } from "node:stream";
import type { StorageAdapter } from "./types.js";

export class LocalStorageAdapter implements StorageAdapter {
  private readonly baseDir: string;

  constructor(baseDir: string) {
    this.baseDir = baseDir;
  }

  async save(filePath: string, buffer: Buffer, _mimeType: string): Promise<void> {
    const fullPath = join(this.baseDir, filePath);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
  }

  async delete(filePath: string): Promise<boolean> {
    const fullPath = join(this.baseDir, filePath);
    try {
      await unlink(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getStream(filePath: string): Promise<Readable> {
    const fullPath = join(this.baseDir, filePath);
    return createReadStream(fullPath);
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = join(this.baseDir, filePath);
    try {
      await stat(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}
