# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app

ENV NODE_ENV=production
ENV LEFTHOOK=0
ENV CI=true

# Enable pnpm
RUN corepack enable

# Pruner: Generate pruned monorepo for target app
FROM base AS pruner
# Copy manifests first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
RUN pnpm dlx turbo prune web --docker

# Installer: Install dependencies from pruned workspace
FROM base AS installer
ENV NODE_ENV=development
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/packages/forge/forge.mjs ./packages/forge/forge.mjs
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Prod deps: runtime-only dependencies
FROM base AS prod-deps
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --prod

# Builder: Build web app from pruned sources
FROM installer AS builder
COPY --from=pruner /app/out/full/ .
COPY . .
RUN ls -la
RUN pnpm turbo build --filter=web...

# Runner: Production runtime with prod deps + build output only
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Copy prod node_modules and build artifacts
COPY --chown=node:node --from=prod-deps /app/apps/web/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/apps/web/.output .output
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
