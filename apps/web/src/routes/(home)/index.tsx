import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  HomeCapabilities as Capabilities,
  HomeCta as Cta,
  HomeFooter as Footer,
  HomeHeader as Header,
  HomeHero as Hero,
} from "@/components/home";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(home)/")({
  component: HomePage,
  head: () => generatePageHead(siteConfig),
});

function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header siteConfig={siteConfig} />

      <main id="main-content">
        <Hero />
        <Capabilities />
        <Cta siteConfig={siteConfig} />
        <Footer siteConfig={siteConfig} />
      </main>
    </div>
  );
}
