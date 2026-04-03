import type { DocumentCountResult } from "~~/shared/types/document-count";

export type ProgressCallback = (progress: number) => void;

export async function searchDocumentCountWithBrowserless(
  domain: string,
  onProgress?: ProgressCallback,
): Promise<DocumentCountResult> {
  const report = (progress: number) => {
    onProgress?.(progress);
  };

  const config = useRuntimeConfig();
  const token = config.browserlessApiToken;

  report(5);

  // BrowserQL: Google検索結果ページに直接遷移し、結果件数を取得
  const searchUrl = `https://www.google.co.jp/search?q=site:${encodeURIComponent(domain)}&hl=ja&gl=jp`;
  const query = `
    mutation GoogleSearch {
      goto(url: "${searchUrl}", waitUntil: networkIdle) {
        status
        time
      }
      solve {
        found
        solved
        time
      }
      resultStats: text(selector: "#result-stats") {
        text
      }
    }
  `;

  report(10);

  // BrowserQLリクエスト中はタイマーで進捗を刻む（20→85を段階的に）
  let currentProgress = 20;
  report(currentProgress);
  const progressInterval = setInterval(() => {
    if (currentProgress < 85) {
      currentProgress += 3;
      report(currentProgress);
    }
  }, 1000);

  let response;
  try {
    response = await $fetch<{
      data?: {
        goto?: { status: number };
        solve?: { found: boolean; solved: boolean };
        resultStats?: { text: string };
      };
      errors?: Array<{ message: string }>;
    }>(`https://production-sfo.browserless.io/chromium/bql?token=${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { query },
    });
  } finally {
    clearInterval(progressInterval);
  }

  report(90);

  if (response.errors?.length) {
    console.error("BrowserQL errors:", response.errors);
    throw new Error(response.errors[0]?.message);
  }

  report(95);

  const text = response.data?.resultStats?.text ?? "";
  let totalResults = 0;

  if (text) {
    // 日本語: "約 1,234 件" / 英語: "About 1,234 results"
    const match =
      text.match(/約?\s?([\d,]+)\s?件/) ||
      text.match(/About\s+([\d,]+)\s+results/i);
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
}
