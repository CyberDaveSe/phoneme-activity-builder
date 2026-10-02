import { test, expect } from "@playwright/test";

test("application homepage loads", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Phoneme/i);

  await expect(
    page.getByRole("heading", {
      name: /Phoneme Activity Builder/i,
    })
  ).toBeVisible();
});