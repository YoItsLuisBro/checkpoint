import { format } from "date-fns";

export function getTodayKey() {
  return format(new Date(), "yyyy-MM-dd");
}

export function getReadableDate(date = new Date()) {
  return format(date, "EEEE, MMMM d yyyy");
}
