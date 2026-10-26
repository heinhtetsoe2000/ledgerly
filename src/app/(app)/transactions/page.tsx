import { TransactionManager } from "@/components/transaction-manager";
import Link from "next/link";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  applyTransactionFilters,
  getTransactionPageRange,
  parseTransactionFilters,
} from "@/lib/transaction-filters";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const instant = false;

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function TransactionsPage({ searchParams }: { searchParams: SearchParams }) {
  await connection();
  const params = await searchParams;
  const rawType = firstValue(params.type);
  const rawCategory = firstValue(params.category);
  const rawStartDate = firstValue(params.startDate);
  const rawEndDate = firstValue(params.endDate);
  const rawSearch = firstValue(params.search);
  const filters = parseTransactionFilters({
    type: rawType,
    category: rawCategory,
    startDate: rawStartDate,
    endDate: rawEndDate,
    search: rawSearch,
    page: firstValue(params.page),
  });
  const { page, error: filterError } = filters;
  const pageSize = 20;
  const pageRange = getTransactionPageRange(page, pageSize);

  const supabase = await createSupabaseServerClient();
  const [categoriesResult, profileResult] = await Promise.all([
    supabase!.from("categories").select("*").order("name"),
    supabase!.from("profiles").select("default_currency").maybeSingle(),
  ]);
  let transactionQuery = supabase!.from("transactions").select("*", { count: "exact" });
  applyTransactionFilters(filters, {
    type: (value) => { transactionQuery = transactionQuery.eq("type", value); },
    categoryId: (value) => { transactionQuery = transactionQuery.eq("category_id", value); },
    startDate: (value) => { transactionQuery = transactionQuery.gte("occurred_on", value); },
    endDate: (value) => { transactionQuery = transactionQuery.lte("occurred_on", value); },
    search: (value) => { transactionQuery = transactionQuery.ilike("description", `%${value}%`); },
  });
  const transactionsResult = filterError
    ? { data: [], count: 0, error: null }
    : await transactionQuery
        .order("occurred_on", { ascending: false })
        .order("created_at", { ascending: false })
        .range(pageRange.from, pageRange.to);
  const totalCount = transactionsResult.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const filterParams = new URLSearchParams();
  if (filters.type) filterParams.set("type", filters.type);
  if (filters.categoryId) filterParams.set("category", filters.categoryId);
  if (filters.startDate) filterParams.set("startDate", filters.startDate);
  if (filters.endDate) filterParams.set("endDate", filters.endDate);
  if (filters.search) filterParams.set("search", filters.search);
  const pageHref = (pageNumber: number) => {
    const query = new URLSearchParams(filterParams);
    query.set("page", String(pageNumber));
    return `/transactions?${query.toString()}`;
  };

  return (
    <div>
      <header className="page-heading">
        <div>
          <p className="eyebrow">YOUR MONEY, ORGANIZED</p>
          <h1>Transactions</h1>
          <p className="page-description">Record income and expenses and keep their currencies distinct.</p>
        </div>
      </header>
      {transactionsResult.error || categoriesResult.error || profileResult.error ? (
        <p className="config-notice" role="status">
          Transactions are unavailable until the database migrations are applied.
        </p>
      ) : (
        <>
          {filterError && <p className="config-notice" role="alert">{filterError}</p>}
          <form action="/transactions" className="transaction-filters" method="get">
            <label className="field-label">
              Search description
              <input defaultValue={rawSearch} maxLength={100} name="search" type="search" />
            </label>
            <label className="field-label">
              Type
              <select defaultValue={rawType} name="type">
                <option value="">All types</option>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="field-label">
              Category
              <select defaultValue={rawCategory} name="category">
                <option value="">All categories</option>
                {(categoriesResult.data ?? []).map((categoryOption) => (
                  <option key={categoryOption.id} value={categoryOption.id}>{categoryOption.name}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              From
              <input defaultValue={rawStartDate} name="startDate" type="date" />
            </label>
            <label className="field-label">
              To
              <input defaultValue={rawEndDate} name="endDate" type="date" />
            </label>
            <div className="filter-actions">
              <button className="filter-submit" type="submit">Apply filters</button>
              <Link href="/transactions">Clear</Link>
              {!filterError && <a href={`/transactions/export?${filterParams.toString()}`}>Export CSV</a>}
            </div>
          </form>
          <TransactionManager
            categories={categoriesResult.data ?? []}
            currency={profileResult.data?.default_currency ?? "USD"}
            today={new Date().toISOString().slice(0, 10)}
            totalCount={totalCount}
            transactions={transactionsResult.data ?? []}
          />
          <nav aria-label="Transaction pages" className="pagination">
            <span>
              {totalCount === 0 ? "No results" : `Page ${page} of ${pageCount} · ${totalCount} transactions`}
            </span>
            <div>
              {page > 1 && <Link href={pageHref(page - 1)}>Previous</Link>}
              {page < pageCount && <Link href={pageHref(page + 1)}>Next</Link>}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}