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
    <BaseAuthLayout
      logoSlot={<Logo alt="Raypx" className="mx-auto h-12 w-12" />}
      subtitle={subtitle}
      title={title}
    >
      {children}
    </BaseAuthLayout>
  );
}
