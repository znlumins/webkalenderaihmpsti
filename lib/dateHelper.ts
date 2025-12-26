import { format } from "date-fns-tz";
import { id } from "date-fns/locale";
import { parseISO } from "date-fns";

// KITA PAKSA SEMUA JADI WIB (Asia/Jakarta)
const TIMEZONE = "Asia/Jakarta";

// 1. Format Tanggal untuk Tampilan (Detail Modal, Focus Mode)
// Contoh: "Senin, 25 Oktober • 10.00 WIB"
export const formatToWIB = (date: Date | string | number, pattern: string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { timeZone: TIMEZONE, locale: id });
};

// 2. Format untuk Input Form (saat tambah event)
// Format HTML datetime-local butuh: "YYYY-MM-DDTHH:mm"
export const formatForInput = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm", { timeZone: TIMEZONE });
};