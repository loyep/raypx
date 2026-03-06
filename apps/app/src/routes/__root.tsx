import { generateRootHead } from "@raypx/seo";
import { Toaster } from "@raypx/ui/components/sonner";
import { ThemeProvider } from "@raypx/ui/components/theme-provider";
import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { siteConfig } from "~/config/site";
import appCss from "~/styles/globals.css?url";

type RootRouterContext = {
  queryClient: QueryClient;
};

export const Route = createRootRouteWithContext<RootRouterContext>()({
  head: async () => {
    const seoHead = generateRootHead(siteConfig);

    return {
      meta: seoHead.meta,
      links: [{ rel: "stylesheet", href: appCss }, ...(seoHead.links ?? [])],
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
        <ThemeProvider defaultTheme="system">
          <a
            className="pointer-events-none fixed top-4 left-4 z-50 -translate-y-full rounded-md bg-primary px-3 py-2 text-primary-foreground opacity-0 transition-transform focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:ring-ring"
            href="#main-content"
          >
            Skip to main content
          </a>
          <Outlet />
          <Toaster />
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  );
}
