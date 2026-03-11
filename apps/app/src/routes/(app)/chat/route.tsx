import { generatePageHead } from "@raypx/seo";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/chat")({
  component: ChatRouteLayout,
  head: () => generatePageHead({ ...siteConfig, title: "AI Chat - Raypx App" }),
});

function ChatRouteLayout() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <Outlet />
    </div>
  );
}
