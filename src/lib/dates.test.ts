import { describe, expect, it } from "vitest";
import { dateRangeSchema, formatCalendarDate, includesCalendarDate } from "@/lib/dates";

describe("calendar date utilities", () => {
  const range = { startDate: "2026-03-01", endDate: "2026-03-31" };

  it("includes both calendar date boundaries", () => {
    expect(includesCalendarDate("2026-03-01", range)).toBe(true);
    expect(includesCalendarDate("2026-03-31", range)).toBe(true);
    expect(includesCalendarDate("2026-02-28", range)).toBe(false);
    expect(includesCalendarDate("2026-04-01", range)).toBe(false);
  });

  it("rejects invalid dates and reversed ranges", () => {
    expect(dateRangeSchema.safeParse(range).success).toBe(true);
    expect(dateRangeSchema.safeParse({ startDate: "2026-02-30", endDate: range.endDate }).success)
      .toBe(false);
    expect(dateRangeSchema.safeParse({ startDate: range.endDate, endDate: range.startDate }).success)
      .toBe(false);
  });

  it("formats a calendar date without timezone drift", () => {
    expect(formatCalendarDate("2026-03-01", "en-US")).toBe("Mar 1, 2026");
  });
});