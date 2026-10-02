import { test, expect } from "@playwright/test";

test("teacher can create, read, update and delete a stored word", async ({
  page,
}) => {
  const uniqueWord = `testword${Date.now()}`;
  const originalHint = "Playwright test hint";
  const updatedHint = "Updated Playwright test hint";

  await page.goto("/words");

  await expect(
    page.getByRole("heading", { name: "Word Manager" })
  ).toBeVisible();

  // CREATE
  await page.getByLabel("Word").fill(uniqueWord);
  await page.getByLabel("Hint").fill(originalHint);

  // Select three phonemes so the word is valid and derives EASY difficulty.
  const phonemeButtons = page.locator("button[aria-label*='phoneme']");

  await phonemeButtons.nth(0).click();
  await phonemeButtons.nth(1).click();
  await phonemeButtons.nth(2).click();

  await page.getByRole("button", { name: "Save Word" }).click();

  // READ
  const wordCard = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: uniqueWord }) });

  await expect(wordCard).toBeVisible();
  await expect(wordCard).toContainText(originalHint);
  await expect(wordCard).toContainText("EASY");

  // UPDATE
  await wordCard.getByRole("button", { name: "Edit" }).click();

  await expect(
    page.getByRole("heading", { name: "Edit Word" })
  ).toBeVisible();

  await page.getByLabel("Hint").fill(updatedHint);

  await page.getByRole("button", { name: "Update Word" }).click();

  await expect(wordCard).toContainText(updatedHint);

  // DELETE
  page.once("dialog", async (dialog) => {
    await dialog.accept();
  });

  await wordCard.getByRole("button", { name: "Delete" }).click();

  await expect(
    page.getByRole("heading", { name: uniqueWord })
  ).toHaveCount(0);
});