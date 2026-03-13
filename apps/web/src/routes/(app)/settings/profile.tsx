import { useSession } from "@raypx/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@raypx/design-system/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/settings/profile")({
  component: SettingsProfilePage,
  head: () => generatePageHead({ ...siteConfig, title: "Profile Settings - Raypx" }),
});

function SettingsProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = (user?.name || user?.email || "U")?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Basic account information associated with your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage alt={user?.name ?? ""} src={user?.image ?? undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-muted-foreground text-sm">{user?.email ?? "No email available"}</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Display name</Label>
              <Input id="profile-name" readOnly value={user?.name ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input id="profile-email" readOnly value={user?.email ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-role">Role</Label>
              <Input id="profile-role" readOnly value={user?.role ?? "user"} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-id">User ID</Label>
              <Input id="profile-id" readOnly value={user?.id ?? ""} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground text-xs">
            Profile edit actions will be connected to auth update APIs in a later iteration.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
