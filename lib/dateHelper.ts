import { format as formatTz, fromZonedTime, toZonedTime } from "date-fns-tz";
import { id } from "date-fns/locale";

const TIMEZONE = "Asia/Jakarta";

// 1. Database (UTC) -> Layar (WIB)
export const formatToWIB = (date: string | Date, pattern: string) => {
  if (!date) return "-";
  const d = new Date(date);
  return formatTz(d, pattern, { timeZone: TIMEZONE, locale: id });
};

// 2. Database (UTC) -> Input HTML (Local String)
export const formatForInput = (date: Date | string) => {
  const d = new Date(date);
  const zonedDate = toZonedTime(d, TIMEZONE);
  return formatTz(zonedDate, "yyyy-MM-dd'T'HH:mm", { timeZone: TIMEZONE });
};

// 3. Input HTML (WIB) -> Database (UTC)
export const parseInputToUTC = (dateString: string) => {
  if (!dateString) return new Date();
  return fromZonedTime(dateString, TIMEZONE);
};