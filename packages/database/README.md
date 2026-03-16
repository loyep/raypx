# @raypx/database

Drizzle ORM schemas and migrations for PostgreSQL.

## Requirements

- **PostgreSQL** 15+
- **pgvector** extension (for embeddings / vector search)

## pgvector Setup

Migrations require the `vector` extension. Install it for your environment:

### macOS (Homebrew)

```bash
brew install pgvector
# Restart PostgreSQL if running as a service
brew services restart postgresql@16  # or your version
```

### Ubuntu / Debian

```bash
sudo apt install postgresql-16-pgvector  # match your Postgres version
sudo systemctl restart postgresql
```

### Docker

Use an image with pgvector:

```bash
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  ankane/pgvector
```

### Neon / Supabase / Railway

These providers include pgvector. Ensure your database user can create extensions. If migration fails on `CREATE EXTENSION vector`, run in the SQL editor:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Then retry `forge setup` or `pnpm db migrate`.

## Commands

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `forge db push`    | Push schema to DB (dev, no migration files) |
| `forge db migrate` | Run migrations                              |
| `forge db studio`  | Open Drizzle Studio                         |
| `forge db seed`    | Seed with test data                         |
