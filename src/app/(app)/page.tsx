import { WalletCards } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";
import { SupabaseConfigStatus } from "@/components/supabase-config-status";
import { formatCurrencyAmount } from "@/lib/currency";
import { formatCalendarDate } from "@/lib/dates";
import { groupAmounts, summarizeByCurrency } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(date);
}

function monthHref(date: Date): string {
  const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
  return `/?month=${month}`;
}

export default async function OverviewPage({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;
  const requestedMonth = typeof params.month === "string" && /^\d{4}-\d{2}$/.test(params.month)
    ? params.month
    : "";
  const [year, monthIndex] = requestedMonth
    ? [Number(requestedMonth.slice(0, 4)), Number(requestedMonth.slice(5, 7)) - 1]
    : [new Date().getUTCFullYear(), new Date().getUTCMonth()];
  const validMonth = monthIndex >= 0 && monthIndex <= 11 && year >= 1900 && year <= 9999;
  const selectedMonth = validMonth ? new Date(Date.UTC(year, monthIndex, 1)) : new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const startDate = `${selectedMonth.getUTCFullYear()}-${String(selectedMonth.getUTCMonth() + 1).padStart(2, "0")}-01`;
  const endDate = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() + 1, 0))
    .toISOString().slice(0, 10);
  const previousMonth = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() - 1, 1));
  const nextMonth = new Date(Date.UTC(selectedMonth.getUTCFullYear(), selectedMonth.getUTCMonth() + 1, 1));
  const supabase = await createSupabaseServerClient();
  const transactions = [];
  let transactionError = false;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase!
      .from("transactions")
      .select("id, type, amount, currency_code, description, occurred_on, category_id")
      .gte("occurred_on", startDate)
      .lte("occurred_on", endDate)
      .order("occurred_on", { ascending: false })
      .range(offset, offset + 999);

    if (error) {
      transactionError = true;
      break;
    }
    transactions.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }

  if (transactionError) {
    return (
      <div>
        <header className="page-heading">
          <div><p className="eyebrow">PERSONAL FINANCE</p><h1>Overview</h1></div>
        </header>
        <p className="config-notice" role="status">Dashboard data is unavailable until the database migrations are applied.</p>
      </div>
    );
  }

  const entries = transactions.map((row) => ({
    amount: String(row.amount),
    currencyCode: row.currency_code,
    type: row.type,
  }));
  const summaries = summarizeByCurrency(entries);
  const expenseEntries = transactions
    .filter((row) => row.type === "expense")
    .map((row) => ({
      amount: String(row.amount),
      currencyCode: row.currency_code,
      category: row.category_id ?? "Uncategorized",
      date: row.occurred_on,
    }));
  const categoryIds = [...new Set(expenseEntries.map((entry) => entry.category).filter((id) => id !== "Uncategorized"))];
  const categoryResult = categoryIds.length
    ? await supabase!.from("categories").select("id, name").in("id", categoryIds)
    : { data: [], error: null };
  const categoryNames = new Map((categoryResult.data ?? []).map((category) => [category.id, category.name]));
  const categoryTotals = groupAmounts(expenseEntries, (entry) =>
    categoryNames.get(entry.category) ?? entry.category,
  );
  const dailyTotals = groupAmounts(expenseEntries, (entry) => entry.date)
    .sort((left, right) => left.key.localeCompare(right.key) || left.currencyCode.localeCompare(right.currencyCode));
  const maxForCurrency = (items: typeof categoryTotals, currencyCode: string) =>
    Math.max(0, ...items
      .filter((item) => item.currencyCode === currencyCode)
      .map((item) => Number(item.amount)));

  return (
    <div>
      <header className="page-heading">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Overview</h1>
          <p className="page-description">Your financial activity, gathered in one place.</p>
        </div>
        <nav aria-label="Select dashboard month" className="month-navigation">
          <Link aria-label="Previous month" href={monthHref(previousMonth)}>‹</Link>
          <time dateTime={startDate}>{formatMonth(selectedMonth)}</time>
          <Link aria-label="Next month" href={monthHref(nextMonth)}>›</Link>
        </nav>
      </header>
      <SupabaseConfigStatus />
      {categoryResult.error && <p className="config-notice" role="status">Category breakdown is unavailable right now.</p>}
      <section aria-label="Monthly totals by currency" className="summary-grid">
        {summaries.length === 0 ? (
          <div className="overview-empty summary-empty">
            <span className="empty-mark"><WalletCards aria-hidden="true" size={28} /></span>
            <div>
              <p className="eyebrow">A FRESH START</p>
              <h2>Nothing recorded yet</h2>
              <p>Your income and expenses for {formatMonth(selectedMonth)} will appear here.</p>
              <Link className="text-link" href="/transactions">Go to transactions</Link>
            </div>
          </div>
        ) : summaries.map((summary) => (
          <article className="currency-summary" key={summary.currencyCode}>
            <div className="summary-currency">{summary.currencyCode}</div>
            <dl>
              <div><dt>Income</dt><dd className="positive">{formatCurrencyAmount(summary.income, summary.currencyCode)}</dd></div>
              <div><dt>Expenses</dt><dd className="negative">{formatCurrencyAmount(summary.expenses, summary.currencyCode)}</dd></div>
              <div><dt>Net</dt><dd>{formatCurrencyAmount(summary.net, summary.currencyCode)}</dd></div>
            </dl>
          </article>
        ))}
      </section>
      {summaries.length > 0 && (
        <div className="dashboard-grid">
          <section aria-labelledby="category-breakdown-title" className="dashboard-section">
            <div className="section-heading">
              <h2 id="category-breakdown-title">Expense categories</h2>
              <Link href="/transactions?type=expense">View activity</Link>
            </div>
            {categoryTotals.length === 0 ? (
              <p className="empty-list">No expenses in this month.</p>
            ) : (
              <div className="chart-list">
                {categoryTotals.map((item) => (
                  <div className="chart-row" key={`${item.currencyCode}-${item.key}`}>
                    <div className="chart-row-label">
                      <span>{item.key}</span>
                      <strong>{formatCurrencyAmount(item.amount, item.currencyCode)}</strong>
                    </div>
                    <progress aria-label={`${item.key} expenses in ${item.currencyCode}`} max={maxForCurrency(categoryTotals, item.currencyCode)} value={item.amount} />
                    <small>{item.currencyCode}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section aria-labelledby="spending-trend-title" className="dashboard-section">
            <div className="section-heading"><h2 id="spending-trend-title">Daily spending</h2></div>
            {dailyTotals.length === 0 ? (
              <p className="empty-list">No expenses in this month.</p>
            ) : (
              <div className="chart-list">
                {dailyTotals.slice(-8).map((item) => (
                  <div className="chart-row" key={`${item.currencyCode}-${item.key}`}>
                    <div className="chart-row-label">
                      <span>{formatCalendarDate(item.key, "en-US")}</span>
                      <strong>{formatCurrencyAmount(item.amount, item.currencyCode)}</strong>
                    </div>
                    <progress aria-label={`Spending on ${item.key} in ${item.currencyCode}`} max={maxForCurrency(dailyTotals, item.currencyCode)} value={item.amount} />
                    <small>{item.currencyCode}</small>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      <section aria-labelledby="recent-transactions-title" className="dashboard-section recent-section">
        <div className="section-heading">
          <h2 id="recent-transactions-title">Recent transactions</h2>
          <Link href="/transactions">View all</Link>
        </div>
        {transactions.length === 0 ? (
          <p className="empty-list">No transactions for this month.</p>
        ) : (
          <ul className="recent-list">
            {transactions.slice(0, 6).map((transaction) => (
              <li key={transaction.id}>
                <span className={`transaction-type-mark ${transaction.type}`} aria-hidden="true">
                  {transaction.type === "income" ? "+" : "−"}
                </span>
                <span className="recent-description">
                  <strong>{transaction.description}</strong>
                  <small>{formatCalendarDate(transaction.occurred_on)}</small>
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
    </div>
  );
}