import { generateRootHead } from "@raypx/seo";
import { HeadContent } from "@raypx/seo/client";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Outlet, Scripts } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { Providers } from "@/providers";
import docsCss from "@/styles/docs.css?url";
import appCss from "@/styles/globals.css?url";

type RootRouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RootRouterContext>()({
  head: async () => {
    const seoHead = generateRootHead(siteConfig);

    return {
      meta: seoHead.meta,
      links: [
        { rel: "stylesheet", fetchPriority: "high", href: appCss },
        { rel: "preload", href: docsCss, as: "style" },
        ...(seoHead.links ?? []),
      ],
      scripts: seoHead.scripts,
    };
  },
  component: RootComponent,
});

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>
          <Outlet />
        </Providers>
        <Scripts />
      </body>
    </html>
  );
}
