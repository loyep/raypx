import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";
import { getSession } from "@/lib/auth-server";

const allowedSlugs = [
  "users",
  "key-pool",
  "prompt-policies",
  "usage-overview",
  "ai-providers",
] as const;

export const Route = createFileRoute("/(app)/admin/$slug")({
  component: AdminPage,
  head: () => generatePageHead({ ...siteConfig, title: "Admin - Raypx App" }),
  loader: async ({ params }) => {
    const session = await getSession();
    if (!session?.session || !session.user) {
      throw redirect({ to: "/login" });
    }
    if (session.user.role !== "admin" && session.user.role !== "superadmin") {
      throw redirect({ to: "/ask" });
    }
    if (!allowedSlugs.includes(params.slug as (typeof allowedSlugs)[number])) {
      throw redirect({ to: "/admin/$slug", params: { slug: "users" } });
    }
    return { session };
  },
});

function AdminPage() {
  const { slug } = Route.useParams();
  const usersStatsQuery = useQuery({
    queryKey: ["admin", "users", "stats"],
    enabled: slug === "users",
    queryFn: async () => (await client.admin.users.stats()).data,
  });
  const keyPoolQuery = useQuery({
    queryKey: ["admin", "key-pool"],
    enabled: slug === "key-pool",
    queryFn: async () => (await client.admin.keyPool.summary()).data,
  });
  const promptPoliciesQuery = useQuery({
    queryKey: ["admin", "prompt-policies"],
    enabled: slug === "prompt-policies",
    queryFn: async () => (await client.admin.promptPolicies.summary()).data,
  });
  const usageOverviewQuery = useQuery({
    queryKey: ["admin", "usage-overview"],
    enabled: slug === "usage-overview",
    queryFn: async () => (await client.admin.usageOverview.summary()).data,
  });
  const providersQuery = useQuery({
    queryKey: ["admin", "ai-providers"],
    enabled: slug === "ai-providers",
    queryFn: async () => (await client.ai.systemProviders.list({})).data.providers,
  });

  const content = (
    {
      users: {
        title: "Users",
        description: "Account moderation and role management stay in the operator admin domain.",
        body: usersStatsQuery.data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Metric title="Total" value={usersStatsQuery.data.total} />
            <Metric title="Admins" value={usersStatsQuery.data.admins} />
            <Metric title="Banned" value={usersStatsQuery.data.banned} />
            <Metric title="Verified" value={usersStatsQuery.data.verified} />
          </div>
        ) : null,
      },
      "key-pool": {
        title: "Key Pool",
        description: "Hosted provider health stays separate from user BYOK configuration.",
        body: keyPoolQuery.data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Metric title="Providers" value={keyPoolQuery.data.totalProviders} />
            <Metric title="Configured keys" value={keyPoolQuery.data.configuredKeys} />
            <Metric title="Enabled" value={keyPoolQuery.data.enabledProviders} />
            <Metric title="Default" value={keyPoolQuery.data.defaultProviderName ?? "-"} />
          </div>
        ) : null,
      },
      "prompt-policies": {
        title: "Prompt Policies",
        description: "System, mode, space, and user prompt layers are now explicit admin surfaces.",
        body: promptPoliciesQuery.data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Metric title="Total profiles" value={promptPoliciesQuery.data.totalProfiles} />
            <Metric title="System" value={promptPoliciesQuery.data.systemProfiles} />
            <Metric title="Mode" value={promptPoliciesQuery.data.modeProfiles} />
            <Metric title="Space" value={promptPoliciesQuery.data.spaceProfiles} />
          </div>
        ) : null,
      },
      "usage-overview": {
        title: "Usage Overview",
        description:
          "Spend, tokens, and active subscriptions are aggregated here instead of on product pages.",
        body: usageOverviewQuery.data ? (
          <div className="grid gap-4 md:grid-cols-4">
            <Metric title="Calls" value={usageOverviewQuery.data.totalCalls} />
            <Metric title="Tokens" value={usageOverviewQuery.data.totalTokens} />
            <Metric title="Cost (cents)" value={usageOverviewQuery.data.totalCostUsdCents} />
            <Metric title="Active subs" value={usageOverviewQuery.data.activeSubscriptions} />
          </div>
        ) : null,
      },
      "ai-providers": {
        title: "AI Providers",
        description:
          "System provider records remain part of AI runtime admin, even though users experience them through Ask and Settings.",
        body: (
          <div className="grid gap-4 md:grid-cols-2">
            {(providersQuery.data ?? []).map(
              (provider: { id: string; name: string; driver: string; defaultModel: string }) => (
                <Card key={provider.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    {provider.driver} · {provider.defaultModel}
                  </CardContent>
                </Card>
              ),
            )}
          </div>
        ),
      },
    } as const
  )[slug] ?? {
    title: "Admin",
    description: "Operator tooling for the hosted workspace.",
    body: null,
  };

  return (
    <WorkspacePage description={content.description} kicker="Admin" title={content.title}>
      {content.body}
    </WorkspacePage>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="font-semibold text-2xl tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
