import { z } from "zod";

export const calendarDateSchema = z.iso.date();

export const dateRangeSchema = z
  .object({
    startDate: calendarDateSchema,
    endDate: calendarDateSchema,
  })
  .refine(({ startDate, endDate }) => startDate <= endDate, {
    message: "The end date must be on or after the start date.",
    path: ["endDate"],
  });

export type DateRange = z.infer<typeof dateRangeSchema>;

export function includesCalendarDate(date: string, range: DateRange): boolean {
  return calendarDateSchema.safeParse(date).success &&
    date >= range.startDate &&
    date <= range.endDate;
}

export function formatCalendarDate(date: string, locale = "en-US"): string {
  const parsedDate = calendarDateSchema.parse(date);
  const utcDate = new Date(`${parsedDate}T00:00:00.000Z`);

  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(utcDate);
}