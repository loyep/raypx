import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { IconLock, IconSparkles, IconStack } from "@tabler/icons-react";

const capabilities = [
  {
    title: "Type-safe API",
    description: "oRPC keeps request and response types aligned from server to UI.",
    icon: IconSparkles,
  },
  {
    title: "Auth out of the box",
    description: "Better Auth with session handling and extensible provider workflows.",
    icon: IconLock,
  },
  {
    title: "Monorepo ready",
    description: "Turborepo package boundaries and shared tooling for teams.",
    icon: IconStack,
  },
] as const;

export function HomeCapabilities() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-mono text-[11px] text-primary uppercase tracking-[0.16em]">
            Core capabilities
          </p>
          <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            Everything needed for the first production release
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {capabilities.map((capability) => (
            <Card className="border-border/80 bg-card/70" key={capability.title}>
              <CardHeader>
                <div className="mb-2 inline-flex size-10 items-center justify-center rounded-lg border bg-gradient-to-br from-primary/20 to-cyan-500/10 text-primary">
                  <capability.icon className="size-5" />
                </div>
                <CardTitle>{capability.title}</CardTitle>
                <CardDescription>{capability.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
