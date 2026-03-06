import { GithubLogoIcon } from "@phosphor-icons/react";
import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { Button } from "@raypx/design-system/components/ui/button";
import type { SiteConfig } from "@raypx/seo";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/components/home/user-button";

type HomeHeaderProps = {
  siteConfig: SiteConfig;
};

export function HomeHeader({ siteConfig }: HomeHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/90">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link className="flex items-center gap-2" to="/">
          <picture>
            <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.png" />
            <img alt="Raypx" className="h-6 w-6" src="/logo.png" />
          </picture>
          <span className="font-semibold">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button render={<a href="/docs" />} size="sm" variant="ghost">
            Docs
          </Button>
          <Button
            render={
              <a
                aria-label="GitHub"
                href={siteConfig.github}
                rel="noopener noreferrer"
                target="_blank"
              />
            }
            size="sm"
            variant="ghost"
          >
            <GithubLogoIcon className="size-4" />
          </Button>
          <ThemeSwitcher />
          <UserButton />
        </div>
      </div>
    </header>
  );
}
