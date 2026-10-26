import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteCategory, saveCategory } from "@/app/(app)/categories/actions";

const mocks = vi.hoisted(() => {
  const categories = {
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(),
  };
  Object.values(categories).forEach((method) => method.mockImplementation(() => categories));

  const authGetUser = vi.fn();
  const from = vi.fn(() => categories);
  const createSupabaseServerClient = vi.fn(async () => ({
    auth: { getUser: authGetUser },
    from,
  }));

  return { authGetUser, categories, createSupabaseServerClient, from };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const userId = "10000000-0000-4000-8000-000000000001";
const categoryId = "20000000-0000-4000-8000-000000000001";

function categoryFormData(overrides: Record<string, string> = {}) {
  const formData = new FormData();
  const values = {
    name: "Food",
    type: "expense",
    icon: "utensils",
    color: "#e76f51",
    ...overrides,
  };
  Object.entries(values).forEach(([key, value]) => formData.set(key, value));
  return formData;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.authGetUser.mockResolvedValue({ data: { user: { id: userId } }, error: null });
  mocks.categories.maybeSingle.mockResolvedValue({ data: { id: categoryId }, error: null });
});

describe("category server actions", () => {
  it("creates a category for the verified owner", async () => {
    const result = await saveCategory({ status: "idle" }, categoryFormData());

    expect(result.status).toBe("success");
    expect(mocks.from).toHaveBeenCalledWith("categories");
    expect(mocks.categories.insert).toHaveBeenCalledWith(expect.objectContaining({
      user_id: userId,
      name: "Food",
      type: "expense",
    }));
  });

  it("updates only a category owned by the verified user", async () => {
    const result = await saveCategory({ status: "idle" }, categoryFormData({ id: categoryId }));

    expect(result.status).toBe("success");
    expect(mocks.categories.update).toHaveBeenCalled();
    expect(mocks.categories.eq).toHaveBeenNthCalledWith(1, "id", categoryId);
    expect(mocks.categories.eq).toHaveBeenNthCalledWith(2, "user_id", userId);
  });

  it("explains why an in-use category cannot be deleted", async () => {
    mocks.categories.maybeSingle.mockResolvedValue({ data: null, error: { code: "23503" } });
    const formData = new FormData();
    formData.set("id", categoryId);

    const result = await deleteCategory({ status: "idle" }, formData);

    expect(result.status).toBe("error");
    expect(result.message).toContain("assigned to transactions");
    expect(mocks.categories.eq).toHaveBeenNthCalledWith(1, "id", categoryId);
    expect(mocks.categories.eq).toHaveBeenNthCalledWith(2, "user_id", userId);
  });
});