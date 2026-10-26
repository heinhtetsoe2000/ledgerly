"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validation/transaction";

export type TransactionActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function saveTransaction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const id = String(formData.get("id") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const parsed = transactionSchema.safeParse({
    type: formData.get("type"),
    amount: formData.get("amount"),
    currencyCode: formData.get("currencyCode"),
    description: formData.get("description"),
    occurredOn: formData.get("occurredOn"),
    categoryId: categoryId || undefined,
    notes: notes || undefined,
  });

  if (!parsed.success) {
    return { status: "error", message: "Check the amount, type, currency, description, and date." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Transaction services are not configured." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: "error", message: "Sign in again to save transactions." };
  }

  if (parsed.data.categoryId) {
    const { data: category, error } = await supabase
      .from("categories")
      .select("id, type")
      .eq("id", parsed.data.categoryId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (error || !category) {
      return { status: "error", message: "Choose a category from your account." };
    }
    if (category.type !== parsed.data.type) {
      return { status: "error", message: "The category must match the transaction type." };
    }
  }

  const transactionData = {
    user_id: user.id,
    category_id: parsed.data.categoryId ?? null,
    type: parsed.data.type,
    amount: Number(parsed.data.amount),
    currency_code: parsed.data.currencyCode,
    description: parsed.data.description,
    occurred_on: parsed.data.occurredOn,
    notes: parsed.data.notes ?? null,
  };

  const query = id
    ? supabase.from("transactions").update(transactionData)
        .eq("id", id).eq("user_id", user.id).select("id").maybeSingle()
    : supabase.from("transactions").insert(transactionData).select("id").maybeSingle();
  const { data, error } = await query;

  if (error) {
    return { status: "error", message: "Could not save the transaction. Check the details and try again." };
  }
  if (!data) {
    return { status: "error", message: "The transaction could not be found for this account." };
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  return { status: "success", message: id ? "Transaction updated." : "Transaction added." };
}

export async function deleteTransaction(
  _previousState: TransactionActionState,
  formData: FormData,
): Promise<TransactionActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { status: "error", message: "Select a transaction to delete." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Transaction services are not configured." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: "error", message: "Sign in again to delete transactions." };
  }

  const { data, error } = await supabase
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return { status: "error", message: "Could not delete the transaction. Try again later." };
  }
  if (!data) {
    return { status: "error", message: "The transaction could not be found for this account." };
  }

  revalidatePath("/transactions");
  revalidatePath("/");
  return { status: "success", message: "Transaction deleted." };
}