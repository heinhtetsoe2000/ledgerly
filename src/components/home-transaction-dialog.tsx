"use client";

import { X } from "lucide-react";
import { useRef, useState } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-manager";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type TransactionType = Database["public"]["Enums"]["transaction_type"];

export function HomeTransactionDialog({
  categories,
  currency,
  disabled,
  today,
}: {
  categories: Category[];
  currency: string;
  disabled: boolean;
  today: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [formVersion, setFormVersion] = useState(0);
  const [entryType, setEntryType] = useState<TransactionType>("expense");

  function openDialog(trigger: HTMLButtonElement, type: TransactionType) {
    triggerRef.current = trigger;
    setEntryType(type);
    setFormVersion((version) => version + 1);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <div className="quick-add-actions">
        <Button
          className="quick-add-link expense"
          disabled={disabled}
          onClick={(event) => openDialog(event.currentTarget, "expense")}
          type="button"
        >
          <span>Add expense</span>
        </Button>
        <Button
          className="quick-add-link income"
          disabled={disabled}
          onClick={(event) => openDialog(event.currentTarget, "income")}
          type="button"
        >
          <span>Add income</span>
        </Button>
      </div>
      {disabled && <p className="config-notice" role="status">Transaction entry is unavailable right now.</p>}
      <dialog
        aria-labelledby="home-transaction-dialog-title"
        className="home-transaction-dialog"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
        onClose={() => triggerRef.current?.focus()}
        ref={dialogRef}
      >
        <div className="home-transaction-dialog-panel">
          <header className="home-transaction-dialog-heading">
            <h2 id="home-transaction-dialog-title">Add a transaction</h2>
            <Button
              aria-label="Close transaction dialog"
              className="home-transaction-dialog-close"
              onClick={closeDialog}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" size={18} />
            </Button>
          </header>
          <div className="home-transaction-dialog-content">
            <TransactionForm
              categories={categories}
              currency={currency}
              hideTypeAndCurrency
              key={formVersion}
              initialType={entryType}
              onSaved={closeDialog}
              today={today}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}