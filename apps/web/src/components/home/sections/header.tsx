import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { Button } from "@raypx/design-system/components/ui/button";
import type { SiteConfig } from "@raypx/seo";
import { IconBrandGithub } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { useSession } from "@/lib/auth";

type HomeHeaderProps = {
  siteConfig: SiteConfig;
};

export function HomeHeader({ siteConfig }: HomeHeaderProps) {
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/90">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link className="flex items-center gap-2" to="/">
          <Logo alt={siteConfig.name} />
          <span className="font-semibold">{siteConfig.name}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button render={<Link to="/docs" />} size="sm" variant="ghost">
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
            <IconBrandGithub className="size-4" />
          </Button>
          <ThemeSwitcher />
          {isLoggedIn ? (
            <Button render={<Link to="/dashboard" />} size="sm" variant="default">
              Dashboard
            </Button>
          ) : (
            <Button render={<Link to="/login" />} size="sm" variant="default">
              Sign in
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
