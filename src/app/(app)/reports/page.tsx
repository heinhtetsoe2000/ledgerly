import Link from "next/link";
import { connection } from "next/server";
import { formatCurrencyAmount } from "@/lib/currency";
import { dateRangeSchema } from "@/lib/dates";
import { groupAmounts, summarizeByMonthAndCurrency } from "@/lib/finance";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const pageSize = 1000;

export const instant = false;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function monthLabel(month: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${month}-01T00:00:00.000Z`));
}

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const defaultStartDate = `${today.slice(0, 8)}01`;
  const startDate = firstValue(params.startDate) || defaultStartDate;
  const endDate = firstValue(params.endDate) || today;
  const range = dateRangeSchema.safeParse({ startDate, endDate });
  const filterParams = new URLSearchParams({ startDate, endDate });

  if (!range.success) {
    return (
      <div>
        <header className="page-heading">
          <div><p className="eyebrow">FINANCIAL ANALYSIS</p><h1>Financial Analysis</h1></div>
        </header>
        <p className="config-notice" role="alert">Select a valid date range. The end date must be on or after the start date.</p>
        <DateRangeForm startDate={startDate} endDate={endDate} />
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const rows = [];
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase!
      .from("transactions")
      .select("id, type, amount, currency_code, description, occurred_on, category_id")
      .gte("occurred_on", range.data.startDate)
      .lte("occurred_on", range.data.endDate)
      .order("occurred_on", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) {
      return (
        <div>
          <header className="page-heading">
            <div><p className="eyebrow">FINANCIAL ANALYSIS</p><h1>Financial Analysis</h1></div>
          </header>
          <DateRangeForm startDate={startDate} endDate={endDate} />
          <p className="config-notice" role="status">Report data is unavailable until the database migrations are applied.</p>
        </div>
      );
    }
    rows.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }

  const categoryIds = [...new Set(rows.flatMap((row) => row.category_id ? [row.category_id] : []))];
  const { data: categories, error: categoryError } = categoryIds.length
    ? await supabase!.from("categories").select("id, name").in("id", categoryIds)
    : { data: [], error: null };
  const categoryNames = new Map((categories ?? []).map((category) => [category.id, category.name]));
  const entries = rows.map((row) => ({
    amount: String(row.amount),
    currencyCode: row.currency_code,
    type: row.type,
    occurredOn: row.occurred_on,
  }));
  const monthlySummaries = summarizeByMonthAndCurrency(entries);
  const expenses = rows.filter((row) => row.type === "expense").map((row) => ({
    amount: String(row.amount),
    currencyCode: row.currency_code,
    category: row.category_id ? categoryNames.get(row.category_id) ?? "Uncategorized" : "Uncategorized",
    month: row.occurred_on.slice(0, 7),
  }));
  const categoryTotals = groupAmounts(expenses, (entry) => entry.category);
  const monthlyExpenseTotals = groupAmounts(expenses, (entry) => entry.month);
  const maxForCurrency = (currencyCode: string) => Math.max(0, ...categoryTotals
    .filter((item) => item.currencyCode === currencyCode)
    .map((item) => Number(item.amount)));
  const exportHref = `/transactions/export?${filterParams.toString()}`;

  return (
    <div>
      <header className="page-heading">
        <div>
          <p className="eyebrow">FINANCIAL ANALYSIS</p>
          <h1>Financial Analysis</h1>
          <p className="page-description">Review trends across an inclusive calendar date range.</p>
        </div>
        <Link className="report-export" href={exportHref}>Export CSV</Link>
      </header>
      <DateRangeForm startDate={startDate} endDate={endDate} />
      {categoryError && <p className="config-notice" role="status">Category names are unavailable for this report.</p>}
      {rows.length === 0 ? (
        <section aria-label="Empty report" className="overview-empty report-empty">
          <div>
            <p className="eyebrow">NO ACTIVITY</p>
            <h2>No transactions in this range</h2>
            <p>Choose another date range or add transactions to see a report.</p>
          </div>
        </section>
      ) : (
        <>
          <section aria-labelledby="monthly-comparison-title" className="dashboard-section report-section">
            <div className="section-heading"><h2 id="monthly-comparison-title">Monthly comparison by currency</h2></div>
            <div className="report-table-wrap">
              <table className="report-table">
                <thead><tr><th>Month</th><th>Currency</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead>
                <tbody>
                  {monthlySummaries.map((summary) => (
                    <tr key={`${summary.month}-${summary.currencyCode}`}>
                      <th scope="row">{monthLabel(summary.month)}</th>
                      <td>{summary.currencyCode}</td>
                      <td className="positive">{formatCurrencyAmount(summary.income, summary.currencyCode)}</td>
                      <td className="negative">{formatCurrencyAmount(summary.expenses, summary.currencyCode)}</td>
                      <td>{formatCurrencyAmount(summary.net, summary.currencyCode)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <div className="dashboard-grid">
            <section aria-labelledby="report-categories-title" className="dashboard-section">
              <div className="section-heading"><h2 id="report-categories-title">Expenses by category</h2></div>
              {categoryTotals.length === 0 ? <p className="empty-list">No expenses in this range.</p> : (
                <div className="chart-list">
                  {categoryTotals.map((item) => (
                    <div className="chart-row" key={`${item.currencyCode}-${item.key}`}>
                      <div className="chart-row-label"><span>{item.key}</span><strong>{formatCurrencyAmount(item.amount, item.currencyCode)}</strong></div>
                      <progress aria-label={`${item.key} expenses in ${item.currencyCode}`} max={maxForCurrency(item.currencyCode)} value={item.amount} />
                      <small>{item.currencyCode}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>
            <section aria-labelledby="report-trend-title" className="dashboard-section">
              <div className="section-heading"><h2 id="report-trend-title">Monthly spending trend</h2></div>
              {monthlyExpenseTotals.length === 0 ? <p className="empty-list">No expenses in this range.</p> : (
                <div className="chart-list">
                  {monthlyExpenseTotals.map((item) => (
                    <div className="chart-row" key={`${item.currencyCode}-${item.key}`}>
                      <div className="chart-row-label"><span>{monthLabel(item.key)}</span><strong>{formatCurrencyAmount(item.amount, item.currencyCode)}</strong></div>
                      <progress aria-label={`Expenses in ${monthLabel(item.key)} ${item.currencyCode}`} max={Math.max(0, ...monthlyExpenseTotals.filter((value) => value.currencyCode === item.currencyCode).map((value) => Number(value.amount)))} value={item.amount} />
                      <small>{item.currencyCode}</small>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function DateRangeForm({ startDate, endDate }: { startDate: string; endDate: string }) {
  return (
    <form action="/reports" className="report-range-form" method="get">
      <label className="field-label">From<input defaultValue={startDate} name="startDate" required type="date" /></label>
      <label className="field-label">To<input defaultValue={endDate} name="endDate" required type="date" /></label>
      <button className="filter-submit" type="submit">Run report</button>
    </form>
  );
}