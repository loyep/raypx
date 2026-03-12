import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { IconCoin, IconLayersIntersect, IconShieldHalfFilled } from "@tabler/icons-react";

const capabilities = [
  {
    title: "Clear model access layers",
    description:
      "Keep personal providers separate from the hosted key pool so users always understand who pays and who controls routing.",
    icon: IconLayersIntersect,
  },
  {
    title: "Permissioned operator controls",
    description:
      "Admin pages manage key pool health, prompt policy layers, and usage without leaking operator complexity into the user workspace.",
    icon: IconShieldHalfFilled,
  },
  {
    title: "Usage and billing boundaries",
    description:
      "Entitlements make free, BYOK, and hosted plans feel like coherent product choices instead of hidden switches.",
    icon: IconCoin,
  },
] as const;

export function HomeCapabilities() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 space-y-2 text-center">
          <p className="font-mono text-[11px] text-primary uppercase tracking-[0.16em]">
            Why this shape matters
          </p>
          <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            The architecture is built so product, open source, and hosted SaaS can coexist.
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
