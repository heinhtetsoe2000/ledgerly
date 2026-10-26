import { connection } from "next/server";
import { CategoryManager } from "@/components/category-manager";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const instant = false;

export default async function CategoriesPage() {
  await connection();
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase!
    .from("categories")
    .select("*")
    .order("type")
    .order("name");

  return (
    <div>
      <header className="page-heading">
        <div>
          <p className="eyebrow">ORGANIZE YOUR ACTIVITY</p>
          <h1>Categories</h1>
          <p className="page-description">Keep income and expenses organized around what matters to you.</p>
        </div>
      </header>
      {error ? (
        <p className="config-notice" role="status">
          Categories are unavailable until the database migrations are applied.
        </p>
      ) : (
        <CategoryManager categories={data ?? []} />
      )}
    </div>
  );
}