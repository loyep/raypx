import { db, schemas } from "@raypx/database";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const start = performance.now();
          const result = await db.$count(schemas.user);
          const end = performance.now();
          return Response.json(
            {
              status: "OK",
              duration: `${end - start}ms`,
              userCount: result,
            },
            { status: 200 },
          );
        } catch (error) {
          console.error(error);
          return Response.json({ status: "ERROR" }, { status: 500 });
        }
      },
    },
  },
});
