import { test, expect } from "@playwright/test";

test("user can view a saved Wordle and download its HTML activity", async ({
  page,
  request,
}) => {
  const activityName = `Playwright Wordle ${Date.now()}`;
  let activityId: number | null = null;

  try {
    // Find an existing EASY word to use in the temporary activity.
    const wordsResponse = await request.get(
      "http://localhost:3000/api/words"
    );

    expect(wordsResponse.ok()).toBeTruthy();

    const words = await wordsResponse.json();

    const testWord = words.find(
      (word: { id: number; difficulty: string }) =>
        word.difficulty === "EASY"
    );

    expect(testWord).toBeTruthy();

    // Create temporary saved Wordle activity.
    const createResponse = await request.post(
      "http://localhost:3000/api/activities",
      {
        data: {
          name: activityName,
          type: "WORDLE",
          difficulty: "EASY",
          hintsEnabled: false,
          wordIds: [testWord.id],
        },
      }
    );

    expect(createResponse.status()).toBe(201);

    const activity = await createResponse.json();
    activityId = activity.id;

    // USER USE CASE:
    // Open the saved activity through the real frontend.
    await page.goto(`/wordle?activity=${activityId}`);

    await expect(
      page.getByRole("heading", { name: activityName })
    ).toBeVisible();

    // Verify that the saved activity can generate an HTML download.
    const downloadPromise = page.waitForEvent("download");

    await page
      .getByRole("button", { name: "Download HTML" })
      .click();

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.html$/);
  } finally {
    // Remove the temporary activity even if an assertion fails.
    if (activityId !== null) {
      await request.delete(
        `http://localhost:3000/api/activities/${activityId}`
      );
    }
  }
});