import { RootProvider } from "@fumadocs/base-ui/provider/tanstack";
import { Toaster } from "@raypx/design-system/components/ui/sonner";
import { ThemeProvider } from "@raypx/design-system/providers/theme";
import { TanstackProvider } from "fumadocs-core/framework/tanstack";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <TanstackProvider>
        <RootProvider
          search={{
            enabled: true,
            options: {
              api: "/api/search",
            },
          }}
        >
          {children}
          <Toaster />
        </RootProvider>
      </TanstackProvider>
    </ThemeProvider>
  );
}
