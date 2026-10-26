import Decimal from "decimal.js";
import type { Database } from "@/lib/supabase/database.types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];

export type FinancialEntry = {
  amount: string;
  currencyCode: string;
  type: TransactionType;
};

export type FinancialSummary = {
  currencyCode: string;
  income: string;
  expenses: string;
  net: string;
};

export type MonthlyFinancialEntry = FinancialEntry & {
  occurredOn: string;
};

export type MonthlyFinancialSummary = FinancialSummary & {
  month: string;
};

export function summarizeByCurrency(entries: readonly FinancialEntry[]): FinancialSummary[] {
  const totals = new Map<string, { income: Decimal; expenses: Decimal }>();

  for (const entry of entries) {
    const current = totals.get(entry.currencyCode) ?? {
      income: new Decimal(0),
      expenses: new Decimal(0),
    };
    current[entry.type === "income" ? "income" : "expenses"] = current[
      entry.type === "income" ? "income" : "expenses"
    ].plus(entry.amount);
    totals.set(entry.currencyCode, current);
  }

  return [...totals.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([currencyCode, amounts]) => ({
      currencyCode,
      income: amounts.income.toFixed(2),
      expenses: amounts.expenses.toFixed(2),
      net: amounts.income.minus(amounts.expenses).toFixed(2),
    }));
}

export function groupAmounts<T extends { amount: string; currencyCode: string }>(
  entries: readonly T[],
  keyOf: (entry: T) => string,
): Array<{ key: string; currencyCode: string; amount: string }> {
  const totals = new Map<string, Decimal>();

  for (const entry of entries) {
    const key = `${entry.currencyCode}\u0000${keyOf(entry)}`;
    totals.set(key, (totals.get(key) ?? new Decimal(0)).plus(entry.amount));
  }

  return [...totals.entries()].map(([key, amount]) => {
    const [currencyCode, groupedKey] = key.split("\u0000");
    return { key: groupedKey, currencyCode, amount: amount.toFixed(2) };
  });
}

export function summarizeByMonthAndCurrency(
  entries: readonly MonthlyFinancialEntry[],
): MonthlyFinancialSummary[] {
  const totals = new Map<string, { currencyCode: string; month: string; income: Decimal; expenses: Decimal }>();

  for (const entry of entries) {
    const month = entry.occurredOn.slice(0, 7);
    const key = `${month}\u0000${entry.currencyCode}`;
    const current = totals.get(key) ?? {
      currencyCode: entry.currencyCode,
      month,
      income: new Decimal(0),
      expenses: new Decimal(0),
    };
    const totalType = entry.type === "income" ? "income" : "expenses";
    current[totalType] = current[totalType].plus(entry.amount);
    totals.set(key, current);
  }

  return [...totals.values()]
    .sort((left, right) => left.month.localeCompare(right.month) || left.currencyCode.localeCompare(right.currencyCode))
    .map((amounts) => ({
      month: amounts.month,
      currencyCode: amounts.currencyCode,
      income: amounts.income.toFixed(2),
      expenses: amounts.expenses.toFixed(2),
      net: amounts.income.minus(amounts.expenses).toFixed(2),
    }));
}