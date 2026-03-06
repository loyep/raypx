import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { Link } from "@tanstack/react-router";
import type { FC } from "react";

type AuthLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle: string;
};

export const AuthLayout: FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Aurora Spotlights */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute h-[600px] w-[800px] rounded-full bg-primary/20 blur-[120px] dark:mix-blend-screen" />
        <div className="absolute top-1/4 h-[500px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px] dark:mix-blend-screen" />
      </div>

      {/* Theme Switcher */}
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>

      <div className="fade-in w-full max-w-md animate-in duration-500">
        {/* Glass Container */}
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur-2xl">
          {/* Logo & Header */}
          <div className="mb-8 text-center">
            <Link className="mb-6 inline-block" to="/">
              <img alt="Raypx" className="mx-auto h-12 w-12" src="/logo.png" />
            </Link>
            <h1 className="font-bold text-2xl text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </main>
  );
};
