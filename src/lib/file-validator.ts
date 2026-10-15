/**
 * File Validator untuk E-Report PBOBA (FILE-01 sampai FILE-03, FILE-10)
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream", // fallback browser untuk xlsx
  "application/zip",
];

export interface FileValidationResult {
  isValid: boolean;
  errorMessage?: string;
  sanitizedFilename?: string;
}

/**
 * Memvalidasi berkas laporan Excel (.xlsx) di sisi server
 */
export function validateExcelReportFile(
  filename: string,
  buffer: Buffer,
  declaredMimeType?: string
): FileValidationResult {
  // 1. Validasi Ekstensi File (FILE-01)
  const lowerFilename = filename.toLowerCase().trim();
  if (!lowerFilename.endsWith(".xlsx")) {
    return {
      isValid: false,
      errorMessage: "Hanya berkas berformat .xlsx resmi yang diizinkan untuk diunggah.",
    };
  }

  // Tolak tegas berkas bertipe macro seperti .xlsm (FILE-10)
  if (lowerFilename.endsWith(".xlsm") || lowerFilename.endsWith(".xlsb") || lowerFilename.endsWith(".xlam")) {
    return {
      isValid: false,
      errorMessage: "Format berkas dengan macro (.xlsm, .xlsb) dilarang demi alasan keamanan.",
    };
  }

  // 2. Validasi Ukuran Berkas (FILE-02)
  if (buffer.length === 0) {
    return {
      isValid: false,
      errorMessage: "Berkas laporan kosong (0 byte).",
    };
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    const sizeMb = (buffer.length / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      errorMessage: `Ukuran berkas (${sizeMb} MB) melebihi batas maksimum 10 MB.`,
    };
  }

  // 3. Validasi MIME Type (FILE-02)
  if (declaredMimeType && !ALLOWED_MIME_TYPES.includes(declaredMimeType)) {
    return {
      isValid: false,
      errorMessage: `Tipe MIME berkas (${declaredMimeType}) tidak sesuai dengan format Excel resmi (.xlsx).`,
    };
  }

  // 4. Validasi Magic Bytes ZIP Header (FILE-03)
  // Format .xlsx adalah OpenXML ZIP archive, berawalan byte: 0x50 0x4B 0x03 0x04 ('PK\x03\x04')
  if (buffer.length < 4) {
    return {
      isValid: false,
      errorMessage: "Format struktur internal berkas tidak valid.",
    };
  }

  const isZipHeader =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07) &&
    (buffer[3] === 0x04 || buffer[3] === 0x06 || buffer[3] === 0x08);

  if (!isZipHeader) {
    return {
      isValid: false,
      errorMessage: "Isi berkas rusak atau bukan merupakan format spreadsheet .xlsx yang valid.",
    };
  }

  // 5. Sanitasi Nama Berkas (FILE-02, FILE-04)
  const sanitizedFilename = filename
    .replace(/[^\w\s.-]/gi, "_")
    .replace(/\s+/g, " ")
    .trim();

  return {
    isValid: true,
    sanitizedFilename: sanitizedFilename || "laporan.xlsx",
  };
}
