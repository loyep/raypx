import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { IconBook2, IconFolders, IconMessages, IconSearch } from "@tabler/icons-react";

const scenarios = [
  {
    title: "Ask",
    description: "Start with a focused question and get grounded answers with source-aware output.",
    icon: IconSearch,
  },
  {
    title: "Threads",
    description:
      "Keep follow-up thinking inside a conversation instead of treating each prompt like a reset.",
    icon: IconMessages,
  },
  {
    title: "Spaces",
    description:
      "Organize long-lived projects with reusable defaults, files, notes, and saved context.",
    icon: IconFolders,
  },
  {
    title: "Library",
    description: "Collect the links, excerpts, and outputs you actually want to revisit later.",
    icon: IconBook2,
  },
] as const;

export function HomeScenarios() {
  return (
    <section className="border-y bg-muted/20 px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="max-w-3xl space-y-2">
          <p className="font-mono text-[11px] text-primary uppercase tracking-[0.16em]">
            Product shape
          </p>
          <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            Not another chat shell. A personal AI workspace that keeps context over time.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {scenarios.map((scenario) => (
            <Card className="border-border/80 bg-background/80" key={scenario.title}>
              <CardHeader className="space-y-3">
                <div className="inline-flex size-10 items-center justify-center rounded-2xl border bg-primary/10 text-primary">
                  <scenario.icon className="size-5" />
                </div>
                <CardTitle>{scenario.title}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 text-muted-foreground text-sm">
                Each surface exists to move work forward, not to expose more raw model controls.
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
