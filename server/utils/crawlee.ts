//CAPTCHA対策の参考：https://zenn.dev/datajournal1/articles/3cab3ce82c89ff
import { chromium } from "playwright";
import type { DocumentCountResult } from "~~/shared/types/document-count";

export type ProgressCallback = (progress: number) => void;

export async function searchDocumentCountWithCrawlee(
  domain: string,
  onProgress?: ProgressCallback,
): Promise<DocumentCountResult> {
  const report = (progress: number) => {
    onProgress?.(progress);
  };

  report(5);
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--no-sandbox",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-extensions",
    ],
  });

  try {
    report(15);
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      locale: "ja-JP",
      timezoneId: "Asia/Tokyo",
    });

    const page = await context.newPage();

    // JavaScript検出回避
    await page.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", {
        get: () => undefined,
      });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
      Object.defineProperty(navigator, "languages", {
        get: () => ["ja-JP", "ja", "en-US", "en"],
      });
    });

    report(25);
    await page.goto("https://www.google.co.jp", {
      waitUntil: "networkidle",
    });

    report(40);
    // 人間らしい待機
    await page.waitForTimeout(2000 + Math.random() * 3000);

    // ランダムなマウス移動
    for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) {
      await page.mouse.move(
        100 + Math.random() * 900,
        100 + Math.random() * 700,
      );
      await page.waitForTimeout(100 + Math.random() * 400);
    }

    report(55);
    const searchBox = page.locator('textarea[name="q"]');
    await searchBox.click();
    await page.waitForTimeout(500 + Math.random() * 500);

    const query = `site:${domain}`;
    await searchBox.pressSequentially(query, {
      delay: 50 + Math.random() * 100,
    });

    await page.waitForTimeout(1000 + Math.random() * 2000);

    report(70);
    await page.keyboard.press("Enter");

    // 検索結果を待ちつつ進捗を2ずつ刻む
    const waitTimeout = 15000;
    const waitStart = Date.now();
    let found = false;
    let currentProgress = 70;
    while (Date.now() - waitStart < waitTimeout) {
      found = await page
        .locator("#result-stats")
        .isVisible()
        .catch(() => false);
      if (found) break;
      currentProgress = Math.min(currentProgress + 1, 89);
      report(currentProgress);
      await page.waitForTimeout(500);
    }

    report(90);

    // 少しスクロール
    await page.evaluate(
      `window.scrollBy(0, ${100 + Math.floor(Math.random() * 300)})`,
    );
    await page.waitForTimeout(1000 + Math.random() * 2000);

    report(95);

    // // デバッグ用スクリーンショット
    // const screenshotPath = "public/images/google-search-result.png";
    // await page.screenshot({ path: screenshotPath, fullPage: true });

    const text = await page
      .locator("#result-stats")
      .textContent()
      .catch(() => null);

    let totalResults = 0;
    if (text) {
      // console.log("Google Search Result Stats:", text);
      const match = text.match(/約?\s?([\d,]+)\s?件/);
      if (match?.[1]) {
        totalResults = parseInt(match[1].replace(/,/g, ""), 10);
      }
    }

    report(100);

    return {
      domain,
      totalResults,
      searchedAt: new Date().toISOString(),
    };
  } finally {
    await browser.close();
  }
}
