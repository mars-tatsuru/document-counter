import { getJson } from "serpapi";
import type { DocumentCountResult } from "~~/shared/types/document-count";

export async function searchDocumentCount(
  domain: string,
  apiKey: string,
): Promise<DocumentCountResult> {
  const result = await fetchTotalResults(domain, apiKey);

  // total_results が取得できなかった場合、start=10 でリトライ
  if (result === null) {
    const retryResult = await fetchTotalResults(domain, apiKey, 10);
    return {
      domain,
      totalResults: retryResult ?? 0,
      searchedAt: new Date().toISOString(),
    };
  }

  return {
    domain,
    totalResults: result,
    searchedAt: new Date().toISOString(),
  };
}

async function fetchTotalResults(
  domain: string,
  apiKey: string,
  start?: number,
): Promise<number | null> {
  const params: Record<string, string | number> = {
    // Googleで検索した時と同じ条件にするために、以下のパラメータを指定
    engine: "google", // Google検索エンジンを使用
    q: `site:${domain}`, // site:演算子でドメイン内のインデックス数を取得
    api_key: apiKey,
    gl: "jp", // 検索対象の国を日本に設定
    hl: "ja", // 検索結果の言語を日本語に設定
    google_domain: "google.co.jp", // google.co.jpを使用（ブラウザでの検索結果と一致させるため）
    nfpr: "1", // クエリの自動修正を無効化（ドメイン名が補正されるのを防ぐ）
  };
  if (start !== undefined) {
    params.start = start;
  }

  const response = await getJson(params);

  return response.search_information?.total_results ?? null;
}
