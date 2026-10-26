import Decimal from "decimal.js";

export type CurrencyAmount = {
  amount: string;
  currencyCode: string;
};

export type CurrencyTotal = {
  amount: string;
  currencyCode: string;
};

export function sumByCurrency<T extends CurrencyAmount>(entries: readonly T[]): CurrencyTotal[] {
  const totals = new Map<string, Decimal>();

  for (const entry of entries) {
    const currentTotal = totals.get(entry.currencyCode) ?? new Decimal(0);
    totals.set(entry.currencyCode, currentTotal.plus(entry.amount));
  }

  return [...totals.entries()]
    .sort(([leftCurrency], [rightCurrency]) => leftCurrency.localeCompare(rightCurrency))
    .map(([currencyCode, amount]) => ({
      amount: amount.toFixed(2),
      currencyCode,
    }));
}

export function formatCurrencyAmount(
  amount: string,
  currencyCode: string,
  locale = "en-US",
): string {
  const exactAmount = new Decimal(amount).toFixed(2);
  const formatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(Number(exactAmount));
}