// PERUBAHAN IMPORT: Gunakan toZonedTime dan fromZonedTime
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";
import { id } from "date-fns/locale";
import { parseISO } from "date-fns";

const TIMEZONE = "Asia/Jakarta";

// 1. UNTUK MENAMPILKAN (Database -> Layar)
export const formatToWIB = (date: Date | string | number, pattern: string) => {
  const d = typeof date === 'string' ? parseISO(date) : date;
  
  // GANTI utcToZonedTime JADI toZonedTime
  const zonedDate = toZonedTime(d, TIMEZONE);
  
  return format(zonedDate, pattern, { timeZone: TIMEZONE, locale: id });
};

// 2. UNTUK INPUT FORM (Default Value)
export const formatForInput = (date: Date) => {
  // GANTI utcToZonedTime JADI toZonedTime
  const zonedDate = toZonedTime(date, TIMEZONE);
  
  return format(zonedDate, "yyyy-MM-dd'T'HH:mm", { timeZone: TIMEZONE });
};

// 3. UNTUK MENYIMPAN (Layar -> Database)
export const parseInputToUTC = (dateString: string) => {
  if (!dateString) return new Date();
  
  // GANTI zonedTimeToUtc JADI fromZonedTime
  return fromZonedTime(dateString, TIMEZONE);
};