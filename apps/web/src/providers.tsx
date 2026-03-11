import { AuthProvider } from "@raypx/auth/provider";
import { Toaster } from "@raypx/design-system/components/ui/sonner";
import { ThemeProvider } from "@raypx/design-system/providers/theme";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { FC, ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export const Providers: FC<ProvidersProps> = ({ children }) => {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        {children}
        <Toaster />
        {import.meta.env.DEV ? (
          <TanStackDevtools
            plugins={[
              {
                name: "TanStack Query",
                render: <ReactQueryDevtoolsPanel />,
                defaultOpen: true,
              },
              {
                name: "TanStack Router",
                render: <TanStackRouterDevtoolsPanel />,
                defaultOpen: false,
              },
            ]}
          />
        ) : null}
      </AuthProvider>
    </ThemeProvider>
  );
};
