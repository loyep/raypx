import { count, db, schemas } from "@raypx/database";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const result = await db.select({ count: count() }).from(schemas.user);
        const userCount = result[0]?.count ?? 0;
        console.log("health - user count:", userCount);
        return Response.json(
          {
            status: "OK",
            timestamp: new Date().toISOString(),
            userCount,
          },
          { status: 200 },
        );
      },
    },
  },
});
