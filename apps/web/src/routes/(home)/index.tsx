import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  HomeCapabilities as Capabilities,
  HomeCta as Cta,
  HomeHero as Hero,
  MarketingShell,
  HomeModes as Modes,
  HomeScenarios as Scenarios,
} from "@/components/home";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(home)/")({
  component: HomePage,
  head: () => generatePageHead(siteConfig),
});

function HomePage() {
  return (
    <MarketingShell siteConfig={siteConfig}>
      <Hero />
      <Scenarios />
      <Capabilities />
      <Modes />
      <Cta siteConfig={siteConfig} />
    </MarketingShell>
  );
}
