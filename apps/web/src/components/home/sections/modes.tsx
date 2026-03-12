import { Badge } from "@raypx/design-system/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";

const modes = [
  {
    eyebrow: "Bring your own key",
    title: "Keep full control over provider choice and spend.",
    description:
      "Connect your own OpenAI-compatible or first-party model providers and use the workspace without handing over routing or cost control.",
    points: ["Personal control", "Predictable cost", "Ideal for self-host and advanced users"],
  },
  {
    eyebrow: "Hosted plan",
    title: "Use the platform key pool when you want zero setup.",
    description:
      "Hosted mode trades infrastructure control for a smoother default experience, faster onboarding, and clearer limits inside the product.",
    points: ["No provider setup", "Managed quotas", "Upgrade path for daily use"],
  },
] as const;

export function HomeModes() {
  return (
    <section className="px-4 py-16 sm:py-20">
      <div className="container mx-auto max-w-6xl space-y-8">
        <div className="max-w-3xl space-y-2">
          <p className="font-mono text-[11px] text-primary uppercase tracking-[0.16em]">
            Choose your operating mode
          </p>
          <h2 className="font-semibold text-3xl tracking-tight sm:text-4xl">
            Start with your own key, upgrade for a hosted assistant when convenience matters.
          </h2>
          <p className="text-muted-foreground sm:text-lg">
            Raypx is designed so open source, self-hosting, BYOK, and hosted SaaS can coexist
            without feeling like separate products.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {modes.map((mode) => (
            <Card className="border-border/80 bg-card/70" key={mode.eyebrow}>
              <CardHeader className="space-y-3">
                <Badge className="w-fit" variant="outline">
                  {mode.eyebrow}
                </Badge>
                <CardTitle className="text-2xl leading-tight">{mode.title}</CardTitle>
                <CardDescription className="text-sm leading-6">{mode.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {mode.points.map((point) => (
                  <div className="rounded-lg border bg-background/80 px-3 py-2" key={point}>
                    {point}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
