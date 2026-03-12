import { Separator } from "@raypx/design-system/components/ui/separator";
import type { SiteConfig } from "@raypx/seo";
import type { ReactNode } from "react";
import { HomeFooter } from "./sections/footer";
import { HomeHeader } from "./sections/header";

type MarketingShellProps = {
  children: ReactNode;
  siteConfig: SiteConfig;
};

export function MarketingShell({ children, siteConfig }: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeHeader siteConfig={siteConfig} />
      <main id="main-content">{children}</main>
      <Separator />
      <HomeFooter siteConfig={siteConfig} />
    </div>
  );
}
