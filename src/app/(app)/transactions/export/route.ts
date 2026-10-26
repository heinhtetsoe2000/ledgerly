import { NextResponse, type NextRequest } from "next/server";
import { serializeTransactionsCsv } from "@/lib/csv";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applyTransactionFilters, parseTransactionFilters } from "@/lib/transaction-filters";

const batchSize = 1000;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const filters = parseTransactionFilters({
    type: params.get("type") ?? "",
    category: params.get("category") ?? "",
    startDate: params.get("startDate") ?? "",
    endDate: params.get("endDate") ?? "",
    search: params.get("search") ?? "",
  });

  if (filters.error) {
    return NextResponse.json({ error: filters.error }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Transaction services are not configured." }, { status: 503 });
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Sign in to export transactions." }, { status: 401 });
  }

  const transactions = [];
  for (let offset = 0; ; offset += batchSize) {
    let query = supabase
      .from("transactions")
      .select("id, type, amount, currency_code, description, occurred_on, category_id, notes")
      .order("occurred_on", { ascending: false })
      .order("created_at", { ascending: false })
      .range(offset, offset + batchSize - 1);
    applyTransactionFilters(filters, {
      type: (value) => { query = query.eq("type", value); },
      categoryId: (value) => { query = query.eq("category_id", value); },
      startDate: (value) => { query = query.gte("occurred_on", value); },
      endDate: (value) => { query = query.lte("occurred_on", value); },
      search: (value) => { query = query.ilike("description", `%${value}%`); },
    });

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: "Could not export transactions." }, { status: 500 });
    }
    transactions.push(...(data ?? []));
    if (!data || data.length < batchSize) break;
  }

  const categoryIds = [...new Set(transactions.flatMap((row) => row.category_id ? [row.category_id] : []))];
  const { data: categories, error: categoryError } = categoryIds.length
    ? await supabase.from("categories").select("id, name").in("id", categoryIds)
    : { data: [], error: null };
  if (categoryError) {
    return NextResponse.json({ error: "Could not export transaction categories." }, { status: 500 });
  }
  const categoryNames = new Map((categories ?? []).map((categoryRow) => [categoryRow.id, categoryRow.name]));
  const csv = serializeTransactionsCsv(transactions.map((row) => ({
    occurredOn: row.occurred_on,
    type: row.type,
    amount: String(row.amount),
    currencyCode: row.currency_code,
    description: row.description,
    category: row.category_id ? categoryNames.get(row.category_id) ?? "" : "",
    notes: row.notes ?? "",
  })));

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="transactions.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}