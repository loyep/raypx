import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/hello")({
  server: {
    handlers: {
      GET: () => {
        return Response.json(
          {
            message: "hello",
          },
          { status: 200 },
        );
      },
    },
  },
});
