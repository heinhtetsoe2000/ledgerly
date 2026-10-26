import { describe, expect, it } from "vitest";
import { escapeCsvCell, serializeTransactionsCsv } from "@/lib/csv";

describe("transaction CSV", () => {
  it("quotes delimiters and embedded quotes", () => {
    expect(escapeCsvCell('Cafe, "North"')).toBe('"Cafe, ""North"""');
  });

  it("preserves newlines and neutralizes formula-leading values", () => {
    expect(escapeCsvCell("=SUM(A1:A2)\nnext line")).toBe('"\'=SUM(A1:A2)\nnext line"');
    expect(escapeCsvCell("  @SUM(A1)")).toBe('"\'  @SUM(A1)"');
  });

  it("retains currency codes and emits a valid header for empty results", () => {
    expect(serializeTransactionsCsv([
      {
        occurredOn: "2026-10-25",
        type: "expense",
        amount: "25.50",
        currencyCode: "EUR",
        description: "Lunch",
        category: "Food",
        notes: "",
      },
    ])).toContain('"EUR"');
    expect(serializeTransactionsCsv([])).toBe(
      '"date","type","amount","currency","description","category","notes"',
    );
  });
});