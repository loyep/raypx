import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import { cn } from "@raypx/design-system/lib/utils";
import {
  IconBook2,
  IconFolders,
  IconLogout,
  IconMessages,
  IconSearch,
  IconSettings,
  IconShield,
} from "@tabler/icons-react";
import { createFileRoute, Link, Outlet, redirect, useRouterState } from "@tanstack/react-router";
import { Logo } from "@/components/logo";
import { RouteLoading } from "@/components/route-loading";
import { signOut } from "@/lib/auth";
import { getSession } from "@/lib/auth-server";

export const Route = createFileRoute("/(app)")({
  component: AppLayout,
  loader: async () => {
    const session = await getSession();
    if (!session?.session || !session.user) {
      throw redirect({ to: "/login" });
    }
    return { session };
  },
  pendingComponent: RouteLoading,
  pendingMs: 0,
});

function AppLayout() {
  const { session } = Route.useLoaderData();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const navItems = [
    { label: "Ask", to: "/ask" as const, icon: IconSearch, activePrefix: "/ask" },
    { label: "Threads", to: "/threads" as const, icon: IconMessages, activePrefix: "/threads" },
    { label: "Spaces", to: "/spaces" as const, icon: IconFolders, activePrefix: "/spaces" },
    { label: "Library", to: "/library" as const, icon: IconBook2, activePrefix: "/library" },
    {
      label: "Settings",
      to: "/settings/ai-providers" as const,
      icon: IconSettings,
      activePrefix: "/settings",
    },
  ];
  const adminItems =
    session.user.role === "admin" || session.user.role === "superadmin"
      ? [
          {
            label: "Admin",
            to: "/admin/$slug" as const,
            params: { slug: "users" },
            icon: IconShield,
            activePrefix: "/admin",
          },
        ]
      : [];
  const allNavItems = [...navItems, ...adminItems];

  return (
    <main className="min-h-screen bg-muted/20">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-4 sm:px-6 sm:py-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-border/70 bg-background px-4 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="size-10 rounded-xl text-xs shadow-none" />
            <div>
              <p className="font-semibold text-sm">Raypx App</p>
              <p className="text-muted-foreground text-xs">
                Signed in as {session.user.email ?? session.user.name ?? "user"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Personal AI Workspace</Badge>
            {session.user.role === "admin" || session.user.role === "superadmin" ? (
              <Badge>Operator</Badge>
            ) : null}
          </div>
          <nav className="flex flex-wrap gap-2">
            {allNavItems.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.activePrefix || pathname.startsWith(`${item.activePrefix}/`);
              return (
                <Button
                  className={cn("justify-start gap-2", active && "bg-accent")}
                  key={`${item.label}-${item.activePrefix}`}
                  render={
                    <Link
                      params={("params" in item ? item.params : undefined) as never}
                      to={item.to as never}
                    />
                  }
                  variant="ghost"
                >
                  <Icon className="size-4" />
                  {item.label}
                </Button>
              );
            })}
            <Button
              className="gap-2"
              onClick={async () => {
                await signOut();
              }}
              variant="outline"
            >
              <IconLogout className="size-4" />
              Sign out
            </Button>
          </nav>
        </header>
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
