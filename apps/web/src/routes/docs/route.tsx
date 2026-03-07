import { RootProvider } from "@fumadocs/base-ui/provider/tanstack";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TanstackProvider } from "fumadocs-core/framework/tanstack";
import appCss from "@/styles/docs.css?url";

export const Route = createFileRoute("/docs")({
  component: RouteComponent,
  head: () => ({
    links: [{ rel: "stylesheet", href: appCss }],
  }),
});

function RouteComponent() {
  return (
    <TanstackProvider>
      <RootProvider
        search={{
          enabled: true,
          options: {
            api: "/api/search",
          },
        }}
      >
        <Outlet />
      </RootProvider>
    </TanstackProvider>
  );
}
