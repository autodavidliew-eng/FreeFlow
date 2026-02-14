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
RUN pnpm --filter @freeflow/alarm-service build

FROM base AS runner
ENV NODE_ENV=production
ENV HOST=0.0.0.0
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/services/alarm-service/dist ./services/alarm-service/dist
COPY --from=build /app/services/alarm-service/package.json ./services/alarm-service/package.json
COPY --from=build /app/packages ./packages
EXPOSE 4102
CMD ["node", "-r", "ts-node/register/transpile-only", "-r", "tsconfig-paths/register", "services/alarm-service/dist/main.js"]
