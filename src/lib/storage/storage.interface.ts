/**
 * StorageProvider Interface (ARC-05)
 * Lapisan abstraksi penyimpanan file agar logika bisnis independen dari penyedia storage.
 */
export interface StorageProvider {
  /**
   * Mengunggah file ke storage.
   * @param path - Key/path objek di storage (mis. berbasis UUID)
   * @param buffer - Buffer konten file
   * @param contentType - MIME type file (mis. application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)
   */
  uploadFile(path: string, buffer: Buffer, contentType: string): Promise<{ path: string }>;

  /**
   * Menerbitkan URL unduhan bertanda tangan (signed URL) berumur pendek.
   * @param path - Key/path objek di storage
   * @param expiresInSeconds - Durasi berlaku signed URL dalam detik
   */
  getSignedDownloadUrl(path: string, expiresInSeconds: number): Promise<string>;

  /**
   * Mengunduh buffer file langsung (berguna untuk proxy server atau proses backup).
   * @param path - Key/path objek di storage
   */
  downloadFile(path: string): Promise<Buffer>;

  /**
   * Menghapus file dari storage.
   * @param path - Key/path objek di storage
   */
  deleteFile(path: string): Promise<void>;
}
