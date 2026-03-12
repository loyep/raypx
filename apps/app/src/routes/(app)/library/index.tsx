import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { EmptyStateCard, WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/library/")({
  component: LibraryPage,
  head: () => generatePageHead({ ...siteConfig, title: "Library - Raypx App" }),
});

function LibraryPage() {
  const spacesQuery = useQuery({
    queryKey: ["workspace", "spaces"],
    queryFn: async () => (await client.workspace.spaces.list()).data.spaces,
  });

  const firstSpace = spacesQuery.data?.[0];
  const filesQuery = useQuery({
    queryKey: ["workspace", "space-files", firstSpace?.id],
    enabled: Boolean(firstSpace?.id),
    queryFn: async () =>
      (await client.workspace.spaceFiles.list({ spaceId: firstSpace?.id })).data.files,
  });

  const files = filesQuery.data ?? [];

  return (
    <WorkspacePage
      description="Library is where files, clipped links, and saved citations will converge. It depends on workspace and search domains instead of chat routes."
      kicker="Workspace"
      title="Library"
    >
      {files.length === 0 ? (
        <EmptyStateCard
          description="Once a space starts collecting files and saved links, they will surface here."
          title="No library items yet"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {files.map(
            (file: {
              id: string;
              title: string;
              filePath?: string | null;
              url?: string | null;
            }) => (
              <Card key={file.id}>
                <CardHeader>
                  <CardTitle className="text-base">{file.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground text-sm">
                  {file.filePath ?? file.url ?? "Resource path pending"}
                </CardContent>
              </Card>
            ),
          )}
        </div>
      )}
    </WorkspacePage>
  );
}
