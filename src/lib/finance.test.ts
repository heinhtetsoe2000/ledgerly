import { describe, expect, it } from "vitest";
import { groupAmounts, summarizeByCurrency, summarizeByMonthAndCurrency, summarizeExpensesByCurrency } from "@/lib/finance";

describe("financial summaries", () => {
  it("keeps income, expenses, and net totals separate by currency", () => {
    expect(summarizeByCurrency([
      { amount: "0.10", currencyCode: "USD", type: "income" },
      { amount: "0.20", currencyCode: "USD", type: "income" },
      { amount: "0.05", currencyCode: "USD", type: "expense" },
      { amount: "2.00", currencyCode: "EUR", type: "expense" },
    ])).toEqual([
      { currencyCode: "EUR", income: "0.00", expenses: "2.00", net: "-2.00" },
      { currencyCode: "USD", income: "0.30", expenses: "0.05", net: "0.25" },
    ]);
  });

  it("returns no monetary totals for an empty period", () => {
    expect(summarizeByCurrency([])).toEqual([]);
  });

  it("summarizes expenses without combining currencies or including income", () => {
    expect(summarizeExpensesByCurrency([
      { amount: "100.00", currencyCode: "USD", type: "income" },
      { amount: "12.50", currencyCode: "USD", type: "expense" },
      { amount: "8.00", currencyCode: "EUR", type: "expense" },
    ])).toEqual([
      { currencyCode: "EUR", amount: "8.00" },
      { currencyCode: "USD", amount: "12.50" },
    ]);
  });

  it("returns no expense totals when the day has no expenses", () => {
    expect(summarizeExpensesByCurrency([
      { amount: "100.00", currencyCode: "USD", type: "income" },
    ])).toEqual([]);
  });

  it("compares months without combining currencies", () => {
    expect(summarizeByMonthAndCurrency([
      { amount: "0.10", currencyCode: "USD", type: "income", occurredOn: "2026-03-01" },
      { amount: "0.03", currencyCode: "USD", type: "expense", occurredOn: "2026-03-31" },
      { amount: "4.00", currencyCode: "EUR", type: "income", occurredOn: "2026-03-15" },
      { amount: "2.00", currencyCode: "USD", type: "income", occurredOn: "2026-04-01" },
    ])).toEqual([
      { month: "2026-03", currencyCode: "EUR", income: "4.00", expenses: "0.00", net: "4.00" },
      { month: "2026-03", currencyCode: "USD", income: "0.10", expenses: "0.03", net: "0.07" },
      { month: "2026-04", currencyCode: "USD", income: "2.00", expenses: "0.00", net: "2.00" },
    ]);
  });

  it("keeps chart groups separate when category names match across currencies", () => {
    expect(groupAmounts([
      { amount: "12.00", currencyCode: "USD", category: "Food" },
      { amount: "9.00", currencyCode: "EUR", category: "Food" },
    ], (entry) => entry.category)).toEqual([
      { key: "Food", currencyCode: "USD", amount: "12.00" },
      { key: "Food", currencyCode: "EUR", amount: "9.00" },
    ]);
  });

  it("returns no monthly comparisons for an empty report range", () => {
    expect(summarizeByMonthAndCurrency([])).toEqual([]);
  });
});