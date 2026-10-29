import { formatCurrencyAmount } from "@/lib/currency";

type SummaryMetric = {
  label: string;
  amount: string;
};

export function FinanceSummaryCard({
  dateLabel,
  currencyCode,
  amount,
  amountLabel,
  metrics,
}: {
  dateLabel: string;
  currencyCode: string;
  amount: string;
  amountLabel: string;
  metrics: SummaryMetric[];
}) {
  return (
    <article aria-label={`${dateLabel}, ${currencyCode} ${amountLabel}`} className="finance-summary-card">
      <div className="finance-summary-card-heading">
        <span>{dateLabel}</span>
        <span className="finance-summary-card-currency">{currencyCode}</span>
      </div>
      <span className="finance-summary-card-label">{amountLabel}</span>
      <strong className="finance-summary-card-amount">
        {formatCurrencyAmount(amount, currencyCode)}
      </strong>
      <dl className="finance-summary-card-metrics">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <dt>{metric.label}</dt>
            <dd>{formatCurrencyAmount(metric.amount, currencyCode)}</dd>
          </div>
        ))}
      </dl>
    </article>
  );
}
