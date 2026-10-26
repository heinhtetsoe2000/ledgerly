"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validation/category";

export type CategoryActionState = {
  status: "idle" | "error" | "success";
  message?: string;
};

export async function saveCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    id: id || undefined,
    name: formData.get("name"),
    type: formData.get("type"),
    icon: formData.get("icon"),
    color: formData.get("color"),
  });

  if (!parsed.success) {
    return { status: "error", message: "Enter a name and choose a valid type, icon, and color." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Category services are not configured." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: "error", message: "Sign in again to manage categories." };
  }

  const categoryData = {
    name: parsed.data.name,
    type: parsed.data.type,
    icon: parsed.data.icon,
    color: parsed.data.color,
  };

  const query = parsed.data.id
    ? supabase.from("categories").update(categoryData)
        .eq("id", parsed.data.id).eq("user_id", user.id).select("id").maybeSingle()
    : supabase.from("categories").insert({ ...categoryData, user_id: user.id })
        .select("id").maybeSingle();
  const { data, error } = await query;

  if (error) {
    const message = error.code === "23505"
      ? "A category with that name and type already exists."
      : error.code === "23514"
        ? "This category type conflicts with transactions already assigned to it."
        : "Could not save the category. Try again later.";
    return { status: "error", message };
  }
  if (!data) {
    return { status: "error", message: "The category could not be found for this account." };
  }

  revalidatePath("/categories");
  return { status: "success", message: "Category saved." };
}

export async function deleteCategory(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const id = String(formData.get("id") ?? "");
  if (!id) {
    return { status: "error", message: "Select a category to delete." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Category services are not configured." };
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { status: "error", message: "Sign in again to manage categories." };
  }

  const { data, error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return error.code === "23503"
      ? { status: "error", message: "This category is assigned to transactions and cannot be deleted." }
      : { status: "error", message: "Could not delete the category. Try again later." };
  }
  if (!data) {
    return { status: "error", message: "The category could not be found for this account." };
  }

  revalidatePath("/categories");
  return { status: "success", message: "Category deleted." };
}