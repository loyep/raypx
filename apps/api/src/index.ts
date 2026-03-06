import { serve } from "@hono/node-server";
import { logger } from "@raypx/logger";
import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  return c.json({
    service: "api",
    ok: true,
  });
});

app.get("/api/health", (c) => {
  return c.json({
    ok: true,
    service: "api",
    timestamp: new Date().toISOString(),
  });
});

const port = Number(process.env.PORT ?? 3000);

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    logger.info(`[api] listening on http://localhost:${info.port}`);
  },
);
