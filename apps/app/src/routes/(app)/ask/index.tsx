import { Button } from "@raypx/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { Textarea } from "@raypx/design-system/components/ui/textarea";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { InsightCard, WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/ask/")({
  component: AskPage,
  head: () => generatePageHead({ ...siteConfig, title: "Ask - Raypx App" }),
});

function AskPage() {
  const capabilitiesQuery = useQuery({
    queryKey: ["ai", "capabilities"],
    queryFn: async () => (await client.ai.capabilities()).data,
  });
  const entitlementsQuery = useQuery({
    queryKey: ["billing", "entitlements"],
    queryFn: async () => (await client.billing.entitlements.get()).data,
  });
  const spacesQuery = useQuery({
    queryKey: ["workspace", "spaces"],
    queryFn: async () => (await client.workspace.spaces.list()).data.spaces,
  });

  const capabilities = capabilitiesQuery.data;
  const entitlements = entitlementsQuery.data;
  const spaces = spacesQuery.data ?? [];

  return (
    <WorkspacePage
      description="Ask is the top-level entry into the personal workspace. It resolves models, source modes, and workspace context before chat UI gets opinionated."
      kicker="Workspace"
      title="Ask"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          description="Search, research, writing, and summarization are explicit system modes."
          title="Workspace modes"
          value={capabilities?.workspaceModes.length ?? 0}
        />
        <InsightCard
          description="BYOK and hosted pool stay separate but discoverable."
          title="Source modes"
          value={entitlements?.sourceModes.join(" + ") ?? "byok"}
        />
        <InsightCard
          description="Spaces hold reusable files, prompts, and thread context."
          title="Active spaces"
          value={spaces.length}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prompt surface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            className="min-h-32"
            defaultValue="Research the latest design direction for a personal AI workspace and summarize it with citations."
          />
          <div className="flex flex-wrap gap-3">
            <Button disabled>Search mode wiring next</Button>
            <Button render={<Link to="/spaces" />} variant="outline">
              Open spaces
            </Button>
            <Button render={<Link to="/settings/ai-providers" />} variant="outline">
              Manage providers
            </Button>
          </div>
        </CardContent>
      </Card>
    </WorkspacePage>
  );
}
