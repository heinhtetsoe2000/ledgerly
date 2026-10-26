import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CategoryManager } from "@/components/category-manager";
import { TransactionManager } from "@/components/transaction-manager";
import type { Database } from "@/lib/supabase/database.types";

afterEach(cleanup);

type Category = Database["public"]["Tables"]["categories"]["Row"];

const foodCategory: Category = {
  id: "20000000-0000-0000-0000-000000000001",
  user_id: "10000000-0000-0000-0000-000000000001",
  name: "Food",
  type: "expense",
  icon: "utensils",
  color: "#e76f51",
  is_default: true,
  created_at: "2026-10-25T00:00:00.000Z",
  updated_at: "2026-10-25T00:00:00.000Z",
};

describe("management components", () => {
  it("shows a clear empty state for categories", () => {
    render(<CategoryManager categories={[]} />);

    expect(screen.getByText("No categories yet.")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Add a category" })).toBeTruthy();
  });

  it("defaults new transactions to the profile currency and shows empty history", () => {
    render(
      <TransactionManager
        categories={[foodCategory]}
        currency="EUR"
        today="2026-10-25"
        totalCount={0}
        transactions={[]}
      />,
    );

    expect(screen.getByLabelText("Currency")).toHaveProperty("value", "EUR");
    expect(screen.getByText("No transactions recorded yet.")).toBeTruthy();
  });
});