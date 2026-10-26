export type CsvTransaction = {
  occurredOn: string;
  type: string;
  amount: string;
  currencyCode: string;
  description: string;
  category: string;
  notes: string;
};

const headers = ["date", "type", "amount", "currency", "description", "category", "notes"];

export function escapeCsvCell(value: string): string {
  const safeValue = /^[\u0000-\u0020]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safeValue.replaceAll('"', '""')}"`;
}

export function serializeTransactionsCsv(rows: readonly CsvTransaction[]): string {
  const headerLine = headers.map(escapeCsvCell).join(",");
  const dataLines = rows.map((row) => [
    row.occurredOn,
    row.type,
    row.amount,
    row.currencyCode,
    row.description,
    row.category,
    row.notes,
  ].map(escapeCsvCell).join(","));

  return [headerLine, ...dataLines].join("\r\n");
}