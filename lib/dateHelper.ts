import { format as formatTz, fromZonedTime, toZonedTime } from "date-fns-tz";
import { id } from "date-fns/locale";

const TIMEZONE = "Asia/Jakarta";

// 1. FORMAT TAMPILAN (Output ke Layar)
// Mengubah data UTC dari database menjadi format teks WIB yang cantik
export const formatToWIB = (date: string | Date, pattern: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return formatTz(d, pattern, { timeZone: TIMEZONE, locale: id });
};

// 2. FORMAT UNTUK FORM INPUT (Value Default saat Edit)
// Mengubah data UTC menjadi string "YYYY-MM-DDTHH:mm" agar masuk ke input html
export const formatForInput = (date: Date | string) => {
  const d = new Date(date);
  // Konversi UTC ke zona waktu Jakarta dulu sebelum dijadikan string
  const zonedDate = toZonedTime(d, TIMEZONE);
  return formatTz(zonedDate, "yyyy-MM-dd'T'HH:mm", { timeZone: TIMEZONE });
};

// 3. PARSING INPUT (Simpan ke Database)
// Mengubah input user "2024-01-01T10:00" menjadi Date Object UTC yang benar
export const parseInputToUTC = (dateString: string) => {
  if (!dateString) return new Date();
  
  // KITA PAKSA: Anggap string input user adalah waktu Jakarta
  // fromZonedTime akan menghasilkan Date object dalam UTC yang setara
  // Contoh: Input "10:00" (Jakarta) -> Output Date "03:00" (UTC)
  return fromZonedTime(dateString, TIMEZONE);
};