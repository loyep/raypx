import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { generatePageHead } from "@raypx/seo";
import { IconArrowRight, IconBrandGithub, IconServer } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/home";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(home)/open-source")({
  component: OpenSourcePage,
  head: () => generatePageHead({ ...siteConfig, title: "Open Source - Raypx" }),
});

function OpenSourcePage() {
  return (
    <MarketingShell siteConfig={siteConfig}>
      <section className="px-4 py-20 sm:py-24">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline">Open source</Badge>
            <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
              Open source is a product mode, not an afterthought.
            </h1>
            <p className="text-muted-foreground sm:text-lg">
              Raypx is being shaped so hosted SaaS and self-hosted deployment share the same domain
              model. That keeps the product honest and makes extensions easier to reason about.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>What stays aligned</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Ask, Threads, Spaces, and Library remain the same concepts across OSS and hosted.</p>
                <p>BYOK is first-class instead of being hidden behind paywalls.</p>
                <p>Hosted plans add convenience and operator support, not a completely different product.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>What can differ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Hosted key pool and operator tooling are naturally richer in the official SaaS.</p>
                <p>Self-hosting lets teams own provider, data, and deployment boundaries outright.</p>
                <p>Desktop will sit on top of the same domain model rather than fork it.</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconServer className="size-5 text-primary" />
                Start where you are
              </CardTitle>
              <CardDescription>
                Use the web app, self-host the stack, or inspect the repo before deciding.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                render={<a href={siteConfig.github} rel="noreferrer" target="_blank" />}
              >
                <IconBrandGithub className="mr-2 size-4" />
                View repository
              </Button>
              <Button render={<Link to="/docs" />} variant="outline">
                Read docs
              </Button>
              <Button render={<Link to="/signup" />} variant="outline">
                Try hosted app
                <IconArrowRight className="ml-2 size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}
