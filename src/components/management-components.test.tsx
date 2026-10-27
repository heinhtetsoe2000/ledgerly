import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CategoryManager } from "@/components/category-manager";
import { DailySpendingHome } from "@/components/daily-spending-home";
import { TransactionForm, TransactionManager } from "@/components/transaction-manager";
import { TransactionSummary } from "@/components/transaction-summary";
import type { Database } from "@/lib/supabase/database.types";

afterEach(cleanup);

type Category = Database["public"]["Tables"]["categories"]["Row"];

const foodCategory: Category = {
  id: "20000000-0000-0000-0000-000000000001",
  user_id: "10000000-0000-0000-0000-000000000001",
  name: "Food",
  type: "expense",
  icon: "utensils",
  color: "#e76f51",
  is_default: true,
  created_at: "2026-10-25T00:00:00.000Z",
  updated_at: "2026-10-25T00:00:00.000Z",
};

describe("management components", () => {
  it("shows today's currency-separated expenses and both transaction types", () => {
    render(
      <DailySpendingHome
        canAddTransaction
        categories={[foodCategory]}
        currency="USD"
        date="2026-10-26"
        hasError={false}
        transactions={[
          { id: "expense-usd", type: "expense", amount: 12.5, currency_code: "USD", description: "Lunch" },
          { id: "expense-eur", type: "expense", amount: 8, currency_code: "EUR", description: "Coffee" },
          { id: "income-usd", type: "income", amount: 100, currency_code: "USD", description: "Pay" },
        ]}
      />,
    );

    expect(screen.getByRole("button", { name: "Add expense" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add income" })).toBeTruthy();
    expect(screen.getByText("Lunch")).toBeTruthy();
    expect(screen.getByText("Coffee")).toBeTruthy();
    expect(screen.getByText("Pay")).toBeTruthy();
    expect(screen.getAllByText("USD")).toHaveLength(1);
    expect(screen.getByText("EUR")).toBeTruthy();
    expect(screen.getByText(/12\.50/, { selector: ".today-expense-total strong" })).toBeTruthy();
    expect(screen.getByText(/8\.00/, { selector: ".today-expense-total strong" })).toBeTruthy();
    expect(screen.queryByText(/100\.00/, { selector: ".today-expense-total strong" })).toBeNull();
  });

  it("shows empty states for a day without transactions", () => {
    render(
      <DailySpendingHome
        canAddTransaction
        categories={[]}
        currency="USD"
        date="2026-10-26"
        hasError={false}
        transactions={[]}
      />,
    );

    expect(screen.getByText("No expenses recorded today.")).toBeTruthy();
    expect(screen.getByText("No transactions recorded today.")).toBeTruthy();
  });

  it("shows transaction balances without combining currencies", () => {
    render(
      <TransactionSummary
        hasError={false}
        summaries={[
          { currencyCode: "EUR", income: "100.00", expenses: "45.00", net: "55.00" },
          { currencyCode: "USD", income: "0.00", expenses: "20.00", net: "-20.00" },
        ]}
      />,
    );

    expect(screen.getByRole("region", { name: "Transaction summary" })).toBeTruthy();
    expect(screen.getByText("EUR", { selector: ".transaction-summary-currency" })).toBeTruthy();
    expect(screen.getByText("USD", { selector: ".transaction-summary-currency" })).toBeTruthy();
    expect(screen.getByText("€55.00")).toBeTruthy();
    expect(screen.getByText("-$20.00")).toBeTruthy();
    expect(screen.getByText("€100.00")).toBeTruthy();
    expect(screen.getByText("$20.00")).toBeTruthy();
  });

  it("shows an unavailable state instead of a stale or empty total on query failure", () => {
    render(
      <DailySpendingHome
        canAddTransaction
        categories={[]}
        currency="USD"
        date="2026-10-26"
        hasError
        transactions={[]}
      />,
    );

    expect(screen.getByRole("status").textContent).toContain("Today's activity is unavailable");
    expect(screen.queryByText("No expenses recorded today.")).toBeNull();
    expect(screen.queryByText("No transactions recorded today.")).toBeNull();
  });

  it("shows a clear empty state for categories", () => {
    render(<CategoryManager categories={[]} />);

    expect(screen.getByText("No categories yet.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Add a category" })).toBeTruthy();
  });

  it("defaults new transactions to the profile currency and shows empty history", () => {
    render(
      <>
        <TransactionForm categories={[foodCategory]} currency="EUR" today="2026-10-25" />
        <TransactionManager
          categories={[foodCategory]}
          currency="EUR"
          today="2026-10-25"
          totalCount={0}
          transactions={[]}
        />
      </>,
    );

    expect(screen.getByLabelText("Currency")).toHaveProperty("value", "EUR");
    expect(screen.getByText("No transactions recorded yet.")).toBeTruthy();
  });
});