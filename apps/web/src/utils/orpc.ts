import type { orpc } from "@raypx/rpc/orpc";
import { toast } from "@raypx/ui/components/toast";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(`Error: ${error.message}`, {
        action: {
          label: "retry",
          onClick: query.invalidate,
        },
      });
    },
  }),
});

export type ORPC = typeof orpc;
