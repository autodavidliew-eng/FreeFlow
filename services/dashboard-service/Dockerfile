# syntax=docker/dockerfile:1

FROM node:20-slim AS base
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@9.1.0 --activate

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps/*/package.json apps/*/
COPY services/*/package.json services/*/
COPY packages/*/package.json packages/*/
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
RUN pnpm --filter @freeflow/dashboard-service build

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/services/dashboard-service/dist ./services/dashboard-service/dist
COPY --from=build /app/services/dashboard-service/package.json ./services/dashboard-service/package.json
COPY --from=build /app/packages ./packages
EXPOSE 4101
CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "services/dashboard-service/dist/main.js"]
