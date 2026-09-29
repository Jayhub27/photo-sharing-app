# syntax=docker/dockerfile:1

# --- build -------------------------------------------------------------------
FROM node:22-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY app/package.json ./app/package.json
RUN npm ci

COPY server ./server
RUN npm run build --workspace server

# --- runtime -----------------------------------------------------------------
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY app/package.json ./app/package.json
RUN npm ci --omit=dev --workspace server --include-workspace-root \
  && npm cache clean --force

COPY --from=build /app/server/dist ./server/dist
COPY server/public ./server/public

EXPOSE 3000
CMD ["node", "server/dist/index.js"]
