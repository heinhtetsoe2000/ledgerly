import { formatCurrencyAmount } from "@/lib/currency";
import type { FinancialSummary } from "@/lib/finance";

export function TransactionSummary({
  hasError,
  summaries,
}: {
  hasError: boolean;
  summaries: FinancialSummary[];
}) {
  return (
    <section aria-label="Transaction summary" className="transaction-summary-section">
      {hasError ? (
        <p className="config-notice" role="status">The transaction summary is unavailable right now.</p>
      ) : summaries.length === 0 ? (
        <p className="empty-list">No transactions to summarize.</p>
      ) : (
        <div className="transaction-summary-cards">
          {summaries.map((summary) => (
            <article aria-label={`${summary.currencyCode} summary`} className="today-expense-total transaction-summary-card" key={summary.currencyCode}>
              <span className="transaction-summary-currency">{summary.currencyCode}</span>
              <div className="transaction-summary-balance">
                <span>Total balance</span>
                <strong>{formatCurrencyAmount(summary.net, summary.currencyCode)}</strong>
              </div>
              <dl className="transaction-summary-breakdown">
                <div>
                  <dt>Income</dt>
                  <dd>{formatCurrencyAmount(summary.income, summary.currencyCode)}</dd>
                </div>
                <div>
                  <dt>Expenses</dt>
                  <dd>{formatCurrencyAmount(summary.expenses, summary.currencyCode)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}