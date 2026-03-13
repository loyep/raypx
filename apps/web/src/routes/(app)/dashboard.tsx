import type { ExtendedUser } from "@raypx/auth";
import { authClient } from "@raypx/auth";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { generatePageHead } from "@raypx/seo";
import { IconBolt, IconSettings, IconUser } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { CreateWorkspaceDialog } from "@/components/dashboard/workspace";
import { siteConfig } from "@/config/site";
import { client } from "@/utils/orpc";

const ActivityChart = lazy(() =>
  import("@/components/dashboard/activity-chart").then((mod) => ({
    default: mod.ActivityChart,
  })),
);

export const Route = createFileRoute("/(app)/dashboard")({
  component: DashboardPage,
  head: () => generatePageHead({ ...siteConfig, title: "Dashboard - Raypx" }),
});

function DashboardPage() {
  const { session } = useLoaderData({ from: "/(app)" });
  const { data: organizations, isPending: orgsLoading } = authClient.useListOrganizations();
  const hasNoWorkspace = !orgsLoading && (!organizations || organizations.length === 0);

  // Fetch dashboard data
  const { data: stats } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => client.dashboard.stats(),
  });

  const { data: activity } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => client.dashboard.activity(),
  });

  const user = session.user;
  const extendedUser = user as ExtendedUser;

  // Format storage size
  const formatStorage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (hasNoWorkspace) {
    return <CreateWorkspaceDialog isFirst open />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Welcome back, {user.name || "User"}!</h1>
        <p className="text-muted-foreground">Here's an overview of your workspace</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">API Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats?.apiKeys ?? 0}</div>
            <p className="text-muted-foreground text-xs">Active keys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{stats?.sessionsThisMonth ?? 0}</div>
            <p className="text-muted-foreground text-xs">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Storage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{formatStorage(stats?.storage?.used ?? 0)}</div>
            <p className="text-muted-foreground text-xs">Used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="font-medium text-sm">Role</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl capitalize">{extendedUser.role ?? "User"}</div>
            <p className="text-muted-foreground text-xs">Account type</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Activity</CardTitle>
          <CardDescription>Your sessions over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="h-[320px] animate-pulse rounded-md bg-muted/60" />}>
            <ActivityChart data={activity ?? []} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Get started with common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/settings/profile">
              <Button className="h-auto w-full justify-start gap-3 p-4" variant="outline">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconUser className="size-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Edit Profile</p>
                  <p className="text-muted-foreground text-xs">Update your info</p>
                </div>
              </Button>
            </Link>
            <Link to="/settings">
              <Button className="h-auto w-full justify-start gap-3 p-4" variant="outline">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconSettings className="size-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Settings</p>
                  <p className="text-muted-foreground text-xs">Configure account</p>
                </div>
              </Button>
            </Link>
            <Link to="/settings/api-keys">
              <Button className="h-auto w-full justify-start gap-3 p-4" variant="outline">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <IconBolt className="size-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium">API Keys</p>
                  <p className="text-muted-foreground text-xs">Manage keys</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
          <CardDescription>Follow these steps to set up your workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                1
              </div>
              <h3 className="font-semibold">Explore the Docs</h3>
              <p className="text-muted-foreground text-sm">
                Learn about the features and capabilities.
              </p>
              <a
                className="inline-flex text-primary text-sm underline-offset-4 hover:underline"
                href="/docs"
              >
                View Documentation →
              </a>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                2
              </div>
              <h3 className="font-semibold">Set Up Your Profile</h3>
              <p className="text-muted-foreground text-sm">
                Customize your account settings and preferences.
              </p>
              <Button className="h-auto p-0 text-sm" variant="link">
                Edit Profile →
              </Button>
            </div>
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                3
              </div>
              <h3 className="font-semibold">Start Building</h3>
              <p className="text-muted-foreground text-sm">
                Create your first project and start building.
              </p>
              <Button className="h-auto p-0 text-sm" variant="link">
                Create Project →
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
