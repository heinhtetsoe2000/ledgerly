import { connection } from "next/server";
import { DailySpendingHome } from "@/components/daily-spending-home";
import { SupabaseConfigStatus } from "@/components/supabase-config-status";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function OverviewPage() {
  await connection();
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const supabase = await createSupabaseServerClient();
  const [categoriesResult, profileResult] = await Promise.all([
    supabase!.from("categories").select("*").order("name"),
    supabase!.from("profiles").select("default_currency").maybeSingle(),
  ]);
  const todayTransactions = [];
  let todayTransactionError = false;
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase!
      .from("transactions")
      .select("id, type, amount, currency_code, description, occurred_on, category_id")
      .eq("occurred_on", today)
      .order("created_at", { ascending: false })
      .range(offset, offset + 999);

    if (error) {
      todayTransactionError = true;
      break;
    }
    todayTransactions.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  if (todayTransactionError) todayTransactions.length = 0;

  return (
    <div>
      <header className="page-heading">
        <div>
          <p className="eyebrow">PERSONAL FINANCE</p>
          <h1>Overview</h1>
          <p className="page-description">Your financial activity, gathered in one place.</p>
        </div>
      </header>
      <SupabaseConfigStatus />
      <DailySpendingHome
        canAddTransaction={!categoriesResult.error && !profileResult.error}
        categories={categoriesResult.data ?? []}
        currency={profileResult.data?.default_currency ?? "USD"}
        date={today}
        hasError={todayTransactionError}
        transactions={todayTransactions}
      />
    </div>
  );
}