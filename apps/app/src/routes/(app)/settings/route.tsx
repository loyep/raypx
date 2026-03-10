import { Button } from "@raypx/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { cn } from "@raypx/design-system/lib/utils";
import { IconArrowLeft, IconSparkles } from "@tabler/icons-react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navItems = [
    { label: "AI Providers", to: "/settings/ai-providers" as const, icon: IconSparkles },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage product-level AI configuration.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 pt-0">
            <Button className="justify-start gap-2" render={<Link to="/chat" />} variant="ghost">
              <IconArrowLeft className="size-4" />
              Back to chat
            </Button>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Button
                  className={cn("justify-start gap-2", active && "bg-accent")}
                  key={item.to}
                  render={<Link to={item.to} />}
                  variant="ghost"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
          </CardContent>
        </Card>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
