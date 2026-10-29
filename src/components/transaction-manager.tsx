"use client";

import { useActionState, useState } from "react";
import { Tag } from "lucide-react";
import type { Database } from "@/lib/supabase/database.types";
import { formatCalendarDate } from "@/lib/dates";
import { formatCurrencyAmount } from "@/lib/currency";
import { categoryIcons } from "@/components/category-icons";
import { Button } from "@/components/ui/button";
import {
  deleteTransaction,
  saveTransaction,
  type TransactionActionState,
} from "@/app/(app)/transactions/actions";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const initialState: TransactionActionState = { status: "idle" };

export function TransactionForm({
  categories,
  currency,
  hideTypeAndCurrency = false,
  initialType = "expense",
  today,
  transaction,
  onSaved,
}: {
  categories: Category[];
  currency: string;
  hideTypeAndCurrency?: boolean;
  initialType?: Transaction["type"];
  today: string;
  transaction?: Transaction;
  onSaved?: () => void;
}) {
  const [state, action, pending] = useActionState(async (
    previousState: TransactionActionState,
    formData: FormData,
  ) => {
    const nextState = await saveTransaction(previousState, formData);
    if (nextState.status === "success") onSaved?.();
    return nextState;
  }, initialState);
  const [type, setType] = useState<Transaction["type"]>(transaction?.type ?? initialType);
  const filteredCategories = categories.filter((category) => category.type === type);

  return (
    <form action={action} className="transaction-form">
      {transaction && <input name="id" type="hidden" value={transaction.id} />}
      {hideTypeAndCurrency ? (
        <>
          <input name="type" type="hidden" value={type} />
          <input name="currencyCode" type="hidden" value={transaction?.currency_code ?? currency} />
        </>
      ) : (
        <label className="field-label">
          Type
          <select name="type" onChange={(event) => setType(event.target.value as Transaction["type"])}
            value={type}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
      )}
      <div className="transaction-form-row">
        <label className="field-label">
          Amount
          <input
            defaultValue={transaction?.amount ?? ""}
            inputMode="decimal"
            max="999999999999.99"
            min="0.01"
            name="amount"
            placeholder="0.00"
            required
            step="0.01"
            type="number"
          />
        </label>
        {!hideTypeAndCurrency && (
          <label className="field-label">
            Currency
            <input
              autoCapitalize="characters"
              defaultValue={transaction?.currency_code ?? currency}
              maxLength={3}
              minLength={3}
              name="currencyCode"
              pattern="[A-Za-z]{3}"
              required
            />
          </label>
        )}
      </div>
      <label className="field-label">
        Description
        <input defaultValue={transaction?.description ?? ""} maxLength={240} name="description" required />
      </label>
      <div className="transaction-form-row">
        <label className="field-label">
          Date
          <input defaultValue={transaction?.occurred_on ?? today} name="occurredOn" required type="date" />
        </label>
        <label className="field-label">
          Category
          <select defaultValue={transaction?.category_id ?? ""} name="categoryId">
            <option value="">Uncategorized</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field-label">
        Notes <span className="field-optional">Optional</span>
        <textarea defaultValue={transaction?.notes ?? ""} maxLength={2000} name="notes" rows={3} />
      </label>
      {state.message && (
        <p className={state.status === "error" ? "auth-feedback auth-error" : "auth-feedback auth-success"}
          role={state.status === "error" ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <Button disabled={pending} type="submit">
        {pending ? "Saving…" : transaction ? "Save changes" : "Add transaction"}
      </Button>
    </form>
  );
}

function TransactionItem({
  transaction,
  category,
  categories,
  currency,
  today,
}: {
  transaction: Transaction;
  category?: Category;
  categories: Category[];
  currency: string;
  today: string;
}) {
  const [state, action, pending] = useActionState(deleteTransaction, initialState);
  const categoryName = category?.name ?? "Uncategorized";
  const categoryIconName = category && categoryIcons[category.icon] ? category.icon : "tag";
  const CategoryIcon = categoryIcons[categoryIconName] ?? Tag;
  const secondaryText = transaction.notes?.trim() || `${transaction.type === "income" ? "Income" : "Expense"} · ${categoryName}`;

  return (
    <details className="transaction-item">
      <summary aria-label={`Edit ${transaction.description}`} className="transaction-summary">
        <span
          aria-hidden="true"
          className="transaction-category-icon"
          data-icon={categoryIconName}
          style={category?.color ? { color: category.color } : undefined}
        >
          <CategoryIcon size={20} strokeWidth={1.8} />
        </span>
        <div className="transaction-description">
          <strong>{transaction.description}</strong>
          <span>{secondaryText}</span>
        </div>
        <strong className={`transaction-amount ${transaction.type}`}>
          {transaction.type === "expense" ? "−" : "+"}
          {formatCurrencyAmount(String(transaction.amount), transaction.currency_code)}
        </strong>
      </summary>
      <div className="transaction-detail-body">
        <TransactionForm categories={categories} currency={currency} today={today} transaction={transaction} />
        {transaction.notes && <p className="transaction-notes">{transaction.notes}</p>}
        <form action={action} onSubmit={(event) => {
          if (!window.confirm(`Delete “${transaction.description}”?`)) event.preventDefault();
        }}>
          <input name="id" type="hidden" value={transaction.id} />
          <Button disabled={pending} size="sm" type="submit" variant="ghost">Delete transaction</Button>
          {state.message && (
            <p className={state.status === "error" ? "auth-feedback auth-error" : "auth-feedback auth-success"}
              role={state.status === "error" ? "alert" : "status"}>
              {state.message}
            </p>
          )}
        </form>
      </div>
    </details>
  );
}

export function TransactionManager({
  categories,
  currency,
  today,
  totalCount,
  transactions,
}: {
  categories: Category[];
  currency: string;
  today: string;
  totalCount: number;
  transactions: Transaction[];
}) {
  const categoriesById = new Map(categories.map((category) => [category.id, category]));
  const transactionGroups: Array<{ date: string; label: string; transactions: Transaction[] }> = [];

  for (const transaction of transactions) {
    const currentGroup = transactionGroups[transactionGroups.length - 1];
    if (currentGroup?.date === transaction.occurred_on) {
      currentGroup.transactions.push(transaction);
      continue;
    }

    transactionGroups.push({
      date: transaction.occurred_on,
      label: formatTransactionGroupDate(transaction.occurred_on, today),
      transactions: [transaction],
    });
  }

  return (
    <div className="transaction-manager">
      <section aria-labelledby="transaction-history-title" className="transaction-history">
        <div className="section-heading">
          <h2 id="transaction-history-title">Transaction history</h2>
          <span>{totalCount}</span>
        </div>
        {transactions.length === 0 ? (
          <p className="empty-list">No transactions recorded yet.</p>
        ) : (
          <div className="transaction-list">
            {transactionGroups.map((group) => (
              <section aria-labelledby={`transaction-date-${group.date}`} className="transaction-date-group" key={group.date}>
                <h3 className="transaction-date-heading" id={`transaction-date-${group.date}`}>{group.label}</h3>
                <div className="transaction-date-items">
                  {group.transactions.map((transaction) => (
                    <TransactionItem
                      categories={categories}
                      category={transaction.category_id ? categoriesById.get(transaction.category_id) : undefined}
                      currency={currency}
                      key={transaction.id}
                      today={today}
                      transaction={transaction}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function formatTransactionGroupDate(date: string, today: string): string {
  if (date === today) return "Today";

  const yesterday = new Date(`${today}T00:00:00.000Z`);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  if (date === yesterday.toISOString().slice(0, 10)) return "Yesterday";

  const transactionDate = new Date(`${date}T00:00:00.000Z`);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(transactionDate);
}