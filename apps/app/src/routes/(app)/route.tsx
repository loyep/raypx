import { signOut } from "@raypx/auth/client";
import { getSession } from "@raypx/auth/tanstack-start";
import { RouteLoading } from "@raypx/design-system/components/route-loading";
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
    <main className="min-h-screen bg-[#f5f5f3] text-foreground">
      <div className="mx-auto min-h-screen max-w-[1600px] px-3 py-3 sm:px-4 sm:py-4">
        <aside
          className="space-y-4 lg:fixed lg:z-10 lg:w-[220px]"
          style={{
            left: "max(0.75rem, calc(50% - 50rem + 0.75rem))",
            top: "0.75rem",
          }}
        >
          <div className="border-border/60 bg-transparent p-2 lg:max-h-[calc(100vh-1.5rem)] lg:overflow-y-auto">
            <div className="flex items-center gap-3 px-2 py-1">
              <Logo className="size-8 rounded-lg text-[10px] shadow-none" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-sm">{session.user.name ?? "Raypx"}</p>
                <p className="truncate text-muted-foreground text-xs">Personal workspace</p>
              </div>
            </div>

            <div className="mt-5 px-2">
              <p className="text-muted-foreground text-xs">Signed in as</p>
              <p className="truncate text-sm">
                {session.user.email ?? session.user.name ?? "user"}
              </p>
            </div>

            <nav className="mt-6 space-y-1">
              {allNavItems.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.activePrefix || pathname.startsWith(`${item.activePrefix}/`);
                return (
                  <Button
                    className={cn(
                      "h-10 w-full justify-start gap-2 rounded-xl px-3 text-sm",
                      active
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
                    )}
                    key={`${item.label}-${item.activePrefix}`}
                    render={
                      <Link
                        params={("params" in item ? item.params : undefined) as never}
                        to={item.to as never}
                      />
                    }
                    variant="ghost"
                  >
                    <Icon className="size-4 shrink-0" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>

            <div className="mt-6 flex flex-wrap gap-2 px-2">
              <Badge className="rounded-full px-2.5 py-0.5" variant="outline">
                {session.user.role}
              </Badge>
              {session.user.role === "admin" || session.user.role === "superadmin" ? (
                <Badge className="rounded-full px-2.5 py-0.5">Operator</Badge>
              ) : null}
            </div>

            <Button
              className="mt-6 h-10 w-full justify-start gap-2 rounded-xl px-3"
              onClick={async () => {
                await signOut();
              }}
              variant="ghost"
            >
              <IconLogout className="size-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 lg:pl-[236px]">
          <section className="min-h-[calc(100vh-1.5rem)] rounded-[22px] border border-border/70 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <header className="border-border/60 border-b px-5 py-4 sm:px-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-semibold text-base">Raypx App</p>
                  <p className="text-muted-foreground text-sm">
                    Your personal AI workspace for asking, organizing, and returning to work.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full px-2.5 py-0.5" variant="outline">
                    Personal AI Workspace
                  </Badge>
                </div>
              </div>
            </header>

            <div className="px-5 py-6 sm:px-7">
              <Outlet />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
