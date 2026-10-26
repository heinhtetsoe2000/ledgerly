import { describe, expect, it, vi } from "vitest";
import {
  applyTransactionFilters,
  getTransactionPageRange,
  parseTransactionFilters,
} from "@/lib/transaction-filters";

describe("transaction filter parsing", () => {
  it("normalizes combined type, category, inclusive date, search, and page filters", () => {
    expect(parseTransactionFilters({
      type: "expense",
      category: "20000000-0000-4000-8000-000000000001",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      search: "  lunch  ",
      page: "3",
    })).toEqual({
      type: "expense",
      categoryId: "20000000-0000-4000-8000-000000000001",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      search: "lunch",
      page: 3,
      error: undefined,
    });
  });

  it("rejects malformed or reversed date filters", () => {
    expect(parseTransactionFilters({ startDate: "2026-02-30" }).error)
      .toBe("Enter valid calendar dates.");
    expect(parseTransactionFilters({ startDate: "2026-03-31", endDate: "2026-03-01" }).error)
      .toBe("The end date must be on or after the start date.");
  });

  it("rejects invalid type, category, and excessive search text", () => {
    expect(parseTransactionFilters({ type: "transfer" }).error).toBe("Choose a valid transaction type.");
    expect(parseTransactionFilters({ category: "not-a-uuid" }).error).toBe("Choose a valid category.");
    expect(parseTransactionFilters({ search: "x".repeat(101) }).error)
      .toBe("Search text must be 100 characters or fewer.");
  });

  it("defaults invalid pages to the first page and caps excessive pages", () => {
    expect(parseTransactionFilters({ page: "0" }).page).toBe(1);
    expect(parseTransactionFilters({ page: "9999" }).page).toBe(500);
  });

  it("applies every combined criterion once", () => {
    const filters = parseTransactionFilters({
      type: "expense",
      category: "20000000-0000-4000-8000-000000000001",
      startDate: "2026-03-01",
      endDate: "2026-03-31",
      search: "lunch",
    });
    const applied = {
      type: vi.fn(),
      categoryId: vi.fn(),
      startDate: vi.fn(),
      endDate: vi.fn(),
      search: vi.fn(),
    };

    applyTransactionFilters(filters, applied);

    expect(applied.type).toHaveBeenCalledWith("expense");
    expect(applied.categoryId).toHaveBeenCalledWith("20000000-0000-4000-8000-000000000001");
    expect(applied.startDate).toHaveBeenCalledWith("2026-03-01");
    expect(applied.endDate).toHaveBeenCalledWith("2026-03-31");
    expect(applied.search).toHaveBeenCalledWith("lunch");
  });

  it("calculates stable zero-based page ranges", () => {
    expect(getTransactionPageRange(1)).toEqual({ from: 0, to: 19 });
    expect(getTransactionPageRange(3)).toEqual({ from: 40, to: 59 });
    expect(getTransactionPageRange(0)).toEqual({ from: 0, to: 19 });
  });
});