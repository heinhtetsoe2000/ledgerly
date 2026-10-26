import { describe, expect, it } from "vitest";
import { formatCurrencyAmount, sumByCurrency } from "@/lib/currency";

describe("currency utilities", () => {
  it("sums exact decimal values separately by currency", () => {
    expect(
      sumByCurrency([
        { amount: "0.10", currencyCode: "USD" },
        { amount: "0.20", currencyCode: "USD" },
        { amount: "1.25", currencyCode: "EUR" },
      ]),
    ).toEqual([
      { amount: "1.25", currencyCode: "EUR" },
      { amount: "0.30", currencyCode: "USD" },
    ]);
  });

  it("formats a transaction amount with its currency code", () => {
    expect(formatCurrencyAmount("1234.50", "USD", "en-US")).toBe("$1,234.50");
  });
});