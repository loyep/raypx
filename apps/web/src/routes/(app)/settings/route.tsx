import { Button } from "@raypx/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { cn } from "@raypx/design-system/lib/utils";
import { IconLock, IconSettings, IconSparkles, IconUser } from "@tabler/icons-react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  const navItems = [
    { label: "General", to: "/settings" as const, icon: IconSettings },
    { label: "Profile", to: "/settings/profile" as const, icon: IconUser },
    { label: "API Keys", to: "/settings/api-keys" as const, icon: IconLock },
    { label: "AI Providers", to: "/settings/ai-providers" as const, icon: IconSparkles },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <div className="space-y-1">
        <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account preferences and personal information.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <Card className="h-fit">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 pt-0">
            {navItems.map((item) => {
              const active =
                item.to === "/settings"
                  ? pathname === "/settings" || pathname === "/settings/"
                  : pathname === item.to;
              const Icon = item.icon;

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
