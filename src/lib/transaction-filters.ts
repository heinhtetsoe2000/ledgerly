import { z } from "zod";
import { calendarDateSchema } from "@/lib/dates";
import type { Database } from "@/lib/supabase/database.types";

type TransactionType = Database["public"]["Enums"]["transaction_type"];

export type RawTransactionFilters = {
  type?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: string;
};

export type ParsedTransactionFilters = {
  type?: TransactionType;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page: number;
  error?: string;
};

export type TransactionFilterHandlers = {
  type?: (value: TransactionType) => void;
  categoryId?: (value: string) => void;
  startDate?: (value: string) => void;
  endDate?: (value: string) => void;
  search?: (value: string) => void;
};

export function applyTransactionFilters(
  filters: ParsedTransactionFilters,
  handlers: TransactionFilterHandlers,
): void {
  if (filters.type) handlers.type?.(filters.type);
  if (filters.categoryId) handlers.categoryId?.(filters.categoryId);
  if (filters.startDate) handlers.startDate?.(filters.startDate);
  if (filters.endDate) handlers.endDate?.(filters.endDate);
  if (filters.search) handlers.search?.(filters.search);
}

export function getTransactionPageRange(page: number, pageSize = 20): { from: number; to: number } {
  const safePage = Number.isSafeInteger(page) && page > 0 ? page : 1;
  const safePageSize = Number.isSafeInteger(pageSize) && pageSize > 0 ? pageSize : 20;
  return {
    from: (safePage - 1) * safePageSize,
    to: safePage * safePageSize - 1,
  };
}

export function parseTransactionFilters(raw: RawTransactionFilters): ParsedTransactionFilters {
  const type = raw.type ? z.enum(["income", "expense"]).safeParse(raw.type) : undefined;
  const category = raw.category ? z.uuid().safeParse(raw.category) : undefined;
  const hasStartDate = Boolean(raw.startDate);
  const hasEndDate = Boolean(raw.endDate);
  const validStartDate = hasStartDate && calendarDateSchema.safeParse(raw.startDate).success;
  const validEndDate = hasEndDate && calendarDateSchema.safeParse(raw.endDate).success;
  const search = raw.search?.trim() ?? "";
  const requestedPage = Number(raw.page || "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, 500)
    : 1;

  let error: string | undefined;
  if (type && !type.success) error = "Choose a valid transaction type.";
  else if (category && !category.success) error = "Choose a valid category.";
  else if ((hasStartDate && !validStartDate) || (hasEndDate && !validEndDate)) {
    error = "Enter valid calendar dates.";
  } else if (raw.startDate && raw.endDate && raw.startDate > raw.endDate) {
    error = "The end date must be on or after the start date.";
  } else if (search.length > 100) {
    error = "Search text must be 100 characters or fewer.";
  }

  return {
    type: type?.success ? type.data : undefined,
    categoryId: category?.success ? raw.category : undefined,
    startDate: validStartDate ? raw.startDate : undefined,
    endDate: validEndDate ? raw.endDate : undefined,
    search: search.length <= 100 ? search : undefined,
    page,
    error,
  };
}