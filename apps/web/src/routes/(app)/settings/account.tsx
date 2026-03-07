import { getServerSession } from "@raypx/auth/server";
import { db, eq } from "@raypx/database";
import { account } from "@raypx/database/schemas";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@raypx/design-system/components/ui/alert-dialog";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { generatePageHead } from "@raypx/seo";
import { IconEye, IconEyeOff, IconTrash } from "@tabler/icons-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { authClient, signOut } from "@/lib/auth";

const checkHasPassword = createServerFn({ method: "GET" }).handler(async () => {
  const headers = getRequestHeaders();
  const session = await getServerSession(headers);
  if (!session?.user?.id) return false;
  const accounts = await db
    .select({ providerId: account.providerId })
    .from(account)
    .where(eq(account.userId, session.user.id));
  return accounts.some((a) => a.providerId === "credential");
});

export const Route = createFileRoute("/(app)/settings/account")({
  component: SettingsAccountPage,
  head: () => generatePageHead({ ...siteConfig, title: "Account - Raypx" }),
  loader: async () => {
    const hasPassword = await checkHasPassword();
    return { hasPassword };
  },
});

function SettingsAccountPage() {
  const navigate = useNavigate();
  const { hasPassword } = Route.useLoaderData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      setPassword("");
      setShowPassword(false);
      setError(null);
    }
  }

  async function handleDeleteAccount() {
    if (hasPassword && !password.trim()) {
      setError("Please enter your password to confirm");
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      const { error: err } = await authClient.deleteUser({
        callbackURL: "/",
        ...(hasPassword && { password: password.trim() }),
      });
      if (err) {
        setError(err.message ?? "Failed to delete account");
        return;
      }
      await signOut();
      navigate({ to: "/" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Delete account</CardTitle>
          <CardDescription>
            Permanently delete your account and all associated data. This action cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground text-sm">
            After deletion, your personal information and workspace data will be removed.
          </p>
          <AlertDialog onOpenChange={handleDialogOpenChange} open={dialogOpen}>
            <Button
              className="text-destructive"
              disabled={isDeleting}
              onClick={() => setDialogOpen(true)}
              variant="outline"
            >
              <IconTrash className="mr-2 size-4" />
              {isDeleting ? "Processing..." : "Delete account"}
            </Button>
            <AlertDialogContent className="max-w-md">
              {error && <p className="text-destructive text-sm">{error}</p>}
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm account deletion?</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasPassword
                    ? "This will permanently delete your account and all data. Enter your password to confirm."
                    : "This will permanently delete your account and all data. This cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {hasPassword && (
                <div className="space-y-2 py-2">
                  <Label htmlFor="delete-password">Password</Label>
                  <div className="relative">
                    <Input
                      autoComplete="current-password"
                      className="h-11 pr-10"
                      id="delete-password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      type="button"
                    >
                      {showPassword ? (
                        <IconEyeOff className="size-4" />
                      ) : (
                        <IconEye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <Button
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting || (hasPassword && !password.trim())}
                  onClick={handleDeleteAccount}
                >
                  {isDeleting ? "Processing..." : "Confirm deletion"}
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
