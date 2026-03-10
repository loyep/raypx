import { Avatar, AvatarFallback, AvatarImage } from "@raypx/design-system/components/ui/avatar";
import { Button } from "@raypx/design-system/components/ui/button";
import { cn } from "@raypx/design-system/lib/utils";
import { IconLogout, IconSettings, IconSparkles } from "@tabler/icons-react";
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
  const user = session.user;
  const initials = (user.name || user.email || "U").slice(0, 1).toUpperCase();
  const navItems = [
    { label: "Chat", to: "/chat" as const, icon: IconSparkles },
    { label: "AI Providers", to: "/settings/ai-providers" as const, icon: IconSettings },
  ];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-8 px-4 py-6 lg:px-6">
        <aside className="hidden w-72 shrink-0 rounded-3xl border bg-card/80 p-5 backdrop-blur lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <Logo className="size-10 rounded-xl text-xs" />
            <div>
              <p className="font-semibold text-sm">Raypx App</p>
              <p className="text-muted-foreground text-xs">Product workspace</p>
            </div>
          </div>

          <nav className="mt-8 grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
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
          </nav>

          <div className="mt-auto rounded-2xl border bg-background/80 p-3">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage alt={user.name ?? ""} src={user.image ?? undefined} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{user.name || "User"}</p>
                <p className="truncate text-muted-foreground text-xs">{user.email ?? ""}</p>
              </div>
            </div>
            <Button
              className="mt-3 w-full justify-start gap-2"
              onClick={async () => {
                await signOut();
              }}
              variant="outline"
            >
              <IconLogout className="size-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-6">
          <header className="flex items-center justify-between gap-3 rounded-2xl border bg-card/60 px-4 py-3 lg:hidden">
            <div className="flex items-center gap-3">
              <Logo className="size-9 rounded-xl text-xs" />
              <div>
                <p className="font-semibold text-sm">Raypx App</p>
                <p className="text-muted-foreground text-xs">Chat workspace</p>
              </div>
            </div>
            <Button onClick={async () => signOut()} size="sm" variant="outline">
              <IconLogout className="mr-2 size-4" />
              Sign out
            </Button>
          </header>
          <Outlet />
        </div>
      </div>
    </main>
  );
}
