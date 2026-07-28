import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test("renders login form with email, password, and submit button", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toHaveText("Sign In");
  });

  test("displays page title and heading", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveTitle("Arche CMS");
    await expect(page.locator("h1")).toHaveText("Sign In");
  });

  test("shows forgot password link", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const link = page.locator('a[href="/forgot-password"]');
    await expect(link).toBeVisible();
    await expect(link).toHaveText("Forgot your password?");
  });

  test("shows remember me checkbox", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#remember-me")).toBeVisible();
    await expect(page.locator('label[for="remember-me"]')).toHaveText("Remember me");
  });

  test("shows error on invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toBeVisible({ timeout: 10_000 });
  });
});
