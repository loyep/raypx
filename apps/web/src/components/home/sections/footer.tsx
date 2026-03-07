import type { SiteConfig } from "@raypx/seo";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

type HomeFooterProps = {
  siteConfig: SiteConfig;
};

export function HomeFooter({ siteConfig }: HomeFooterProps) {
  return (
    <footer className="border-t px-4 py-6">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 text-muted-foreground text-sm sm:flex-row">
        <div className="flex items-center gap-2">
          <Logo alt={siteConfig.name} className="h-5 w-5" />
          <span>© {new Date().getFullYear()} Raypx. All rights reserved.</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/docs">Docs</a>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
          <a href={siteConfig.github} rel="noopener noreferrer" target="_blank">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
