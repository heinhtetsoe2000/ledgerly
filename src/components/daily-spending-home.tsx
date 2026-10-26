import Link from "next/link";
import { Plus } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { formatCurrencyAmount } from "@/lib/currency";
import { formatCalendarDate } from "@/lib/dates";
import { summarizeExpensesByCurrency } from "@/lib/finance";

type DailyTransaction = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "id" | "type" | "amount" | "currency_code" | "description"
>;

export function DailySpendingHome({
  date,
  hasError,
  transactions,
}: {
  date: string;
  hasError: boolean;
  transactions: DailyTransaction[];
}) {
  const expenseSummaries = summarizeExpensesByCurrency(transactions.map((transaction) => ({
    amount: String(transaction.amount),
    currencyCode: transaction.currency_code,
    type: transaction.type,
  })));

  return (
    <>
      <section aria-labelledby="today-expenses-title" className="today-home">
        <div className="today-home-heading">
          <div>
            <p className="eyebrow"><time dateTime={date}>{formatCalendarDate(date, "en-US")}</time></p>
            <h2 id="today-expenses-title">Today&apos;s expenses</h2>
          </div>
          <Link className="quick-add-link" href="/transactions#new-transaction-title">
            <Plus aria-hidden="true" size={18} />
            <span>Add transaction</span>
          </Link>
        </div>
        {hasError ? (
          <p className="config-notice" role="status">Today&apos;s activity is unavailable right now.</p>
        ) : expenseSummaries.length === 0 ? (
          <p className="today-empty">No expenses recorded today.</p>
        ) : (
          <div className="today-expense-totals">
            {expenseSummaries.map((summary) => (
              <article className="today-expense-total" key={summary.currencyCode}>
                <span>{summary.currencyCode}</span>
                <strong>{formatCurrencyAmount(summary.amount, summary.currencyCode)}</strong>
              </article>
            ))}
          </div>
        )}
      </section>
      <section aria-labelledby="today-transactions-title" className="dashboard-section today-transactions-section">
        <div className="section-heading">
          <h2 id="today-transactions-title">Today&apos;s transactions</h2>
          <Link href="/transactions">View all</Link>
        </div>
        {hasError ? (
          <p className="empty-list">Today&apos;s transactions are unavailable right now.</p>
        ) : transactions.length === 0 ? (
          <p className="empty-list">No transactions recorded today.</p>
        ) : (
          <ul className="recent-list">
            {transactions.map((transaction) => (
              <li key={transaction.id}>
                <span className={`transaction-type-mark ${transaction.type}`} aria-hidden="true">
                  {transaction.type === "income" ? "+" : "−"}
                </span>
                <span className="recent-description">
                  <strong>{transaction.description}</strong>
                  <small>{transaction.type === "income" ? "Income" : "Expense"}</small>
                </span>
                <strong className={`transaction-amount ${transaction.type}`}>
                  {transaction.type === "expense" ? "−" : "+"}
                  {formatCurrencyAmount(String(transaction.amount), transaction.currency_code)}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}