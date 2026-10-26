import { describe, expect, it } from "vitest";
import { positiveAmountSchema, transactionTypeSchema } from "@/lib/validation/transaction";

describe("transaction validation", () => {
  it("accepts positive amounts within numeric(14,2) limits", () => {
    expect(positiveAmountSchema.safeParse("0.01").success).toBe(true);
    expect(positiveAmountSchema.safeParse("999999999999.99").success).toBe(true);
  });

  it.each(["0", "0.00", "-1.00", "1.001", "1000000000000.00"]) (
    "rejects invalid amount %s",
    (amount) => {
      expect(positiveAmountSchema.safeParse(amount).success).toBe(false);
    },
  );

  it("accepts only income and expense transaction types", () => {
    expect(transactionTypeSchema.safeParse("income").success).toBe(true);
    expect(transactionTypeSchema.safeParse("expense").success).toBe(true);
    expect(transactionTypeSchema.safeParse("transfer").success).toBe(false);
  });
});