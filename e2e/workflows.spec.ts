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
  await expect(page.getByRole("heading", { name: "Today's expenses", level: 1 })).toBeVisible();
  await expect(page.getByText("No expenses recorded today.")).toBeVisible();
  await expect(page.getByText("No transactions recorded today.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add expense" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add income" })).toBeVisible();
  for (const actionName of ["Add expense", "Add income"]) {
    const actionButton = page.getByRole("button", { name: actionName });
    await expect(actionButton.locator("svg")).toHaveCount(0);
    expect(await actionButton.evaluate((button) => getComputedStyle(button).whiteSpace)).toBe("nowrap");
  }
  return account;
}

async function addHomeTransaction(
  page: import("@playwright/test").Page,
  type: "expense" | "income",
  amount: string,
  description: string,
  occurredOn: string,
) {
  const actionName = type === "expense" ? "Add expense" : "Add income";
  await page.getByRole("button", { name: actionName }).click();
  const dialog = page.locator(".home-transaction-dialog");
  const form = dialog.locator(".transaction-form");
  await expect(form.locator('input[name="type"]')).toHaveValue(type);
  await form.locator('input[name="amount"]').fill(amount);
  await form.locator('input[name="description"]').fill(description);
  await form.locator('input[name="occurredOn"]').fill(occurredOn);
  await form.getByRole("button", { name: "Add transaction" }).click();
  await expect(dialog).not.toBeVisible();
}

test("authentication screens fit mobile and desktop viewports", async ({ page }) => {
  const routes = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password"];

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [360, 390]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator(".auth-card")).toBeVisible();
        await expect(page.locator(".auth-card-header")).toBeVisible();
        await expect(page.locator(".auth-card-header + .auth-form")).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
        if (colorScheme === "dark") {
          await expect(page.locator("html")).toHaveClass(/dark/);
        } else {
          await expect(page.locator("html")).not.toHaveClass(/dark/);
        }

        const mobileMetrics = await page.locator(".auth-card").evaluate((card) => {
          const inputs = [...card.querySelectorAll("input")];
          const targets = [...card.querySelectorAll<HTMLElement>("a, button, input")];
          return {
            inputFontSizes: inputs.map((input) => Number.parseFloat(getComputedStyle(input).fontSize)),
            targetSizes: targets.map((target) => {
              const bounds = target.getBoundingClientRect();
              return { width: bounds.width, height: bounds.height };
            }),
          };
        });

        expect(mobileMetrics.inputFontSizes.length).toBeGreaterThan(0);
        expect(mobileMetrics.inputFontSizes.every((size) => size >= 16)).toBe(true);
        expect(mobileMetrics.targetSizes.every(({ width: targetWidth, height }) => (
          targetWidth >= 44 && height >= 44
        ))).toBe(true);
      }
    }

    await page.setViewportSize({ width: 640, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      const desktopMetrics = await page.locator(".auth-card").evaluate((card) => ({
        width: card.getBoundingClientRect().width,
        inputFontSize: Number.parseFloat(getComputedStyle(card.querySelector("input")!).fontSize),
      }));
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(640);
      expect(desktopMetrics.width).toBeLessThanOrEqual(420);
      expect(desktopMetrics.inputFontSize).toBe(13);
    }
  }
});

test("finance pages keep their layout across viewports and system themes", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await signUp(page);

  const routes = [
    { path: "/", heading: "Today's expenses", label: "Overview" },
    { path: "/transactions", heading: "Transactions", label: "Transactions" },
    { path: "/reports", heading: "Financial Analysis", label: "Financial Analysis" },
    { path: "/categories", heading: "Categories", label: "Categories" },
    { path: "/settings", heading: "Settings", label: "Settings" },
  ];
  const themeTokens = {
    light: { background: "rgb(255, 255, 255)", foreground: "rgb(23, 26, 24)", accent: "rgb(15, 118, 110)" },
    dark: { background: "rgb(0, 0, 0)", foreground: "rgb(245, 245, 245)", accent: "rgb(94, 234, 212)" },
  };

  for (const colorScheme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme });
    for (const width of [360, 1280]) {
      await page.setViewportSize({ width, height: 844 });
      for (const route of routes) {
        await page.goto(route.path);
        await expect(page.getByRole("heading", { name: route.heading, level: 1 })).toBeVisible();
        await expect(page.locator(".topbar-label")).toHaveText(route.label);
        if (colorScheme === "dark") {
          await expect(page.locator("html")).toHaveClass(/dark/);
        } else {
          await expect(page.locator("html")).not.toHaveClass(/dark/);
        }

        const pageMetrics = await page.evaluate(() => {
          const styles = getComputedStyle(document.documentElement);
          const resolveColor = (value: string) => {
            const probe = document.createElement("span");
            probe.style.color = value;
            document.body.append(probe);
            const color = getComputedStyle(probe).color;
            probe.remove();
            return color;
          };
          return {
            documentWidth: document.documentElement.scrollWidth,
            background: resolveColor(styles.getPropertyValue("--background")),
            foreground: resolveColor(styles.getPropertyValue("--foreground")),
            accent: resolveColor(styles.getPropertyValue("--accent")),
          };
        });
        expect(pageMetrics.documentWidth).toBeLessThanOrEqual(width);
        expect(pageMetrics).toMatchObject(themeTokens[colorScheme]);

        if (width < 640) {
          const nav = page.locator(".mobile-nav");
          await expect(nav).toBeVisible();
          const navTargetsFit = await nav.locator("a").evaluateAll((links) => links.every((link) => {
            const bounds = link.getBoundingClientRect();
            return bounds.width >= 44 && bounds.height >= 44;
          }));
          expect(navTargetsFit).toBe(true);
          const bottomClearance = await page.evaluate(() => {
            window.scrollTo(0, document.documentElement.scrollHeight);
            const navBounds = document.querySelector<HTMLElement>(".mobile-nav")!.getBoundingClientRect();
            const contentBounds = document.querySelector<HTMLElement>(".page-content")!.lastElementChild!.getBoundingClientRect();
            return contentBounds.bottom <= navBounds.top;
          });
          expect(bottomClearance).toBe(true);
        } else {
          await expect(page.locator(".sidebar")).toBeVisible();
          await expect(page.locator(".mobile-nav")).toBeHidden();
        }
      }
    }
  }
});

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
  await expect(page.getByRole("heading", { name: "Today's expenses", level: 1 })).toBeVisible();
  await expect(page.locator(".topbar-label")).toHaveText("Overview");
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
  await expect(page.getByRole("heading", { name: "Today's expenses", level: 1 })).toBeVisible();
});

test("mobile finance workflows, transaction edit, filters, reports, export, and deletion", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await signUp(page);
  const categoryName = `E2E Category ${crypto.randomUUID()}`;
  const editedCategoryName = `${categoryName} Edited`;
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  const mobilePrimaryNav = page.getByRole("navigation", { name: "Primary navigation" });
  await expect(mobilePrimaryNav.getByRole("link")).toHaveCount(5);
  const mobileNavFits = await mobilePrimaryNav.evaluate((nav) => {
    const links = [...nav.querySelectorAll("a")];
    return nav.scrollWidth <= nav.clientWidth && links.every((link) => {
      const bounds = link.getBoundingClientRect();
      const label = link.querySelector("span");
      return bounds.width >= 44 && bounds.height >= 44 && label !== null && getComputedStyle(label).display === "none";
    });
  });
  expect(mobileNavFits).toBe(true);
  const activeMobileLink = mobilePrimaryNav.locator('a[aria-current="page"]');
  await expect(activeMobileLink).toHaveCSS("box-shadow", "none");
  const activeMobileColor = await activeMobileLink.evaluate((link) => getComputedStyle(link).color);
  const inactiveMobileColor = await mobilePrimaryNav.locator('a:not([aria-current="page"])').first().evaluate(
    (link) => getComputedStyle(link).color,
  );
  expect(activeMobileColor).not.toBe(inactiveMobileColor);
  expect(await page.locator('meta[name="viewport"]').getAttribute("content")).toContain("viewport-fit=cover");
  const mobileNavGeometry = await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    const nav = document.querySelector<HTMLElement>(".mobile-nav")!;
    const finalContent = document.querySelector<HTMLElement>(".page-content")!.lastElementChild as HTMLElement;
    const navBounds = nav.getBoundingClientRect();
    return {
      position: getComputedStyle(nav).position,
      bottomGap: window.innerHeight - navBounds.bottom,
      navTop: navBounds.top,
      finalContentBottom: finalContent.getBoundingClientRect().bottom,
    };
  });
  expect(mobileNavGeometry.position).toBe("fixed");
  expect(mobileNavGeometry.bottomGap).toBe(0);
  expect(mobileNavGeometry.finalContentBottom).toBeLessThanOrEqual(mobileNavGeometry.navTop);

  await page.goto("/settings");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole("region", { name: "Profile", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Appearance" })).toBeVisible();
  await page.locator("#settings-name").fill("E2E Updated Name");
  await page.locator("#settings-currency").fill("EUR");
  await page.locator("#settings-theme").selectOption("dark");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved.");

  await page.goto("/categories");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole("region", { name: "Category management" })).toBeVisible();
  const categoryForm = page.locator(".category-form").first();
  await categoryForm.locator('input[name="name"]').fill(categoryName);
  await categoryForm.locator('select[name="type"]').selectOption("expense");
  await categoryForm.locator('select[name="icon"]').selectOption("utensils");
  await expect(categoryForm.locator('select[name="icon"]')).toHaveValue("utensils");
  await categoryForm.locator('input[name="color"]').fill("#336699");
  await page.getByRole("button", { name: "Add category" }).click();
  await expect(page.getByRole("status")).toContainText("Category saved.");
  const categoryRow = page.locator(".category-item").filter({ hasText: categoryName });
  await expect(categoryRow).toBeVisible();
  await expect(categoryRow.locator(".category-icon")).toHaveAttribute("data-icon", "utensils");
  await categoryRow.locator(".category-edit summary").click();
  await categoryRow.locator('.category-edit input[name="name"]').fill(editedCategoryName);
  await categoryRow.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText(editedCategoryName, { exact: true })).toBeVisible();

  await page.goto("/");
  const quickAddButton = page.getByRole("button", { name: "Add expense" });
  const incomeAddButton = page.getByRole("button", { name: "Add income" });
  await page.setViewportSize({ width: 360, height: 520 });
  await quickAddButton.focus();
  await page.keyboard.press("Enter");
  const mobileDialog = page.locator(".home-transaction-dialog");
  await expect(mobileDialog).toBeVisible();
  expect(await mobileDialog.evaluate((dialog) => dialog.contains(document.activeElement))).toBe(true);
  const mobileDialogHasMargins = await mobileDialog.evaluate((dialog) => {
    const bounds = dialog.getBoundingClientRect();
    return bounds.left > 0 && bounds.top > 0 && bounds.right < window.innerWidth && bounds.bottom < window.innerHeight;
  });
  expect(mobileDialogHasMargins).toBe(true);
  const dialogContent = mobileDialog.locator(".home-transaction-dialog-content");
  expect(await dialogContent.evaluate((content) => content.scrollHeight > content.clientHeight)).toBe(true);
  await dialogContent.evaluate((content) => { content.scrollTop = content.scrollHeight; });
  await expect(page.getByRole("heading", { name: "Add a transaction" })).toBeInViewport();
  const closeDialogButton = page.getByRole("button", { name: "Close transaction dialog" });
  await expect(closeDialogButton).toBeInViewport();
  expect(await closeDialogButton.evaluate((button) => {
    const bounds = button.getBoundingClientRect();
    return bounds.width >= 44 && bounds.height >= 44;
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await page.keyboard.press("Escape");
  await expect(mobileDialog).not.toBeVisible();
  await expect(quickAddButton).toBeFocused();
  await page.setViewportSize({ width: 360, height: 844 });
  await incomeAddButton.click();
  await expect(mobileDialog.locator('input[name="type"]')).toHaveValue("income");
  await expect(mobileDialog.locator('input[name="currencyCode"]')).toHaveValue("EUR");
  await expect(mobileDialog.locator('select[name="type"]')).toHaveCount(0);
  await expect(mobileDialog.getByText("Currency", { exact: true })).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(incomeAddButton).toBeFocused();
  await quickAddButton.click();
  await expect(page.locator(".home-transaction-dialog")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Add a transaction" })).toBeVisible();
  const quickAddForm = page.locator(".home-transaction-dialog .transaction-form");
  await expect(quickAddForm.locator('input[name="type"]')).toHaveValue("expense");
  await expect(quickAddForm.locator('input[name="currencyCode"]')).toHaveValue("EUR");
  await expect(quickAddForm.locator('select[name="type"]')).toHaveCount(0);
  await expect(quickAddForm.getByText("Currency", { exact: true })).toHaveCount(0);
  const dialogRowsAreSingleColumn = await quickAddForm.locator(".transaction-form-row").evaluateAll((rows) =>
    rows.every((row) => getComputedStyle(row).gridTemplateColumns.split(" ").length === 1),
  );
  expect(dialogRowsAreSingleColumn).toBe(true);
  expect(await page.getByRole("button", { name: "Add expense" }).evaluate((button) =>
    getComputedStyle(button).borderRadius,
  )).toBe("999px");
  const today = await quickAddForm.locator('input[name="occurredOn"]').inputValue();
  await quickAddForm.evaluate((form) => { (form as HTMLFormElement).noValidate = true; });
  await quickAddForm.locator('input[name="amount"]').fill("1.234");
  await quickAddForm.locator('input[name="description"]').fill("E2E invalid amount");
  await quickAddForm.getByRole("button", { name: "Add transaction" }).click();
  await expect(page.locator(".home-transaction-dialog .auth-error")).toContainText("Check the amount");
  await expect(page.locator(".home-transaction-dialog")).toBeVisible();
  await quickAddForm.locator('input[name="amount"]').fill("23.45");
  await quickAddForm.locator('input[name="description"]').fill("E2E grocery transaction");
  await quickAddForm.locator('select[name="categoryId"]').selectOption({ label: editedCategoryName });
  await quickAddForm.locator('input[name="occurredOn"]').fill(today);
  await quickAddForm.getByRole("button", { name: "Add transaction" }).click();
  await expect(page.locator(".home-transaction-dialog")).not.toBeVisible();
  await expect(quickAddButton).toBeFocused();
  await expect(page.locator(".today-transactions-section")).toContainText("E2E grocery transaction");
  await page.goto("/transactions");
  const transactionRow = page.locator(".transaction-item").filter({
    has: page.locator(".transaction-summary .transaction-description strong", {
      hasText: "E2E grocery transaction",
    }),
  }).first();
  await transactionRow.locator(":scope > .transaction-summary").click();
  await transactionRow.locator('.transaction-form input[name="description"]').fill("E2E grocery transaction edited");
  await transactionRow.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Transaction updated." })).toBeVisible();
  await expect(transactionRow.locator(".transaction-summary .transaction-description strong"))
    .toHaveText("E2E grocery transaction edited");

  await page.goto("/settings");
  await page.locator("#settings-currency").fill("USD");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved.");

  const yesterdayDate = new Date(`${today}T00:00:00.000Z`);
  yesterdayDate.setUTCDate(yesterdayDate.getUTCDate() - 1);
  const yesterdayDescription = `E2E yesterday transaction ${crypto.randomUUID()}`;
  await page.goto("/");
  await addHomeTransaction(page, "expense", "8.00", yesterdayDescription, yesterdayDate.toISOString().slice(0, 10));
  await addHomeTransaction(page, "income", "10.00", "E2E USD income", today);
  await page.goto("/transactions");
  await expect(page.locator("main .transaction-item:visible").filter({ hasText: "E2E USD income" })).toBeVisible();
  await expect(page.locator(".transaction-date-heading")).toContainText(["Today", "Yesterday"]);

  const largeExpenseDescription = "E2E large USD expense with a long description that must wrap on a phone";
  await page.goto("/");
  await addHomeTransaction(page, "expense", "999999999999.99", largeExpenseDescription, today);
  await page.goto("/transactions");
  const savedLargeExpense = page.locator(".transaction-list .transaction-item").filter({
    has: page.locator(".transaction-summary .transaction-description strong", { hasText: largeExpenseDescription }),
  }).first();
  await expect(savedLargeExpense).toBeVisible();

  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  const dailySectionsFit = await page.locator(".today-home, .today-transactions-section").evaluateAll((sections) =>
    sections.every((section) => {
      const bounds = section.getBoundingClientRect();
      return section.scrollWidth <= section.clientWidth && bounds.left >= 0 && bounds.right <= window.innerWidth;
    }),
  );
  expect(dailySectionsFit).toBe(true);
  await expect(page.getByText("PERSONAL FINANCE", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Your financial activity, gathered in one place.", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Today's expenses" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Today's transactions" })).toBeVisible();
  await expect(page.locator(".today-expense-totals .finance-summary-card-amount")).toHaveCount(2);
  await expect(page.locator(".today-expense-totals .finance-summary-card-amount").filter({ hasText: "23.45" })).toHaveCount(1);
  await expect(page.locator(".today-expense-totals .finance-summary-card-amount").filter({ hasText: "999,999,999,999.99" })).toHaveCount(1);
  const totalLayoutIsReadable = await page.locator(".today-expense-totals .finance-summary-card").evaluateAll((cards) => cards.every((card) => {
    const amount = card.querySelector(".finance-summary-card-amount");
    return getComputedStyle(card).textAlign === "center"
      && amount !== null
      && getComputedStyle(amount).whiteSpace === "nowrap"
      && amount.scrollWidth <= amount.clientWidth
      && card.scrollWidth <= card.clientWidth;
  }));
  expect(totalLayoutIsReadable).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await expect(page.locator(".today-transactions-section .recent-description strong"))
    .toContainText([largeExpenseDescription, "E2E USD income", "E2E grocery transaction edited"]);
  await expect(page.locator(".today-transactions-section .recent-description strong")
    .filter({ hasText: "E2E yesterday transaction" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Recent transactions" })).toHaveCount(0);

  const [todayYear, todayMonth] = today.split("-").map(Number);
  const previousMonthDate = new Date(Date.UTC(todayYear, todayMonth - 2, 1));
  const previousMonth = `${previousMonthDate.getUTCFullYear()}-${String(previousMonthDate.getUTCMonth() + 1).padStart(2, "0")}`;
  await page.goto(`/?month=${previousMonth}`);
  await expect(page.locator(".today-expense-totals")).toContainText("23.45");
  await expect(page.locator(".today-transactions-section .recent-description strong"))
    .toHaveText([largeExpenseDescription, "E2E USD income", "E2E grocery transaction edited"]);

  await page.goto("/");
  await page.setViewportSize({ width: 1280, height: 900 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1280);
  await expect(page.locator(".sidebar")).toBeVisible();
  await expect(page.locator(".sidebar").getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await expect(page.locator(".mobile-nav")).toBeHidden();
  await expect(page.getByRole("heading", { name: "Today's expenses", level: 1 })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add expense" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add income" })).toBeVisible();
  await expect(page.locator(".summary-grid")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Financial Analysis" }).first()).toHaveAttribute("href", "/reports");
  const desktopQuickAddButton = page.getByRole("button", { name: "Add expense" });
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
  const desktopIncomeButton = page.getByRole("button", { name: "Add income" });
  await desktopIncomeButton.click();
  await expect(desktopDialog.locator('input[name="type"]')).toHaveValue("income");
  await page.keyboard.press("Escape");
  await expect(desktopIncomeButton).toBeFocused();
  await page.setViewportSize({ width: 360, height: 844 });

  await page.goto(`/reports?startDate=${today}&endDate=${today}`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await expect(page.locator(".topbar-label")).toHaveText("Financial Analysis");
  await expect(page.getByRole("heading", { name: "Financial Analysis", level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Monthly comparison by currency" })).toBeVisible();
  await expect(page.locator("main .report-controls:visible .report-range-form")).toBeVisible();
  await expect(page.locator("main .report-controls:visible .report-export")).toBeVisible();
  await expect(page.locator(".report-table")).toContainText("EUR");
  await expect(page.locator(".report-table")).toContainText("USD");
  const reportCardsRetainLabels = await page.locator(".report-table tbody tr").evaluateAll((rows) => (
    rows.length > 0 && rows.every((row) => {
      const cells = [...row.querySelectorAll<HTMLElement>("th, td")];
      return getComputedStyle(row).display === "grid" && cells.every((cell) => {
        const bounds = cell.getBoundingClientRect();
        const labelContent = getComputedStyle(cell, "::before").content;
        return cell.dataset.label !== undefined
          && labelContent !== "none"
          && labelContent !== "normal"
          && getComputedStyle(cell).whiteSpace === "nowrap"
          && bounds.left >= 0
          && bounds.right <= window.innerWidth;
      });
    })
  ));
  expect(reportCardsRetainLabels).toBe(true);
  const reportControlsFitPhone = await page.locator(".report-controls").evaluate((region) => {
    const controls = [...region.querySelectorAll<HTMLElement>("input, button, a")];
    return region.scrollWidth <= region.clientWidth && controls.every((control) => {
      const bounds = control.getBoundingClientRect();
      return bounds.height >= 44
        && (control.tagName !== "INPUT" || Number.parseFloat(getComputedStyle(control).fontSize) >= 16);
    });
  });
  expect(reportControlsFitPhone).toBe(true);
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
  const visibleSettingsCurrency = page.locator(".settings-form:visible #settings-currency");
  await expect(visibleSettingsCurrency).toHaveCount(1);
  await visibleSettingsCurrency.fill("GBP");
  await page.locator("#settings-theme").selectOption("light");
  await page.getByRole("button", { name: "Save settings" }).click();
  await expect(page.getByRole("status")).toContainText("Settings saved.");

  await page.goto("/transactions");
  await page.setViewportSize({ width: 360, height: 844 });
  const summaryCards = page.locator(".transaction-summary-section .finance-summary-card");
  await expect(page.getByRole("region", { name: "Transaction summary" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Transaction summary" })).toHaveCount(0);
  await expect(summaryCards).toHaveCount(2);
  expect(await summaryCards.first().getAttribute("class")).toBe("finance-summary-card");
  await expect(page.locator(".transaction-summary-heading")).toContainText("Summary");
  const summaryCardIsProminent = await summaryCards.first().evaluate((card) => {
    const netAmount = card.querySelector(".finance-summary-card-amount");
    const dateHeading = card.querySelector(".finance-summary-card-heading");
    return getComputedStyle(card).textAlign === "center"
      && netAmount !== null
      && dateHeading !== null
      && getComputedStyle(dateHeading).justifyContent === "center"
      && getComputedStyle(netAmount).whiteSpace === "nowrap"
      && Number.parseFloat(getComputedStyle(netAmount).fontSize) >= 23;
  });
  expect(summaryCardIsProminent).toBe(true);
  const dateHeadingsAreCentered = await page.locator(".transaction-date-heading").evaluateAll((headings) => (
    headings.length > 0 && headings.every((heading) => getComputedStyle(heading).textAlign === "center")
  ));
  expect(dateHeadingsAreCentered).toBe(true);
  await expect(page.getByRole("button", { name: "Add expense" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add income" })).toBeVisible();
  const actionFilterGap = await page.locator(".quick-add-actions").evaluate((actions) => {
    const filter = document.querySelector(".transaction-filters-disclosure");
    return filter ? filter.getBoundingClientRect().top - actions.getBoundingClientRect().bottom : -1;
  });
  expect(actionFilterGap).toBeGreaterThanOrEqual(16);
  const pageSectionOrder = await page.locator(".transaction-summary-section, .quick-add-actions, .transaction-filters-disclosure, .transaction-history").evaluateAll((sections) =>
    sections.map((section) => section.classList.contains("transaction-summary-section") ? "summary"
      : section.classList.contains("quick-add-actions") ? "actions"
        : section.classList.contains("transaction-filters-disclosure") ? "filters" : "history"),
  );
  expect(pageSectionOrder).toEqual(["summary", "actions", "filters", "history"]);
  const transactionsExpenseButton = page.getByRole("button", { name: "Add expense" });
  const transactionsIncomeButton = page.getByRole("button", { name: "Add income" });
  const transactionsDialog = page.locator(".home-transaction-dialog");
  await transactionsExpenseButton.click();
  await expect(transactionsDialog.locator('input[name="type"]')).toHaveValue("expense");
  await expect(transactionsDialog.locator('input[name="currencyCode"]')).toHaveValue("GBP");
  await page.keyboard.press("Escape");
  await expect(transactionsExpenseButton).toBeFocused();
  await transactionsIncomeButton.click();
  await expect(transactionsDialog.locator('input[name="type"]')).toHaveValue("income");
  await page.keyboard.press("Escape");
  await expect(transactionsIncomeButton).toBeFocused();
  const filtersDisclosure = page.locator(".transaction-filters-disclosure");
  await expect(filtersDisclosure).not.toHaveAttribute("open", "");
  await filtersDisclosure.locator("summary").click();
  await expect(page.locator(".transaction-filters")).toBeVisible();
  const mobileWidth = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
  expect(mobileWidth.document).toBeLessThanOrEqual(mobileWidth.viewport);
  const largestMobileTransaction = page.locator(".transaction-list .transaction-item").filter({
    has: page.locator(".transaction-summary .transaction-description strong", { hasText: largeExpenseDescription }),
  }).first();
  await expect(largestMobileTransaction.locator(".transaction-category-icon")).toHaveAttribute("data-icon", "tag");
  const categorizedMobileTransaction = page.locator(".transaction-list .transaction-item")
    .filter({
      has: page.locator(".transaction-description strong", { hasText: "E2E grocery transaction edited" }),
    }).first();
  await expect(categorizedMobileTransaction.locator(".transaction-description span")).toContainText(editedCategoryName);
  await expect(categorizedMobileTransaction.locator(".transaction-category-icon")).toHaveAttribute("data-icon", "utensils");
  const largeCardFits = await largestMobileTransaction.evaluate((card) => {
    const description = card.querySelector(".transaction-description strong");
    const metadata = card.querySelector(".transaction-description span");
    const amount = card.querySelector(".transaction-summary .transaction-amount");
    const descriptionBounds = description?.getBoundingClientRect();
    const amountBounds = amount?.getBoundingClientRect();
    const listBounds = card.parentElement?.getBoundingClientRect();
    const cardBounds = card.getBoundingClientRect();
    return description !== null
      && metadata?.textContent?.startsWith("Expense ·")
      && amount !== null
      && descriptionBounds !== undefined
      && amountBounds !== undefined
      && listBounds !== undefined
      && amountBounds.left >= descriptionBounds.right
      && cardBounds.left >= listBounds.left + 8
      && cardBounds.right <= listBounds.right - 8
      && card.scrollWidth <= card.clientWidth
      && getComputedStyle(description).whiteSpace === "normal"
      && getComputedStyle(amount).whiteSpace === "nowrap"
      && amount.scrollWidth <= amount.clientWidth;
  });
  expect(largeCardFits).toBe(true);
  const filtersFitAndAreTouchFriendly = await page.locator(".transaction-filters").evaluate((filters) => {
    const controls = [...filters.querySelectorAll("input, select, button, a")];
    return filters.scrollWidth <= filters.clientWidth && controls.every((control) => {
      const bounds = control.getBoundingClientRect();
      return bounds.height >= 44 && bounds.left >= 0 && bounds.right <= window.innerWidth;
    });
  });
  expect(filtersFitAndAreTouchFriendly).toBe(true);
  const transactionDetailsToggle = transactionRow.locator(":scope > .transaction-summary");
  expect(await transactionDetailsToggle.evaluate((toggle) => toggle.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
  await transactionDetailsToggle.click();
  const phoneFormsAreReadable = await page.locator(".transaction-manager .transaction-form").evaluateAll((forms) =>
    forms.every((form) => {
      const controls = Array.from(form.querySelectorAll("input:not([type=hidden]), select, textarea"));
      const rows = Array.from(form.querySelectorAll(".transaction-form-row"));
      const submit = form.querySelector("button");
      return controls.every((control) => {
        const bounds = control.getBoundingClientRect();
        return Number.parseFloat(getComputedStyle(control).fontSize) >= 16
          && bounds.width >= 44
          && bounds.height >= 44;
      })
        && rows.every((row) => getComputedStyle(row).gridTemplateColumns.trim().split(/\s+/).length === 1)
        && submit !== null
        && submit.getBoundingClientRect().height >= 44;
    }),
  );
  expect(phoneFormsAreReadable).toBe(true);
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopRowsKeepTwoColumns = await page.locator(".transaction-manager .transaction-form-row").evaluateAll((rows) =>
    rows.every((row) => getComputedStyle(row).gridTemplateColumns.trim().split(/\s+/).length === 2),
  );
  expect(desktopRowsKeepTwoColumns).toBe(true);
  const desktopHistoryUsesFullWidth = await page.locator(".transaction-manager").evaluate((manager) =>
    getComputedStyle(manager).gridTemplateColumns.trim().split(/\s+/).length === 1,
  );
  expect(desktopHistoryUsesFullWidth).toBe(true);
  await page.setViewportSize({ width: 360, height: 844 });
  await expect(transactionRow.locator('.transaction-form input[name="currencyCode"]')).toHaveValue("EUR");

  await page.locator('input[name="search"]').fill("E2E grocery transaction edited");
  await page.locator('.transaction-filters select[name="type"]').selectOption("expense");
  await page.locator('.transaction-filters select[name="category"]').selectOption({ label: editedCategoryName });
  await page.locator('input[name="startDate"]').fill(today);
  await page.locator('input[name="endDate"]').fill(today);
  await page.getByRole("button", { name: "Apply filters" }).click();
  expect(await page.locator("html").evaluate((root) => root.scrollWidth)).toBeLessThanOrEqual(360);
  await expect(filtersDisclosure).toHaveAttribute("open", "");
  await expect(summaryCards).toHaveCount(1);
  await expect(summaryCards.first()).toContainText("EUR");
  await expect(summaryCards.first()).toContainText("23.45");
  await expect(summaryCards.first()).not.toContainText("USD");
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
  const paginationLinkMeetsPhoneTarget = await page.locator(".pagination").evaluate((pagination) => {
    const probe = document.createElement("a");
    probe.href = "/transactions?page=2";
    probe.textContent = "Next";
    pagination.append(probe);
    const bounds = probe.getBoundingClientRect();
    const fits = bounds.height >= 44 && bounds.left >= 0 && bounds.right <= window.innerWidth;
    probe.remove();
    return fits;
  });
  expect(paginationLinkMeetsPhoneTarget).toBe(true);

  page.on("dialog", (dialog) => dialog.accept());
  await transactionRow.locator(":scope > .transaction-summary").click();
  await transactionRow.getByRole("button", { name: "Delete transaction" }).click();
  await expect(transactionRow).toHaveCount(0);

  await page.goto(`/transactions?search=${encodeURIComponent(yesterdayDescription)}`);
  const visibleTransactionFilters = page.locator("main .transaction-filters-disclosure:visible");
  await expect(visibleTransactionFilters).toHaveCount(1);
  await expect(visibleTransactionFilters).toHaveAttribute("open", "");
  const yesterdayTransactionRow = page.locator("main .transaction-item:visible")
    .filter({ hasText: yesterdayDescription });
  await expect(yesterdayTransactionRow).toBeVisible();
  await yesterdayTransactionRow.locator(":scope > .transaction-summary").click();
  await yesterdayTransactionRow.getByRole("button", { name: "Delete transaction" }).click();
  await expect(yesterdayTransactionRow).toHaveCount(0);

  await page.goto("/categories");
  const editedCategory = page.locator(".category-item").filter({ hasText: editedCategoryName });
  await editedCategory.getByRole("button", { name: `Delete ${editedCategoryName}` }).click();
  await expect(editedCategory).toHaveCount(0);
});