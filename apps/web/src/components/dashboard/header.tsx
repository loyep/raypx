import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { Button } from "@raypx/design-system/components/ui/button";
import { IconList } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";
import { CommandPaletteTrigger } from "./command-palette";
import { UserButton } from "./user-button";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  initials: string;
  onSignOut: () => void;
  onMobileMenuOpen: () => void;
  onCommandPaletteOpen: () => void;
}

export function DashboardHeader({
  user,
  initials,
  onSignOut,
  onMobileMenuOpen,
  onCommandPaletteOpen,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Button */}
          <Button className="lg:hidden" onClick={onMobileMenuOpen} size="icon" variant="ghost">
            <IconList className="size-5" />
            <span className="sr-only">Open menu</span>
          </Button>

          {/* Mobile Logo */}
          <Link className="flex items-center gap-2 lg:hidden" to="/">
            <picture>
              <source media="(prefers-color-scheme: dark)" srcSet="/logo-dark.png" />
              <img alt="Raypx" className="h-6 w-6" src="/logo.png" />
            </picture>
            <span className="font-semibold">{siteConfig.name}</span>
          </Link>

          {/* Search/Command Palette Trigger (desktop) */}
          <CommandPaletteTrigger className="hidden lg:flex" onClick={onCommandPaletteOpen} />
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* User Menu */}
          <UserButton initials={initials} onSignOut={onSignOut} user={user} />
        </div>
      </div>
    </header>
  );
}
