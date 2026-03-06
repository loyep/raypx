import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import { NotFound } from "@/components/not-found";
import { routeTree } from "./routeTree.gen";

const queryClient = new QueryClient();

export const getRouter = () => {
  const router = createTanstackRouter({
    context: { queryClient },
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultErrorComponent: () => <div>Something went wrong</div>,
    defaultNotFoundComponent: () => <NotFound />,
    Wrap: (props) => {
      return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
    },
  });

  return router;
};
