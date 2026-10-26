"use client";

import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Database } from "@/lib/supabase/database.types";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "@/components/transaction-manager";

type Category = Database["public"]["Tables"]["categories"]["Row"];

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

  function openDialog(trigger: HTMLButtonElement) {
    triggerRef.current = trigger;
    setFormVersion((version) => version + 1);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  return (
    <>
      <Button
        className="quick-add-link"
        disabled={disabled}
        onClick={(event) => openDialog(event.currentTarget)}
        type="button"
      >
        <Plus aria-hidden="true" size={18} />
        <span>Add transaction</span>
      </Button>
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
              onClick={closeDialog}
              size="icon"
              type="button"
              variant="ghost"
            >
              <X aria-hidden="true" size={18} />
            </Button>
          </header>
          <TransactionForm
            categories={categories}
            currency={currency}
            key={formVersion}
            onSaved={closeDialog}
            today={today}
          />
        </div>
      </dialog>
    </>
  );
}