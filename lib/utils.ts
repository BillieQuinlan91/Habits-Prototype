import { clsx, type ClassValue } from "clsx";
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSunday,
  parseISO,
  startOfMonth,
  startOfWeek,
} from "date-fns";
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

export function getWeekDateKeys(date = new Date()) {
  const { start } = getWeekWindow(date);
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

export function getMonthDateKeys(date = new Date()) {
  return eachDayOfInterval({
    start: startOfMonth(date),
    end: endOfMonth(date),
  }).map((day) => toDateKey(day));
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

export function getCommitmentDay(startDate?: string | null, now = new Date()) {
  if (!startDate) {
    return 1;
  }

  return Math.max(1, differenceInCalendarDays(now, parseISO(startDate)) + 1);
}
