import { rpcSystemService } from "@raypx/rpc";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          return Response.json(await rpcSystemService.health(), { status: 200 });
        } catch (error) {
          console.error(error);
          return Response.json({ status: "ERROR" }, { status: 500 });
        }
      },
    },
  },
});
