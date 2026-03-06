import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "~/config/site";

export const Route = createFileRoute("/_home")({
  component: HomePage,
  head: () => generatePageHead(siteConfig),
});

function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center" id="main-content">
      <h1 className="font-bold text-4xl">Welcome</h1>
      <p className="mt-4 text-muted-foreground">Start building your application here.</p>
    </main>
  );
}
