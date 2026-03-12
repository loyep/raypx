import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { InsightCard, WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/settings/billing")({
  component: BillingSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "Billing - Raypx App" }),
});

function BillingSettingsPage() {
  const plansQuery = useQuery({
    queryKey: ["billing", "plans"],
    queryFn: async () => (await client.billing.plans.list()).data.plans,
  });
  const usageQuery = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: async () => (await client.billing.usage.get()).data,
  });
  const entitlementsQuery = useQuery({
    queryKey: ["billing", "entitlements"],
    queryFn: async () => (await client.billing.entitlements.get()).data,
  });

  const plans = plansQuery.data ?? [];
  const usage = usageQuery.data;
  const entitlements = entitlementsQuery.data;

  return (
    <WorkspacePage
      description="Billing decides whether the user stays fully BYOK or can seamlessly move onto the hosted key pool. It also owns workspace quotas."
      kicker="Settings"
      title="Billing & Entitlements"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          description="Resolved from your active subscription state."
          title="Current plan"
          value={entitlements?.planId ?? "free"}
        />
        <InsightCard
          description="Which provider sources the workspace can use right now."
          title="Source modes"
          value={entitlements?.sourceModes.join(" + ") ?? "byok"}
        />
        <InsightCard
          description="Usage rolls up separately from chat UI."
          title="Calls this period"
          value={usage?.calls ?? 0}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Plan catalog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {plans.map(
              (plan: { id: string; name: string; priceMonthlyUsd: number; features: string[] }) => (
                <div className="rounded-xl border p-4" key={plan.id}>
                  <p className="font-medium">
                    {plan.name} · ${plan.priceMonthlyUsd}/mo
                  </p>
                  <p className="mt-1 text-muted-foreground">{plan.features.join(" · ")}</p>
                </div>
              ),
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Current period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Total tokens: {usage?.totalTokens ?? 0}</p>
            <p>Total cost: {(usage?.totalCostUsdCents ?? 0) / 100} USD</p>
            <p>Search quota: {entitlements?.searchQuotaMonthly ?? 0}</p>
            <p>File quota: {entitlements?.fileQuotaMonthly ?? 0}</p>
          </CardContent>
        </Card>
      </div>
    </WorkspacePage>
  );
}
