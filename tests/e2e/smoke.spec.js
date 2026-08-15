import { test, expect } from "@playwright/test";

test("login page exposes language selection and responsive form", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#login-language")).toBeVisible();
  await page.locator("#login-language").selectOption("en");
  await expect(page.locator("text=Username")).toBeVisible();
  await page.setViewportSize({ width: 320, height: 720 });
  await expect(page.locator("input[type=password]")).toBeVisible();
});
