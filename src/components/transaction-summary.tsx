import { FinanceSummaryCard } from "@/components/finance-summary-card";
import type { FinancialSummary } from "@/lib/finance";

export function TransactionSummary({
  hasError,
  periodLabel,
  summaries,
}: {
  hasError: boolean;
  periodLabel: string;
  summaries: FinancialSummary[];
}) {
  return (
    <section aria-label="Transaction summary" className="transaction-summary-section">
      {hasError ? (
        <p className="config-notice" role="status">The transaction summary is unavailable right now.</p>
      ) : summaries.length === 0 ? (
        <p className="empty-list">No transactions to summarize.</p>
      ) : (
        <>
          <div className="section-heading transaction-summary-heading">
            <h2>Summary</h2>
            <span>By currency</span>
          </div>
          <div className="transaction-summary-cards">
            {summaries.map((summary) => (
              <FinanceSummaryCard
                amount={summary.net}
                amountLabel="Net total"
                currencyCode={summary.currencyCode}
                dateLabel={periodLabel}
                key={summary.currencyCode}
                metrics={[
                  { label: "Income", amount: summary.income },
                  { label: "Expenses", amount: summary.expenses },
                ]}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}