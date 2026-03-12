import { Button } from "@raypx/design-system/components/ui/button";
import { cn } from "@raypx/design-system/lib/utils";
import { IconArrowLeft, IconCreditCard, IconSparkles } from "@tabler/icons-react";
import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";

export const Route = createFileRoute("/(app)/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navItems = [
    { label: "AI Providers", to: "/settings/ai-providers" as const, icon: IconSparkles },
    { label: "Billing", to: "/settings/billing" as const, icon: IconCreditCard },
  ];

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="space-y-1 px-1">
          <h1 className="font-semibold text-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure providers, billing, and the workspace defaults that power Raypx.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-3">
          <Button
            className="mb-2 w-full justify-start gap-2"
            render={<Link to="/ask" />}
            variant="outline"
          >
            <IconArrowLeft className="size-4" />
            Back to workspace
          </Button>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;

              return (
                <Button
                  className={cn(
                    "w-full justify-start gap-2",
                    active && "bg-accent text-accent-foreground",
                  )}
                  key={item.to}
                  render={<Link to={item.to} />}
                  variant="ghost"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
