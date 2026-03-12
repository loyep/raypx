import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { IconArrowRight, IconCircleCheck, IconKey, IconQuote, IconWorld } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

const trustItems = ["Open source", "BYOK friendly", "Hosted plan available"] as const;
const stats = [
  { label: "Modes", value: "4" },
  { label: "Source models", value: "BYOK + Hosted" },
  { label: "Workspace surfaces", value: "Ask / Threads / Spaces / Library" },
] as const;

export function HomeHero() {
  return (
    <section className="relative overflow-hidden border-b px-4 py-20 sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,hsl(var(--primary)/0.18),transparent_45%),radial-gradient(circle_at_80%_0%,#22d3ee1f,transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.35)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.35)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:linear-gradient(to_bottom,white_10%,transparent_100%)]" />
        <div className="absolute top-14 -right-16 h-72 w-72 rounded-full bg-primary/18" />
      </div>

      <div className="container mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-7">
          <Badge
            className="border-primary/30 bg-primary/10 font-mono text-[11px] text-primary uppercase tracking-wide"
            variant="secondary"
          >
            Personal AI workspace
          </Badge>

          <div className="space-y-4">
            <h1 className="max-w-2xl font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
              Search, think, and build with an AI workspace that keeps your context.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Raypx is designed for people who want more than a chat box: ask questions, keep
              threads alive, organize work into spaces, and choose between your own keys or a
              hosted pool.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button render={<Link to="/signup" />} size="lg">
              Start in Web App
              <IconArrowRight className="ml-2 size-4" />
            </Button>
            <Button render={<Link to="/docs" />} size="lg" variant="outline">
              Read docs
            </Button>
          </div>

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 font-mono text-sm">
              <span className="text-muted-foreground">Ask -&gt; Thread -&gt; Space -&gt; Library</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {trustItems.map((item) => (
                <span
                  className="rounded-full border bg-background/80 px-3 py-1 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.12em]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid max-w-xl grid-cols-3 gap-2 pt-2">
            {stats.map((item) => (
              <div className="rounded-lg border bg-card/60 p-3" key={item.label}>
                <p className="font-semibold text-sm">{item.value}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <Card className="relative overflow-hidden border-primary/20 bg-card/90 shadow-xl">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,hsl(var(--primary)/0.08)_45%,transparent_70%)]" />
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/80 via-cyan-500/80 to-primary/80" />
          <CardHeader className="space-y-2 border-b bg-muted/40">
            <CardTitle className="text-base">Workspace Snapshot</CardTitle>
            <CardDescription>How the product is meant to feel from the first session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border bg-background p-3">
                <p className="text-muted-foreground text-xs">Ask</p>
                <p className="mt-1 font-semibold text-sm">Direct question entry with explicit modes</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-muted-foreground text-xs">Threads</p>
                <p className="mt-1 font-semibold text-sm">Longer reasoning without losing context</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-muted-foreground text-xs">Spaces</p>
                <p className="mt-1 font-semibold text-sm">Project-level context, defaults, and saved work</p>
              </div>
              <div className="rounded-lg border bg-background p-3">
                <p className="text-muted-foreground text-xs">Library</p>
                <p className="mt-1 font-semibold text-sm">Reusable links, files, notes, and outputs</p>
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium text-sm">Trust signals</span>
                <IconCircleCheck className="size-4 text-emerald-500" />
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between rounded border px-2 py-1.5">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <IconQuote className="size-3.5" />
                    Citations
                  </span>
                  <span className="font-medium text-emerald-600">visible</span>
                </div>
                <div className="flex items-center justify-between rounded border px-2 py-1.5">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <IconKey className="size-3.5" />
                    BYOK
                  </span>
                  <span className="font-medium text-emerald-600">first-class</span>
                </div>
                <div className="flex items-center justify-between rounded border px-2 py-1.5">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <IconWorld className="size-3.5" />
                    Hosted
                  </span>
                  <span className="font-medium text-emerald-600">optional</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
