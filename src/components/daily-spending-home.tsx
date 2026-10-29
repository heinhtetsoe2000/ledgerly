import Link from "next/link";
import type { Database } from "@/lib/supabase/database.types";
import { formatCurrencyAmount } from "@/lib/currency";
import { formatCalendarDate } from "@/lib/dates";
import { summarizeByCurrency } from "@/lib/finance";
import { categoryIcons } from "@/components/category-icons";
import { FinanceSummaryCard } from "@/components/finance-summary-card";
import { HomeTransactionDialog } from "@/components/home-transaction-dialog";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type DailyTransaction = Pick<
  Database["public"]["Tables"]["transactions"]["Row"],
  "id" | "type" | "amount" | "currency_code" | "description" | "category_id"
>;

export function DailySpendingHome({
  canAddTransaction,
  categories,
  currency,
  date,
  hasError,
  transactions,
}: {
  canAddTransaction: boolean;
  categories: Category[];
  currency: string;
  date: string;
  hasError: boolean;
  transactions: DailyTransaction[];
}) {
  const dailySummaries = summarizeByCurrency(transactions.map((transaction) => ({
    amount: String(transaction.amount),
    currencyCode: transaction.currency_code,
    type: transaction.type,
  })));
  const categoriesById = new Map(categories.map((category) => [category.id, category]));

  return (
    <>
      <section aria-labelledby="today-expenses-title" className="today-home">
        <div className="today-home-heading">
          <div>
            <p className="eyebrow"><time dateTime={date}>{formatCalendarDate(date, "en-US")}</time></p>
            <h1 id="today-expenses-title">Today&apos;s expenses</h1>
          </div>
        </div>
        {hasError ? (
          <p className="config-notice" role="status">Today&apos;s activity is unavailable right now.</p>
        ) : dailySummaries.length === 0 ? (
          <p className="today-empty">No expenses recorded today.</p>
        ) : (
          <div className="today-expense-totals">
            {dailySummaries.map((summary) => (
              <FinanceSummaryCard
                amount={summary.expenses}
                amountLabel="Spent today"
                currencyCode={summary.currencyCode}
                dateLabel={formatCalendarDate(date, "en-US")}
                key={summary.currencyCode}
                metrics={[
                  { label: "Income", amount: summary.income },
                  { label: "Net today", amount: summary.net },
                ]}
              />
            ))}
          </div>
        )}
        <HomeTransactionDialog
          categories={categories}
          currency={currency}
          disabled={!canAddTransaction}
          today={date}
        />
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
            {transactions.map((transaction) => {
              const category = transaction.category_id ? categoriesById.get(transaction.category_id) : undefined;
              const iconName = category && categoryIcons[category.icon] ? category.icon : "tag";
              const CategoryIcon = categoryIcons[iconName];

              return (
                <li key={transaction.id}>
                  <span
                    aria-hidden="true"
                    className="transaction-category-icon"
                    data-icon={iconName}
                    style={category?.color ? { color: category.color } : undefined}
                  >
                    <CategoryIcon size={18} strokeWidth={1.8} />
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
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}