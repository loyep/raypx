import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

type AuthLayoutProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function AuthLayout({ children, subtitle, title }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="absolute h-[600px] w-[800px] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute top-1/4 h-[500px] w-[600px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="fade-in w-full max-w-lg animate-in duration-500">
        <div className="rounded-2xl border border-border bg-card/80 p-8 shadow-lg backdrop-blur-2xl">
          <div className="mb-8 text-center">
            <Link className="mb-6 inline-flex" to="/">
              <Logo className="mx-auto" />
            </Link>
            <h1 className="font-bold text-2xl text-foreground">{title}</h1>
            <p className="mt-2 text-muted-foreground text-sm">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
