import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { StorageProvider } from "./storage.interface";

export class SupabaseStorageProvider implements StorageProvider {
  private client: SupabaseClient | null = null;
  private bucket: string;

  constructor() {
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET || "reports";
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // Gunakan service role key di server agar memiliki akses mengelola file di bucket privat
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
    }
  }

  private getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error(
        "Kredensial Supabase Storage belum dikonfigurasi pada environment variables."
      );
    }
    return this.client;
  }

  async uploadFile(
    path: string,
    buffer: Buffer,
    contentType: string
  ): Promise<{ path: string }> {
    const client = this.getClient();
    const { data, error } = await client.storage
      .from(this.bucket)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Gagal mengunggah file ke storage: ${error.message}`);
    }

    return { path: data.path };
  }

  async getSignedDownloadUrl(
    path: string,
    expiresInSeconds: number = 60
  ): Promise<string> {
    const client = this.getClient();
    const { data, error } = await client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data?.signedUrl) {
      throw new Error(
        `Gagal membuat signed URL: ${error?.message || "URL tidak ditemukan"}`
      );
    }

    return data.signedUrl;
  }

  async downloadFile(path: string): Promise<Buffer> {
    const client = this.getClient();
    const { data, error } = await client.storage
      .from(this.bucket)
      .download(path);

    if (error || !data) {
      throw new Error(
        `Gagal mengunduh file dari storage: ${error?.message || "File tidak ditemukan"}`
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async deleteFile(path: string): Promise<void> {
    const client = this.getClient();
    const { error } = await client.storage.from(this.bucket).remove([path]);

    if (error) {
      throw new Error(`Gagal menghapus file dari storage: ${error.message}`);
    }
  }
}

// Singleton storage provider default
export const defaultStorageProvider: StorageProvider = new SupabaseStorageProvider();
