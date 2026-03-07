import { Button } from "@raypx/design-system/components/ui/button";
import type { SiteConfig } from "@raypx/seo";
import { IconArrowRight, IconBrandGithub } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

type HomeCtaProps = {
  siteConfig: SiteConfig;
};

export function HomeCta({ siteConfig }: HomeCtaProps) {
  return (
    <section className="px-4 py-16 text-center sm:py-20">
      <div className="container mx-auto max-w-3xl space-y-5">
        <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
          Build your first production feature this week
        </h2>
        <p className="text-muted-foreground">
          Start with a fully configured stack, then replace modules only where your product needs
          customization.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link to="/signup" />} size="lg">
            Create Account
            <IconArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            render={<a href={siteConfig.github} rel="noopener noreferrer" target="_blank" />}
            size="lg"
            variant="outline"
          >
            <IconBrandGithub className="mr-2 size-4" />
            Explore GitHub
          </Button>
        </div>
      </div>
    </section>
  );
}
