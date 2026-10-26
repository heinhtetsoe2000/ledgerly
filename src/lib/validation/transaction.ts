import Decimal from "decimal.js";
import { z } from "zod";

export const transactionTypeSchema = z.enum(["income", "expense"]);

export const positiveAmountSchema = z
  .string()
  .trim()
  .regex(/^(?:0|[1-9]\d{0,11})(?:\.\d{1,2})?$/, "Enter an amount with up to two decimal places.")
  .refine((amount) => new Decimal(amount).greaterThan(0), "Amount must be greater than zero.");

export const currencyCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Enter a three-letter currency code.");

export const transactionSchema = z.object({
  type: transactionTypeSchema,
  amount: positiveAmountSchema,
  currencyCode: currencyCodeSchema,
  description: z.string().trim().min(1).max(240),
  occurredOn: z.iso.date(),
  categoryId: z.uuid().optional(),
  notes: z.string().trim().max(2000).optional(),
});

export type TransactionInput = z.infer<typeof transactionSchema>;