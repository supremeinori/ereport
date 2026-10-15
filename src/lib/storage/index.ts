import { StorageProvider } from "./storage.interface";
import { SupabaseStorageProvider } from "./supabase-storage";
import { MemoryStorageProvider } from "./memory-storage";

export * from "./storage.interface";
export * from "./supabase-storage";
export * from "./memory-storage";

let storageInstance: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (storageInstance) return storageInstance;

  const hasSupabaseKeys = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );

  if (hasSupabaseKeys) {
    try {
      storageInstance = new SupabaseStorageProvider();
      return storageInstance;
    } catch (err) {
      console.warn("Gagal inisialisasi Supabase Storage, menggunakan MemoryStorage:", err);
    }
  }

  // Gunakan MemoryStorageProvider saat kredensial storage belum dipasang
  storageInstance = new MemoryStorageProvider();
  return storageInstance;
}
