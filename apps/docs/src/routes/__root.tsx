import { generateRootHead } from "@raypx/seo";
import { HeadContent } from "@raypx/seo/client";
import { createRootRoute, Outlet, Scripts } from "@tanstack/react-router";
import { DefaultCatchBoundary } from "@/components/default-catch-boundary";
import Loading from "@/components/layout/loading";
import NotFound from "@/components/layout/not-found";
import { siteConfig } from "@/config/site";
import { Providers } from "@/providers";
import appCss from "@/styles/globals.css?url";

export const Route = createRootRoute({
  head: async () => {
    const seoHead = generateRootHead(siteConfig);

    return {
      meta: seoHead.meta,
      links: [{ rel: "stylesheet", href: appCss }, ...(seoHead.links ?? [])],
      scripts: seoHead.scripts,
    };
  },
  component: RootComponent,
  notFoundComponent: () => <NotFoundComponent />,
  errorComponent: (props) => (
    <RootDocument>
      <DefaultCatchBoundary {...props} />
    </RootDocument>
  ),
  pendingComponent: () => <Loading />,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html dir="ltr" lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Scripts />
      </body>
    </html>
  );
}

function NotFoundComponent() {
  return (
    <div>
      <NotFound />
    </div>
  );
}
