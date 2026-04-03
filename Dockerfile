FROM mcr.microsoft.com/playwright:v1.59.1-noble

RUN npm install -g bun

WORKDIR /app

# 依存関係インストール
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ソースコピー＆ビルド
COPY . .
RUN bun run build

# .output内の不足パッケージをインストール
WORKDIR /app/.output/server
RUN bun install
WORKDIR /app

ENV HOST=0.0.0.0
ENV PORT=8080
ENV NITRO_PORT=8080
ENV NITRO_HOST=0.0.0.0
EXPOSE 8080

CMD ["node", ".output/server/index.mjs"]
