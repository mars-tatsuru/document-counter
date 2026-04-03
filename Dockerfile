FROM oven/bun:1 AS base

# Playwright用のChromium依存ライブラリをインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxrandr2 libgbm1 \
    libpango-1.0-0 libcairo2 libasound2 libxshmfence1 \
    fonts-noto-cjk \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 依存関係インストール
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Playwrightのブラウザをインストール
RUN bunx playwright install chromium

# ソースコピー＆ビルド
COPY . .
RUN bun run build

ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]
