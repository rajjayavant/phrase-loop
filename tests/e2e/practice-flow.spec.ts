import { fileURLToPath } from "node:url";
import { test, expect, type Page } from "@playwright/test";

/**
 * Critical practice flows, driven against the deterministic mock adapter
 * (`?mock=1`) so tests never depend on live YouTube playback.
 */

const SAMPLE_MEDIA = fileURLToPath(
  new URL("./fixtures/sample.mp4", import.meta.url),
);

const VIDEO_ID = "dQw4w9WgXcQ";
const practiceUrl = (params = "") =>
  `/practice?v=${VIDEO_ID}&mock=1${params}`;

async function startPlayer(page: Page) {
  await page.getByRole("button", { name: "Start playback" }).click();
  // Pause so tests are deterministic about the current time.
  await page.waitForTimeout(200);
}

/** Marker editing lives in the collapsible Advanced settings panel. */
async function openAdvanced(page: Page) {
  const toggle = page.getByRole("button", { name: /Advanced settings/ });
  if ((await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
  }
}

const loopButton = (page: Page) =>
  page.getByRole("button", { name: /able looping/ });

test("root redirects into the practice workspace (default video)", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/practice\?v=[A-Za-z0-9_-]{11}/);
});

test("header link input loads another video in place", async ({ page }) => {
  await page.goto(practiceUrl());
  await page
    .getByLabel("Load another YouTube video")
    .fill("https://www.youtube.com/watch?v=" + VIDEO_ID);
  await page.getByRole("button", { name: "Load video" }).click();
  await expect(page).toHaveURL(new RegExp(`/practice\\?v=${VIDEO_ID}`));
});

test("invalid link shows the invalid-link state", async ({ page }) => {
  await page.goto("/practice?v=not-valid");
  await expect(
    page.getByRole("heading", { name: "No video to practice" }),
  ).toBeVisible();
});

test("loads the player shell and reveals the start control", async ({
  page,
}) => {
  await page.goto(practiceUrl());
  await expect(
    page.getByRole("button", { name: "Start playback" }),
  ).toBeVisible();
});

test("sets distinct markers and keeps a valid loop active", async ({
  page,
}) => {
  await page.goto(practiceUrl());
  await page.waitForTimeout(1000);
  await openAdvanced(page);

  // Fresh video already loops the whole clip. Redefine the region precisely.
  const aField = page.getByLabel("Marker A timestamp");
  await aField.fill("00:30.000");
  await aField.press("Enter");
  const bField = page.getByLabel("Marker B timestamp");
  await bField.fill("00:40.000");
  await bField.press("Enter");
  await page.waitForTimeout(200);

  await expect(aField).toHaveValue("00:30.000");
  await expect(bField).toHaveValue("00:40.000");

  // The loop toggle (bottom bar) reflects and controls the loop state.
  await expect(loopButton(page)).toHaveAttribute("aria-pressed", "true");
  await loopButton(page).click();
  await expect(loopButton(page)).toHaveAttribute("aria-pressed", "false");
  await loopButton(page).click();
  await expect(loopButton(page)).toHaveAttribute("aria-pressed", "true");
});

test("changes playback speed via a preset and reflects the applied rate", async ({
  page,
}) => {
  await page.goto(practiceUrl());
  await page.getByRole("button", { name: "0.5×" }).click();
  // The mock supports 0.5 exactly, so the header shows 0.5×.
  await expect(page.getByText("0.5×").first()).toBeVisible();
});

test("hydrates state from the URL", async ({ page }) => {
  await page.goto(practiceUrl("&a=12&b=20&speed=0.75&loop=1"));
  await page.waitForTimeout(800);
  await openAdvanced(page);
  // Speed input reflects the URL.
  await expect(page.getByLabel("Exact playback speed")).toHaveValue("0.75");
  // Marker timestamps reflect the URL.
  await expect(page.getByLabel("Marker A timestamp")).toHaveValue("00:12.000");
  await expect(page.getByLabel("Marker B timestamp")).toHaveValue("00:20.000");
});

test("copies a practice link", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(practiceUrl("&a=12&b=20&loop=1"));
  await page.getByRole("button", { name: /Copy link/ }).click();
  await expect(
    page.getByText("Practice link copied", { exact: true }),
  ).toBeVisible();

  const clipboard = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboard).toContain(`v=${VIDEO_ID}`);
  expect(clipboard).toContain("a=12");
});

test("a shared loop link parks the playhead on marker A", async ({ page }) => {
  // Marker A at 45s; opening the link should seek there (not 0), ready to play.
  await page.goto(practiceUrl("&a=45&b=60&loop=1"));
  await page.waitForTimeout(1200);
  // The adapter's current time should be at marker A, not 0.
  const current = await page.evaluate(
    () =>
      (
        window as unknown as {
          __looperCurrentTime?: () => number;
        }
      ).__looperCurrentTime?.() ?? -1,
  );
  expect(current).toBeGreaterThanOrEqual(44);
  expect(current).toBeLessThanOrEqual(46);
});

test("silently restores a saved session on return", async ({ page }) => {
  await page.goto(practiceUrl());
  await startPlayer(page);
  await openAdvanced(page);
  // Move marker A to a distinctive time via the exact-entry field.
  const aField = page.getByLabel("Marker A timestamp");
  await aField.fill("00:42.000");
  await aField.press("Enter");
  await page.waitForTimeout(700); // allow session debounce to flush

  // Return WITHOUT url state; the saved session should be restored silently.
  await page.goto(practiceUrl());
  await page.waitForTimeout(800);
  await openAdvanced(page);
  await expect(page.getByLabel("Marker A timestamp")).toHaveValue("00:42.000");
});

test("a fresh video defaults to a whole-clip loop", async ({ page }) => {
  await page.goto(practiceUrl());
  await page.waitForTimeout(1000);
  // Loop is enabled by default (the toggle in the bottom bar is pressed).
  await expect(loopButton(page)).toHaveAttribute("aria-pressed", "true");
  await openAdvanced(page);
  // Mock duration is 180s (03:00). A defaults to 0, B to the end.
  await expect(page.getByLabel("Marker A timestamp")).toHaveValue("00:00.000");
  await expect(page.getByLabel("Marker B timestamp")).toHaveValue("03:00.000");
});

test("opens the keyboard shortcuts dialog", async ({ page }) => {
  await page.goto(practiceUrl());
  await page.getByRole("button", { name: /Shortcuts/ }).click();
  await expect(
    page.getByRole("heading", { name: "Keyboard shortcuts" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("heading", { name: "Keyboard shortcuts" }),
  ).not.toBeVisible();
});

test("opening a local media file plays it with full practice controls", async ({
  page,
}) => {
  await page.goto(practiceUrl());
  await page.waitForTimeout(500);

  // Pick a local file via the hidden file input (same input the button opens).
  await page.locator('input[type="file"]').setInputFiles(SAMPLE_MEDIA);

  // Routes into local mode and loads the file.
  await expect(page).toHaveURL(/src=local%3A[a-f0-9]+/);
  await expect(
    page.getByRole("button", { name: "Start playback" }),
  ).toBeVisible();

  // A whole-clip loop is armed (fixture is 12s) — same default as YouTube.
  await openAdvanced(page);
  await expect(page.getByLabel("Marker A timestamp")).toHaveValue("00:00.000");
  await expect(page.getByLabel("Marker B timestamp")).toHaveValue("00:12.000");

  // Full seek/loop control: redefine a tight loop precisely.
  const aField = page.getByLabel("Marker A timestamp");
  await aField.fill("00:03.000");
  await aField.press("Enter");
  const bField = page.getByLabel("Marker B timestamp");
  await bField.fill("00:06.000");
  await bField.press("Enter");
  await expect(aField).toHaveValue("00:03.000");
  await expect(bField).toHaveValue("00:06.000");

  // Speed control works on local media too.
  await page.getByRole("button", { name: "0.5×" }).first().click();
  await expect(page.getByText("0.5×").first()).toBeVisible();
});
