import { expect, test } from "@playwright/test";

async function signUp(page: import("@playwright/test").Page) {
  const accountId = crypto.randomUUID();
  const account = {
    email: `e2e-${accountId}@example.test`,
    password: `Qa-${accountId}-B7!`,
  };

  await page.goto("/sign-up");
  await page.getByLabel("Display name").fill("E2E Finance User");
  await page.getByLabel("Email address").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("No expenses recorded today.")).toBeVisible();
  await expect(page.getByText("No transactions recorded today.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add transaction" })).toBeVisible();
  return account;
}

test("registration, persistent session, sign-out, and protected redirect", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/sign-in");
  await expect(page.getByLabel("Email address")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);

  const focusOrder: string[] = [];
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("Tab");
    focusOrder.push(await page.evaluate(() => {
      const active = document.activeElement;
      return active?.getAttribute("name") || active?.getAttribute("aria-label") || active?.textContent?.trim() || "";
    }));
  }
  expect(focusOrder).toEqual(["Ledgerly home", "email", "password", "Sign in"]);

  const contrastForSubmit = () => page.evaluate(() => {
    const luminance = (color: string) => {
      const channels = color.match(/\d+/g)?.slice(0, 3).map(Number) ?? [0, 0, 0];
      const linear = channels.map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
    };
    const button = document.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (!button) return 0;
    const style = getComputedStyle(button);
    const values = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  });

  await page.emulateMedia({ colorScheme: "light" });
  expect(await contrastForSubmit()).toBeGreaterThanOrEqual(4.5);
  await page.emulateMedia({ colorScheme: "dark" });
  expect(await contrastForSubmit()).toBeGreaterThanOrEqual(4.5);

  const account = await signUp(page);

  await page.reload();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);
  await page.goto("/transactions");
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("Email address").fill(account.email);
  await page.getByLabel("Password").fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator(".auth-error")).toContainText("Email or password is incorrect.");

  await page.getByLabel("Email address").fill(account.email);
  await page.getByLabel("Password").fill(account.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
});

test("mobile finance workflows, transaction edit, filters, reports, export, and deletion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await signUp(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.goto("/settings");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.locator("#settings-name").fill("E2E Updated Name");
  await page.locator("#settings-currency").fill("EUR");
  await page.locator("#settings-theme").selectOption("dark");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved.");

  await page.goto("/categories");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const categoryForm = page.locator(".category-form").first();
  await categoryForm.locator('input[name="name"]').fill("E2E Test Category");
  await categoryForm.locator('select[name="type"]').selectOption("expense");
  await categoryForm.locator('select[name="icon"]').selectOption("tag");
  await categoryForm.locator('input[name="color"]').fill("#336699");
  await page.getByRole("button", { name: "Add category" }).click();
  await expect(page.getByRole("status")).toContainText("Category saved.");
  const categoryRow = page.locator(".category-item").filter({ hasText: "E2E Test Category" });
  await expect(categoryRow).toBeVisible();
  await categoryRow.locator(".category-edit summary").click();
  await categoryRow.locator('.category-edit input[name="name"]').fill("E2E Edited Category");
  await categoryRow.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("E2E Edited Category", { exact: true })).toBeVisible();

  await page.goto("/");
  const quickAddButton = page.getByRole("button", { name: "Add transaction" });
  await quickAddButton.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator(".home-transaction-dialog")).toBeVisible();
  expect(await page.locator(".home-transaction-dialog").evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.keyboard.press("Escape");
  await expect(page.locator(".home-transaction-dialog")).not.toBeVisible();
  await expect(quickAddButton).toBeFocused();
  await quickAddButton.click();
  await expect(page.locator(".home-transaction-dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add a transaction" })).toBeVisible();
  const quickAddForm = page.locator(".home-transaction-dialog .transaction-form");
  await expect(quickAddForm.locator('input[name="currencyCode"]')).toHaveValue("EUR");
  const today = await quickAddForm.locator('input[name="occurredOn"]').inputValue();
  await quickAddForm.evaluate((form) => { (form as HTMLFormElement).noValidate = true; });
  await quickAddForm.locator('input[name="amount"]').fill("1.234");
  await quickAddForm.locator('input[name="description"]').fill("E2E invalid amount");
  await quickAddForm.getByRole("button", { name: "Add transaction" }).click();
  await expect(page.locator(".home-transaction-dialog .auth-error")).toContainText("Check the amount");
  await expect(page.locator(".home-transaction-dialog")).toBeVisible();
  await quickAddForm.locator('input[name="amount"]').fill("23.45");
  await quickAddForm.locator('input[name="description"]').fill("E2E grocery transaction");
  await quickAddForm.locator('select[name="categoryId"]').selectOption({ label: "E2E Edited Category" });
  await quickAddForm.locator('input[name="occurredOn"]').fill(today);
  await quickAddForm.getByRole("button", { name: "Add transaction" }).click();
  await expect(page.locator(".home-transaction-dialog")).not.toBeVisible();
  await expect(quickAddButton).toBeFocused();
  await expect(page.locator(".today-transactions-section")).toContainText("E2E grocery transaction");
  await page.goto("/transactions");
  const transactionForm = page.locator(".transaction-form").first();
  const transactionRow = page.locator(".transaction-item").filter({
    has: page.locator(".transaction-summary .transaction-description strong", {
      hasText: "E2E grocery transaction",
    }),
  }).first();
  await transactionRow.locator(".transaction-details > summary").click();
  await transactionRow.locator('.transaction-form input[name="description"]').fill("E2E grocery transaction edited");
  await transactionRow.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Transaction updated." })).toBeVisible();
  await expect(transactionRow.locator(".transaction-summary .transaction-description strong"))
    .toHaveText("E2E grocery transaction edited");

  const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  await transactionForm.locator('input[name="amount"]').fill("8.00");
  await transactionForm.locator('input[name="description"]').fill("E2E yesterday transaction");
  await transactionForm.locator('input[name="occurredOn"]').fill(yesterdayDate.toISOString().slice(0, 10));
  await transactionForm.getByRole("button", { name: "Add transaction" }).click();
  await expect(transactionForm.getByRole("status")).toContainText("Transaction added.");

  await transactionForm.locator('select[name="type"]').selectOption("income");
  await transactionForm.locator('input[name="amount"]').fill("10.00");
  await transactionForm.locator('input[name="currencyCode"]').fill("USD");
  await transactionForm.locator('input[name="description"]').fill("E2E USD income");
  await transactionForm.locator('input[name="occurredOn"]').fill(today);
  await transactionForm.getByRole("button", { name: "Add transaction" }).click();
  await expect(transactionForm.getByRole("status")).toContainText("Transaction added.");

  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  const dailySectionsFit = await page.locator(".today-home, .today-transactions-section").evaluateAll((sections) =>
    sections.every((section) => {
      const bounds = section.getBoundingClientRect();
      return section.scrollWidth <= section.clientWidth && bounds.left >= 0 && bounds.right <= window.innerWidth;
    }),
  );
  expect(dailySectionsFit).toBe(true);
  await expect(page.getByRole("heading", { name: "Today's expenses" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today's transactions" })).toBeVisible();
  await expect(page.locator(".today-expense-total strong")).toHaveCount(1);
  await expect(page.locator(".today-expense-total strong")).toContainText("23.45");
  await expect(page.locator(".today-transactions-section .recent-description strong"))
    .toContainText(["E2E USD income", "E2E grocery transaction edited"]);
  await expect(page.locator(".today-transactions-section .recent-description strong")
    .filter({ hasText: "E2E yesterday transaction" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Recent transactions" })).toHaveCount(0);

  const [todayYear, todayMonth] = today.split("-").map(Number);
  const previousMonthDate = new Date(Date.UTC(todayYear, todayMonth - 2, 1));
  const previousMonth = `${previousMonthDate.getUTCFullYear()}-${String(previousMonthDate.getUTCMonth() + 1).padStart(2, "0")}`;
  await page.goto(`/?month=${previousMonth}`);
  await expect(page.locator(".today-expense-totals")).toContainText("23.45");
  await expect(page.locator(".today-transactions-section .recent-description strong"))
    .toHaveText(["E2E USD income", "E2E grocery transaction edited"]);

  await page.goto("/");
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  await expect(page.getByRole("heading", { name: "Today's expenses" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add transaction" })).toBeVisible();
  await expect(page.locator(".summary-grid")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Financial Analysis" }).first()).toHaveAttribute("href", "/reports");
  const desktopQuickAddButton = page.getByRole("button", { name: "Add transaction" });
  await desktopQuickAddButton.click();
  const desktopDialog = page.locator(".home-transaction-dialog");
  await expect(desktopDialog).toBeVisible();
  const desktopDialogFits = await desktopDialog.evaluate((dialog) => {
    const bounds = dialog.getBoundingClientRect();
    return bounds.left >= 0 && bounds.top >= 0 && bounds.right <= window.innerWidth && bounds.bottom <= window.innerHeight;
  });
  expect(desktopDialogFits).toBe(true);
  await page.keyboard.press("Escape");
  await expect(desktopDialog).not.toBeVisible();
  await expect(desktopQuickAddButton).toBeFocused();
  await page.setViewportSize({ width: 360, height: 844 });

  await page.goto(`/reports?startDate=${today}&endDate=${today}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await expect(page.getByRole("heading", { name: "Financial Analysis", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Monthly comparison by currency" })).toBeVisible();
  await expect(page.locator(".report-table")).toContainText("EUR");
  await expect(page.locator(".report-table")).toContainText("USD");
  const reportCsv = await page.evaluate(async () => {
    const response = await fetch(`/transactions/export${location.search}`, { credentials: "same-origin" });
    return { status: response.status, content: await response.text() };
  });
  expect(reportCsv.status).toBe(200);
  expect(reportCsv.content).toContain('"EUR"');
  expect(reportCsv.content).toContain('"USD"');
  expect(reportCsv.content).toContain('"E2E grocery transaction edited"');

  const invalidEndDate = yesterdayDate.toISOString().slice(0, 10);
  await page.goto(`/reports?startDate=${today}&endDate=${invalidEndDate}`);
  await expect(page.getByRole("heading", { name: "Financial Analysis", level: 1 })).toBeVisible();
  await expect(page.locator(".config-notice[role=alert]")).toContainText("Select a valid date range");

  await page.goto("/reports?startDate=2099-01-01&endDate=2099-01-02");
  await expect(page.getByRole("heading", { name: "No transactions in this range" })).toBeVisible();

  await page.goto("/settings");
  await expect(page.locator("#settings-currency")).toHaveCount(1);
  await page.locator("#settings-currency").fill("GBP");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved.");

  await page.goto("/transactions");
  page.setViewportSize({ width: 390, height: 844 });
  const mobileWidth = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(mobileWidth.document).toBeLessThanOrEqual(mobileWidth.viewport);
  await transactionRow.locator(".transaction-details > summary").click();
  await expect(transactionRow.locator('.transaction-form input[name="currencyCode"]')).toHaveValue("EUR");
  await expect(page.locator(".transaction-form").first().locator('input[name="currencyCode"]')).toHaveValue("GBP");

  await page.locator('input[name="search"]').fill("E2E grocery transaction edited");
  await page.locator('.transaction-filters select[name="type"]').selectOption("expense");
  await page.locator('.transaction-filters select[name="category"]').selectOption({ label: "E2E Edited Category" });
  await page.locator('input[name="startDate"]').fill(today);
  await page.locator('input[name="endDate"]').fill(today);
  await page.getByRole("button", { name: "Apply filters" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.locator(".transaction-item")).toHaveCount(1);
  await expect(page.locator(".transaction-summary .transaction-description strong")).toHaveText("E2E grocery transaction edited");

  const csv = await page.evaluate(async () => {
    const response = await fetch(`/transactions/export${location.search}`, { credentials: "same-origin" });
    return { status: response.status, content: await response.text() };
  });
  expect(csv.status).toBe(200);
  expect(csv.content).toContain('"EUR"');
  expect(csv.content).toContain('"E2E grocery transaction edited"');
  expect(csv.content).not.toContain('"GBP"');

  page.on("dialog", (dialog) => dialog.accept());
  await transactionRow.locator(".transaction-details > summary").click();
  await transactionRow.getByRole("button", { name: "Delete transaction" }).click();
  await expect(transactionRow).toHaveCount(0);

  await page.goto("/transactions?search=E2E%20yesterday%20transaction");
  const yesterdayTransactionRow = page.locator(".transaction-item").filter({
    has: page.locator(".transaction-summary .transaction-description strong", { hasText: "E2E yesterday transaction" }),
  });
  await expect(yesterdayTransactionRow).toBeVisible();
  await yesterdayTransactionRow.locator(".transaction-details > summary").click();
  await yesterdayTransactionRow.getByRole("button", { name: "Delete transaction" }).click();
  await expect(yesterdayTransactionRow).toHaveCount(0);

  await page.goto("/categories");
  const editedCategory = page.locator(".category-item").filter({ hasText: "E2E Edited Category" });
  await editedCategory.getByRole("button", { name: "Delete E2E Edited Category" }).click();
  await expect(editedCategory).toHaveCount(0);
});