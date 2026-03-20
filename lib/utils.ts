import { clsx, type ClassValue } from "clsx";
import { endOfWeek, format, isSunday, parseISO, startOfWeek } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getWeekWindow(date = new Date()) {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function toDateKey(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function formatDayLabel(dateString: string) {
  return format(parseISO(dateString), "EEE d");
}

export function isSundayLocal(date = new Date()) {
  return isSunday(date);
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function toPercent(value: number) {
  return Math.round(value * 100);
}
