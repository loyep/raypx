import { createHandler } from "@raypx/rpc/orpc";
import { createFileRoute } from "@tanstack/react-router";

const handler = createHandler({ prefix: "/api/rpc" });

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => handler({ request }),
      POST: async ({ request }) => handler({ request }),
      PUT: async ({ request }) => handler({ request }),
      DELETE: async ({ request }) => handler({ request }),
      PATCH: async ({ request }) => handler({ request }),
    },
  },
});
