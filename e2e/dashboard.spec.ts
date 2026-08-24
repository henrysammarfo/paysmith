import { test, expect } from "./playwright-fixture";

test.describe("Landing waitlist (T2)", () => {
  test("waitlist section renders and accepts email input", async ({ page }) => {
    await page.goto("/#waitlist");
    await expect(page.getByRole("heading", { name: /Give your AI agent a wallet/i })).toBeVisible();
    const email = page.getByPlaceholder("you@company.com");
    await expect(email).toBeVisible();
    await email.fill("e2e-test@paysmith.dev");
    await expect(page.getByRole("button", { name: /Join waitlist/i })).toBeEnabled();
  });

  test("docs link from waitlist CTA", async ({ page }) => {
    await page.goto("/#waitlist");
    await page.getByRole("link", { name: /Read the Docs/i }).click();
    await expect(page).toHaveURL(/\/docs/);
    await expect(page.getByText(/agents-create/i).first()).toBeVisible();
  });
});

test.describe("Dashboard shell", () => {
  test("transactions page loads for authenticated route shell", async ({ page }) => {
    await page.goto("/dashboard/transactions");
    await expect(page.locator("body")).toBeVisible();
  });
});
