import { toast } from "@raypx/design-system/components/ui/toast";
import { client, type orpc } from "@raypx/rpc";
import { QueryCache, QueryClient } from "@tanstack/react-query";

export { client };

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
