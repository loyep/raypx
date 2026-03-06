import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/settings/api-keys")({
  component: SettingsApiKeysPage,
  head: () => generatePageHead({ ...siteConfig, title: "API Keys Settings - Raypx" }),
});

function SettingsApiKeysPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage personal API keys for scripts and integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">Key creation</span>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">Key rotation</span>
            <Badge variant="outline">Coming soon</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border px-3 py-2">
            <span className="text-muted-foreground">Usage logs</span>
            <Badge variant="outline">Coming soon</Badge>
          </div>
        </CardContent>
        <CardFooter className="justify-between gap-3">
          <p className="text-muted-foreground text-xs">
            Temporary: use the dashboard API key area while this page is being wired.
          </p>
          <Button render={<Link to="/dashboard" />} size="sm" variant="secondary">
            Back to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
