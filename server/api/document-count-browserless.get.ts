import { searchDocumentCountWithBrowserless } from "../utils/browserless";
import { cleanDomain, domainRegex } from "~~/shared/utils/validation";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const rawDomain = query.domain as string | undefined;

  if (!rawDomain || typeof rawDomain !== "string") {
    throw createError({ statusCode: 400, message: "ドメインは必須です" });
  }

  const domain = cleanDomain(rawDomain);

  if (!domainRegex.test(domain)) {
    throw createError({
      statusCode: 400,
      message: "有効なドメイン形式で入力してください（例: example.com）",
    });
  }

  // SSEヘッダー
  setResponseHeaders(event, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  const send = (data: Record<string, unknown>) => {
    event.node.res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await searchDocumentCountWithBrowserless(
      domain,
      (progress) => {
        send({ type: "progress", progress });
      },
    );

    send({ type: "result", ...result });
  } catch (error) {
    console.error("Browserless error:", error);
    send({
      type: "error",
      message: "ドキュメント数の取得に失敗しました。再度お試しください。",
    });
  } finally {
    event.node.res.end();
  }
});
