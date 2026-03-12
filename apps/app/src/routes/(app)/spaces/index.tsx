import { Badge } from "@raypx/design-system/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyStateCard, WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/spaces/")({
  component: SpacesPage,
  head: () => generatePageHead({ ...siteConfig, title: "Spaces - Raypx App" }),
});

function SpacesPage() {
  const spacesQuery = useQuery({
    queryKey: ["workspace", "spaces"],
    queryFn: async () => (await client.workspace.spaces.list()).data.spaces,
  });

  const spaces = spacesQuery.data ?? [];

  return (
    <WorkspacePage
      description="Spaces are the long-lived context layer above threads: default models, prompt profiles, files, and saved links all belong here."
      kicker="Workspace"
      title="Spaces"
    >
      {spaces.length === 0 ? (
        <EmptyStateCard
          description="The schema and RPC domain are in place. Next up is creating spaces directly from the UI."
          title="No spaces yet"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {spaces.map(
            (space: {
              id: string;
              title: string;
              isArchived: boolean;
              description?: string | null;
              defaultProviderId?: string | null;
            }) => (
              <Card key={space.id}>
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{space.title}</CardTitle>
                    {space.isArchived ? <Badge variant="outline">Archived</Badge> : null}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {space.description ?? "No description yet."}
                  </p>
                  <p className="text-muted-foreground">
                    Provider: {space.defaultProviderId ?? "Follow personal default"}
                  </p>
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
