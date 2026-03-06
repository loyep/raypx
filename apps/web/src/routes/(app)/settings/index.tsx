import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute, Link } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/settings/")({
  component: SettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "Settings - Raypx" }),
});

function SettingsPage() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Update your profile and manage access credentials.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription>Name, avatar and account details.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button render={<Link to="/settings/profile" />} size="sm" variant="secondary">
                Manage Profile
              </Button>
            </div>
          </Card>
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">API Keys</CardTitle>
              <CardDescription>Create and rotate keys for programmatic access.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button render={<Link to="/settings/api-keys" />} size="sm" variant="secondary">
                Manage Keys
              </Button>
            </div>
          </Card>
          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">AI Providers</CardTitle>
              <CardDescription>View provider status and default model selection.</CardDescription>
            </CardHeader>
            <div className="px-6 pb-6">
              <Button render={<Link to="/settings/ai-providers" />} size="sm" variant="secondary">
                Open Config
              </Button>
            </div>
          </Card>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Feature Status</CardTitle>
          <CardDescription>Current availability of settings capabilities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span>Profile details</span>
            <Badge variant="outline">Available</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>API key management</span>
            <Badge variant="outline">In progress</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Security preferences</span>
            <Badge variant="outline">Planned</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
