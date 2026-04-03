import { searchDocumentCount } from "../utils/serpapi";
import { cleanDomain, domainRegex } from "~~/shared/utils/validation";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ domain?: string }>(event);

  if (!body?.domain || typeof body.domain !== "string") {
    throw createError({ statusCode: 400, message: "ドメインは必須です" });
  }

  const domain = cleanDomain(body.domain);

  if (!domainRegex.test(domain)) {
    throw createError({
      statusCode: 400,
      message: "有効なドメイン形式で入力してください（例: example.com）",
    });
  }

  const config = useRuntimeConfig();

  if (!config.serpApiKey) {
    throw createError({
      statusCode: 500,
      message: "SerpAPI キーが設定されていません",
    });
  }

  try {
    const result = await searchDocumentCount(domain, config.serpApiKey);
    // テスト用のモックデータ
    // const result = {
    //   domain,
    //   totalResults: 123456,
    //   searchedAt: new Date().toISOString(),
    // };

    return result;
  } catch (error: unknown) {
    throw createError({
      statusCode: 502,
      message: `ドキュメント数の取得に失敗しました。再度お試しください。`,
    });
  }
});
