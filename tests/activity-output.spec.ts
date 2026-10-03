import { test, expect } from "@playwright/test";

test("teacher can create, download and play a Wordle activity", async ({
  page,
  request,
}) => {
  const activityName = `Playwright Wordle ${Date.now()}`;
  let activityId: number | null = null;

  try {
    // Get an EASY word so the test knows which target word
    // and phonemes it should select and later play.
    const wordsResponse = await request.get(
      "http://localhost:3000/api/words"
    );

    expect(wordsResponse.ok()).toBeTruthy();

    const words = await wordsResponse.json();

    const testWord = words.find(
      (word: {
        id: number;
        text: string;
        difficulty: string;
        phonemes: { symbol: string; position: number }[];
      }) =>
        word.difficulty === "EASY" &&
        Array.isArray(word.phonemes) &&
        word.phonemes.length === 3
    );

    expect(testWord).toBeTruthy();

    const targetPhonemes = [...testWord.phonemes]
      .sort(
        (
          a: { position: number },
          b: { position: number }
        ) => a.position - b.position
      )
      .map(
        (item: { symbol: string }) =>
          item.symbol
      );

    expect(targetPhonemes).toHaveLength(3);

    // TEACHER USE CASE:
    // Create the Wordle through the real builder UI.
    await page.goto("/wordle");

    await expect(
      page.getByRole("heading", {
        name: "Wordle Activity Builder",
      })
    ).toBeVisible();

    // Select Easy difficulty.
    await page
      .getByRole("radio", { name: "Easy" })
      .check();

    // Select the target word.
    await page
      .getByLabel("Target word")
      .selectOption(String(testWord.id));

    // Name and save the activity.
    await page
      .getByLabel("Activity name")
      .fill(activityName);

    await page
      .getByRole("button", { name: "Save Activity" })
      .click();

    await expect(
      page.getByRole("status")
    ).toContainText("saved successfully");

    // Find the ID of the activity created through the UI.
    const activitiesResponse = await request.get(
      "http://localhost:3000/api/activities"
    );

    expect(activitiesResponse.ok()).toBeTruthy();

    const activities = await activitiesResponse.json();

    const createdActivity = activities.find(
      (activity: { id: number; name: string }) =>
        activity.name === activityName
    );

    expect(createdActivity).toBeTruthy();

    activityId = createdActivity.id;

    // Verify the newly saved activity can be downloaded
    // directly from the builder.

    await page.evaluate(() => {
      const originalCreateObjectURL = URL.createObjectURL;

      URL.createObjectURL = function (blob: Blob) {
        blob.text().then((text) => {
          (window as typeof window & {
            __generatedWordleHtml?: string;
          }).__generatedWordleHtml = text;
        });

        return originalCreateObjectURL.call(URL, blob);
      };
    });

    const downloadPromise = page.waitForEvent("download");

    await page
      .getByRole("button", { name: "Download HTML" })
      .click();

    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.html$/);

    // STUDENT USE CASE:
    // Use the exact HTML captured from the generated download Blob.
    await page.waitForFunction(() => {
      return Boolean(
        (
          window as typeof window & {
            __generatedWordleHtml?: string;
          }
        ).__generatedWordleHtml
      );
    });

    const htmlContent = await page.evaluate(() => {
      return (
        window as typeof window & {
          __generatedWordleHtml?: string;
        }
      ).__generatedWordleHtml;
    });

    expect(htmlContent).toBeTruthy();

    const gamePage = await page.context().newPage();

    await gamePage.setContent(htmlContent!);

    await expect(
      gamePage.getByRole("heading", {
        name: activityName,
      })
    ).toBeVisible();

    // Verify the standalone game rendered its six rows.
    await expect(
      gamePage.locator("#board .row")
    ).toHaveCount(6);

    // Play the correct phonemes.
    for (const phoneme of targetPhonemes) {
      await gamePage
        .locator(
          `.phoneme-button[data-phoneme="${phoneme}"]`
        )
        .click();
    }

    await gamePage
      .getByRole("button", { name: "Submit Guess" })
      .click();

    // The generated game must actually recognise the answer.
    await expect(
      gamePage.locator("#message")
    ).toContainText("Correct!");

    await expect(
      gamePage.locator("#message")
    ).toContainText(testWord.text.toUpperCase());

    await gamePage.close();
  } finally {
    // Remove the temporary activity even if an assertion fails.
    if (activityId !== null) {
      await request.delete(
        `http://localhost:3000/api/activities/${activityId}`
      );
    }
  }
});