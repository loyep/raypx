import { useSession } from "@raypx/auth";
import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { Button } from "@raypx/design-system/components/ui/button";
import type { SiteConfig } from "@raypx/seo";
import { IconBrandGithub } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

type HomeHeaderProps = {
  siteConfig: SiteConfig;
};

export function HomeHeader({ siteConfig }: HomeHeaderProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const navItems = [
    { label: "Download", to: "/download" as const },
    { label: "Open Source", to: "/open-source" as const },
    { label: "Docs", to: "/docs" as const },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link className="flex items-center gap-2" to="/">
          <Logo alt={siteConfig.name} />
          <span className="font-semibold">{siteConfig.name}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Button key={item.to} render={<Link to={item.to} />} size="sm" variant="ghost">
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2">
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
            <IconBrandGithub className="size-4" />
          </Button>
          <ThemeSwitcher />
          {isLoggedIn ? (
            <Button render={<Link to="/dashboard" />} size="sm" variant="default">
              Open App
            </Button>
          ) : (
            <Button render={<Link to="/signup" />} size="sm" variant="default">
              Start Free
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
