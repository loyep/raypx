import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/")({
  server: {
    handlers: {
      GET: () => {
        return Response.json(
          {
            status: "OK",
            timestamp: new Date().toISOString(),
          },
          { status: 200 },
        );
      },
    },
  },
});
