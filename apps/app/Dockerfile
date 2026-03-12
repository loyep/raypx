# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
WORKDIR /app

ENV LEFTHOOK=0 CI=true TURBO_TELEMETRY_DISABLED=1

RUN corepack enable && corepack prepare pnpm@10.31.0 --activate

FROM base AS pruner
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling
COPY .dockerignore ./.dockerignore
COPY .gitignore ./.gitignore
COPY tsconfig.json ./tsconfig.json
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm dlx turbo prune app --docker

FROM base AS installer
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/tooling ./tooling
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

FROM installer AS builder
ENV NODE_ENV=production
COPY --from=pruner /app/out/full/package.json ./package.json
COPY --from=pruner /app/out/full/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/full/turbo.json ./turbo.json
COPY --from=pruner /app/out/full/apps ./apps
COPY --from=pruner /app/out/full/packages ./packages
COPY --from=pruner /app/out/full/tooling ./tooling
COPY --from=pruner /app/.dockerignore /app/.gitignore /app/tsconfig.json ./
RUN pnpm turbo build --filter=app... --summarize

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000

COPY --chown=node:node --from=builder /app/apps/app/.output .output
USER node

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
