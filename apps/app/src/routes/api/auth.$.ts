import { createAuthRouteHandlers } from "@raypx/auth/server";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: createAuthRouteHandlers(),
  },
});
