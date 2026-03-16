import { AuthProvider } from "@raypx/auth/client";
import { Toaster } from "@raypx/design-system/components/ui/sonner";
import { ThemeProvider } from "@raypx/design-system/providers/theme";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system">
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}
