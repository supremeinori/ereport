/**
 * Utilitas penanganan tanggal perizinan PBOT
 * Memastikan tanggal disimpan dan ditampilkan secara konsisten tanpa pergeseran zona waktu (timezone drift).
 */

export function parseDateUtc(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return null;
    return new Date(Date.UTC(val.getUTCFullYear(), val.getUTCMonth(), val.getUTCDate(), 0, 0, 0));
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (!trimmed) return null;
    // Format YYYY-MM-DD
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const [, y, m, d] = match;
      return new Date(Date.UTC(Number(y), Number(m) - 1, Number(d), 0, 0, 0));
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 0, 0, 0));
    }
  }
  return null;
}

export function formatDateUtc(
  date: Date | string | null | undefined,
  locale: string = "id-ID"
): string {
  if (!date) return "-";
  const dateObj = typeof date === "string" ? parseDateUtc(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) return "-";

  return dateObj.toLocaleDateString(locale, {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateInput(date: Date | string | null | undefined): string {
  if (!date) return "";
  if (typeof date === "string") {
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const dateObj = typeof date === "string" ? parseDateUtc(date) : date;
  if (!dateObj || isNaN(dateObj.getTime())) return "";

  const y = dateObj.getUTCFullYear();
  const m = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dateObj.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
