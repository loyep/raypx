# apps/web

Main web application for Raypx.

This app contains:

- App area routes (dashboard, chat, settings, admin pages)
- Public/docs routes
- API route handlers mounted under `src/routes/api/*`

## Key Paths

- `src/routes/(app)` - authenticated app routes
- `src/routes/docs` - docs UI routes
- `src/routes/api` - API endpoints
- `src/features` - feature modules (chat, admin, etc.)
- `content/docs` - docs content source
- `Dockerfile` - production image build

## Scripts

Run from repo root:

```bash
pnpm --filter web dev
pnpm --filter web build
pnpm --filter web start
pnpm --filter web test
```

Or use root shortcuts:

```bash
pnpm dev:web
pnpm build:web
pnpm start:web
```

## Docker

Build image from repo root:

```bash
docker build -f apps/web/Dockerfile -t raypx-web:latest .
```

Run:

```bash
docker run --rm -p 3000:3000 raypx-web:latest
```
