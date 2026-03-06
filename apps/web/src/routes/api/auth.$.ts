import { serverAuth } from "@raypx/auth/server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        return serverAuth.handler(request);
      },
      POST: async ({ request }) => {
        return serverAuth.handler(request);
      },
    },
  },
});
