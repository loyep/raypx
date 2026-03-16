import { getDashboardNavigationItems } from "@raypx/admin/server";
import { signOut } from "@raypx/auth/client";
import { getSession } from "@raypx/auth/tanstack-start";
import { RouteLoading } from "@raypx/design-system/components/route-loading";
import {
  createFileRoute,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useState } from "react";
import {
  CommandPalette,
  DashboardHeader,
  DashboardSidebar,
  MobileSidebar,
} from "@/components/dashboard";

export const Route = createFileRoute("/(app)")({
  component: AppLayout,
  pendingComponent: RouteLoading,
  loader: async () => {
    const session = await getSession();
    if (!session?.session) {
      throw redirect({ to: "/login" });
    }
    return {
      session,
      activeOrganizationId: session.session?.activeOrganizationId ?? null,
      navigationItems: getDashboardNavigationItems(session.user.role),
    };
  },
  pendingMs: 0,
});

function AppLayout() {
  const { session, activeOrganizationId, navigationItems } = Route.useLoaderData();
  const navigate = useNavigate();
  const activeNavKey = useRouterState({
    select: (state) => {
      const reversedMatches = [...state.matches].reverse();
      for (const match of reversedMatches) {
        const candidate = (match.staticData as { activeNavKey?: unknown } | undefined)
          ?.activeNavKey;
        if (typeof candidate === "string") {
          return candidate;
        }
      }
      return null;
    },
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const user = session.user;
  const initials = (user.name || user.email || "U")?.[0]?.toUpperCase() ?? "U";

  async function handleSignOut() {
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        activeNavKey={activeNavKey}
        activeOrganizationId={activeOrganizationId}
        initials={initials}
        navigationItems={navigationItems}
        onSignOut={handleSignOut}
        user={user}
      />
      <MobileSidebar
        activeNavKey={activeNavKey}
        activeOrganizationId={activeOrganizationId}
        initials={initials}
        navigationItems={navigationItems}
        onOpenChange={setMobileMenuOpen}
        onSignOut={handleSignOut}
        open={mobileMenuOpen}
        user={user}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader
          initials={initials}
          onCommandPaletteOpen={() => setCommandPaletteOpen(true)}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          onSignOut={handleSignOut}
          user={user}
        />
        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <CommandPalette onOpenChange={setCommandPaletteOpen} open={commandPaletteOpen} />
    </div>
  );
}
