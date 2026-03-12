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
import { IconArrowRight, IconDeviceDesktop, IconKeyboard, IconPaperclip } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/home";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(home)/download")({
  component: DownloadPage,
  head: () => generatePageHead({ ...siteConfig, title: "Download - Raypx" }),
});

function DownloadPage() {
  return (
    <MarketingShell siteConfig={siteConfig}>
      <section className="px-4 py-20 sm:py-24">
        <div className="container mx-auto max-w-6xl space-y-10">
          <div className="max-w-3xl space-y-3">
            <Badge variant="outline">Desktop roadmap</Badge>
            <h1 className="font-semibold text-4xl tracking-tight sm:text-5xl">
              The desktop app is planned as a faster surface, not a different product.
            </h1>
            <p className="text-muted-foreground sm:text-lg">
              Raypx desktop will reuse the same Ask, Threads, Spaces, and Library model. The goal is
              quicker access, better capture, and a more ambient assistant workflow.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <PreviewCard
              icon={IconKeyboard}
              title="Global ask"
              description="Trigger Ask from anywhere and drop results back into the same workspace."
            />
            <PreviewCard
              icon={IconPaperclip}
              title="Save to Space"
              description="Clip text, links, and notes into the right project without re-opening a browser tab."
            />
            <PreviewCard
              icon={IconDeviceDesktop}
              title="Always-available entry"
              description="Keep the assistant close by without making desktop its own business model."
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Until desktop ships</CardTitle>
              <CardDescription>
                Use the web app today and keep an eye on the release stream.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button render={<Link to="/signup" />}>
                Start in Web App
                <IconArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                render={<a href={siteConfig.github} rel="noreferrer" target="_blank" />}
                variant="outline"
              >
                Watch releases on GitHub
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingShell>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof IconKeyboard;
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="inline-flex size-10 items-center justify-center rounded-2xl border bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
