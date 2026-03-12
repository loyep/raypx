import { Badge } from "@raypx/design-system/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/settings/ai-providers")({
  component: AIProviderSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "AI Provider Settings - Raypx App" }),
});

function AIProviderSettingsPage() {
  const providersQuery = useQuery({
    queryKey: ["settings", "providers"],
    queryFn: async () => (await client.ai.providers.list({})).data.providers,
  });

  const providers = providersQuery.data ?? [];

  return (
    <WorkspacePage
      description="Provider access is split between your own API keys and the platform-hosted key pool. This page is where those capabilities stay user-controlled."
      kicker="Settings"
      title="AI Providers"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {providers.length === 0 ? (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>No providers configured yet</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground text-sm">
              Add your own provider key first, or subscribe to unlock the hosted pool later.
            </CardContent>
          </Card>
        ) : (
          providers.map(
            (provider: {
              id: string;
              name: string;
              isDefault: boolean;
              hasKey: boolean;
              driver: string;
              defaultModel: string;
              models: string[];
            }) => (
              <Card key={provider.id}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{provider.name}</CardTitle>
                    {provider.isDefault ? <Badge>Default</Badge> : null}
                    {provider.hasKey ? <Badge variant="outline">Key ready</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {provider.driver} · {provider.defaultModel}
                  </p>
                  <p className="text-muted-foreground">Models: {provider.models.join(", ")}</p>
                </CardContent>
              </Card>
            ),
          )
        )}
      </div>
    </WorkspacePage>
  );
}
