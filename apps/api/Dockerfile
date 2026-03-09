# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base

WORKDIR /app

ENV NODE_ENV=production
ENV LEFTHOOK=0
ENV CI=true

# Enable pnpm using Corepack
RUN corepack enable && corepack prepare pnpm@10.31.0 --activate

# Stage 1: Builder
FROM base AS builder
ENV NODE_ENV=development

# Copy dependency manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY apps ./apps
COPY packages ./packages
COPY tooling ./tooling

# Install dependencies with shared pnpm store cache
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm turbo build --filter=api...

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install curl for health check
RUN apk add --no-cache curl

# Copy built application from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

# Expose the application port
EXPOSE 3000

# Start the production server
CMD ["node", "apps/api/dist/index.mjs"]
