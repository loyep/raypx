# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app

ENV LEFTHOOK=0 CI=true TURBO_TELEMETRY_DISABLED=1

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate

# Pruner: Generate pruned monorepo for target app
FROM base AS pruner
# Copy manifests first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling
COPY .dockerignore ./.dockerignore
COPY .gitignore ./.gitignore
COPY tsconfig.json ./tsconfig.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm dlx turbo prune web --docker

# Installer: Install dependencies from pruned workspace
FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
# Ensure workspace bins from @raypx/forge exist before pnpm installs dependencies.
COPY --from=pruner /app/out/full/tooling ./tooling
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Builder: Build web app from pruned sources
FROM installer AS builder
ENV NODE_ENV=production
# Intentionally copy only the pruned workspace files required for building `web`.
# Keep `COPY . .` commented as a fallback for debugging or if prune output changes.
# COPY . .
COPY --from=pruner /app/out/full/package.json ./package.json
COPY --from=pruner /app/out/full/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/full/turbo.json ./turbo.json
COPY --from=pruner /app/out/full/apps ./apps
COPY --from=pruner /app/out/full/packages ./packages
COPY --from=pruner /app/out/full/tooling ./tooling
COPY --from=pruner /app/.dockerignore /app/.gitignore /app/tsconfig.json ./
RUN --mount=type=cache,id=turbo-cache,target=/app/.turbo \
    pnpm turbo build --filter=web...

# Runner: Production runtime with build output only
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000

# Copy build artifacts
COPY --chown=node:node --from=builder /app/apps/web/.output .output
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
