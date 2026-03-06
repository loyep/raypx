import { AuthProvider } from "@raypx/auth/provider";
import { Toaster } from "@raypx/design-system/components/ui/sonner";
import { ThemeProvider } from "@raypx/design-system/providers/theme";
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
      </AuthProvider>
    </ThemeProvider>
  );
};
