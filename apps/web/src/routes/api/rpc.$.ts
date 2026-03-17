import { createHandler } from "@raypx/rpc";
import { createFileRoute } from "@tanstack/react-router";

const handler = createHandler({ prefix: "/api/rpc" });

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return handler({ request });
      },
      POST: async ({ request }) => {
        return handler({ request });
      },
      PUT: async ({ request }) => {
        return handler({ request });
      },
      DELETE: async ({ request }) => {
        return handler({ request });
      },
      PATCH: async ({ request }) => {
        return handler({ request });
      },
    },
  },
});
