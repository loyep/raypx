import { AuthLayout as BaseAuthLayout } from "@raypx/auth-ui";
import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

type AuthLayoutProps = {
  children: ReactNode;
  subtitle: string;
  title: string;
};

export function AuthLayout({ children, subtitle, title }: AuthLayoutProps) {
  return (
    <BaseAuthLayout logoSlot={<Logo className="mx-auto" />} subtitle={subtitle} title={title}>
      {children}
    </BaseAuthLayout>
  );
}
