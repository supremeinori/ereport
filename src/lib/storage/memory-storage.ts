import { StorageProvider } from "./storage.interface";

/**
 * MemoryStorageProvider
 * Implementasi in-memory storage untuk pengujian lokal otomatis dan fallback
 * saat kunci Supabase Storage belum dikonfigurasi di environment lokal.
 */
export class MemoryStorageProvider implements StorageProvider {
  private files = new Map<string, { buffer: Buffer; contentType: string }>();

  async uploadFile(
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<{ path: string }> {
    this.files.set(path, { buffer, contentType });
    return { path };
  }

  async getSignedDownloadUrl(
    path: string,
    expiresInSeconds: number = 60
  ): Promise<string> {
    if (!this.files.has(path)) {
      throw new Error(`File ${path} tidak ditemukan di storage.`);
    }
    // Return URL simulasi berumur pendek
    const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
    return `/api/reports/download-mock?path=${encodeURIComponent(path)}&exp=${exp}`;
  }

  async downloadFile(path: string): Promise<Buffer> {
    const file = this.files.get(path);
    if (!file) {
      throw new Error(`File ${path} tidak ditemukan di storage.`);
    }
    return file.buffer;
  }

  async deleteFile(path: string): Promise<void> {
    this.files.delete(path);
  }
}
