import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteTransaction, saveTransaction } from "@/app/(app)/transactions/actions";

const mocks = vi.hoisted(() => {
  const transactions = {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  const categories = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  Object.values(transactions).forEach((method) => method.mockImplementation(() => transactions));
  Object.values(categories).forEach((method) => method.mockImplementation(() => categories));

  const authGetUser = vi.fn();
  const from = vi.fn((table: string) => table === "categories" ? categories : transactions);
  const createSupabaseServerClient = vi.fn(async () => ({
    auth: { getUser: authGetUser },
    from,
  }));

  return { authGetUser, categories, createSupabaseServerClient, from, transactions };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const userId = "10000000-0000-4000-8000-000000000001";
const transactionId = "30000000-0000-4000-8000-000000000001";
const categoryId = "20000000-0000-4000-8000-000000000001";

function transactionFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    type: "expense",
    amount: "12.34",
    currencyCode: "USD",
    description: "Lunch",
    occurredOn: "2026-10-25",
    categoryId: "",
    notes: "",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  mocks.categories.maybeSingle.mockResolvedValue({
    data: { id: categoryId, type: "expense" },
    error: null,
  });
  mocks.transactions.maybeSingle.mockResolvedValue({ data: { id: transactionId }, error: null });
});

describe("transaction server actions", () => {
  it("writes a validated transaction under the verified owner", async () => {
    const result = await saveTransaction({ status: "idle" }, transactionFormData({ categoryId }));

    expect(result.status).toBe("success");
    expect(mocks.from).toHaveBeenCalledWith("categories");
    expect(mocks.categories.eq).toHaveBeenCalledWith("user_id", userId);
    expect(mocks.from).toHaveBeenCalledWith("transactions");
    expect(mocks.transactions.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: userId,
      category_id: categoryId,
      amount: 12.34,
      currency_code: "USD",
    }));
  });

  it("rejects invalid amounts before calling the database", async () => {
    const result = await saveTransaction({ status: "idle" }, transactionFormData({ amount: "0" }));

    expect(result.status).toBe("error");
    expect(mocks.from).not.toHaveBeenCalled();
  });

  it("rejects categories whose type differs from the transaction", async () => {
    mocks.categories.maybeSingle.mockResolvedValue({
      data: { id: categoryId, type: "income" },
      error: null,
    });
    const result = await saveTransaction({ status: "idle" }, transactionFormData({ categoryId }));

    expect(result.message).toContain("category must match");
    expect(mocks.from).not.toHaveBeenCalledWith("transactions");
  });

  it("updates only a transaction owned by the verified user", async () => {
    const result = await saveTransaction(
      { status: "idle" },
      transactionFormData({ id: transactionId }),
    );

    expect(result.status).toBe("success");
    expect(mocks.transactions.update).toHaveBeenCalledWith(expect.objectContaining({ user_id: userId }));
    expect(mocks.transactions.eq).toHaveBeenNthCalledWith(1, "id", transactionId);
    expect(mocks.transactions.eq).toHaveBeenNthCalledWith(2, "user_id", userId);
  });

  it("scopes deletion to both transaction ID and owner ID", async () => {
    const formData = new FormData();
    formData.set("id", transactionId);
    const result = await deleteTransaction({ status: "idle" }, formData);

    expect(result.status).toBe("success");
    expect(mocks.transactions.delete).toHaveBeenCalled();
    expect(mocks.transactions.eq).toHaveBeenNthCalledWith(1, "id", transactionId);
    expect(mocks.transactions.eq).toHaveBeenNthCalledWith(2, "user_id", userId);
  });
});