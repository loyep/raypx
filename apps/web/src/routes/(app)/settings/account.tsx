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
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@raypx/design-system/components/ui/field";
import { Input } from "@raypx/design-system/components/ui/input";
import { generatePageHead } from "@raypx/seo";
import { IconEye, IconEyeOff, IconTrash } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
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
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      password: "",
    },
    onSubmit: async ({ value }) => {
      const password = value.password.trim();
      if (hasPassword && !password) {
        setSubmitError("Please enter your password to confirm");
        return;
      }

      setSubmitError(null);
      try {
        const { error } = await authClient.deleteUser({
          callbackURL: "/",
          ...(hasPassword ? { password } : {}),
        });
        if (error) {
          setSubmitError(error.message ?? "Failed to delete account");
          return;
        }
        await signOut();
        navigate({ to: "/" });
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    },
  });

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    if (!open) {
      form.reset();
      setShowPassword(false);
      setSubmitError(null);
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
              disabled={form.state.isSubmitting}
              onClick={() => setDialogOpen(true)}
              variant="outline"
            >
              <IconTrash className="mr-2 size-4" />
              {form.state.isSubmitting ? "Processing..." : "Delete account"}
            </Button>
            <AlertDialogContent className="max-w-md">
              {submitError ? <p className="text-destructive text-sm">{submitError}</p> : null}
              <AlertDialogHeader>
                <AlertDialogTitle>Confirm account deletion?</AlertDialogTitle>
                <AlertDialogDescription>
                  {hasPassword
                    ? "This will permanently delete your account and all data. Enter your password to confirm."
                    : "This will permanently delete your account and all data. This cannot be undone."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {hasPassword && (
                <form.Field
                  name="password"
                  validators={{
                    onSubmit: ({ value }) =>
                      value.trim() ? undefined : "Please enter your password to confirm",
                  }}
                >
                  {(field) => {
                    const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                    const errors = field.state.meta.errors
                      .map((error) => (typeof error === "string" ? { message: error } : undefined))
                      .filter(Boolean);

                    return (
                      <Field className="py-2" data-invalid={isInvalid}>
                        <FieldLabel htmlFor="delete-password">Password</FieldLabel>
                        <FieldContent>
                          <div className="relative">
                            <Input
                              aria-invalid={isInvalid}
                              autoComplete="current-password"
                              className="h-11 pr-10"
                              id="delete-password"
                              onBlur={field.handleBlur}
                              onChange={(event) => {
                                if (submitError) {
                                  setSubmitError(null);
                                }
                                field.handleChange(event.target.value);
                              }}
                              placeholder="Enter your password"
                              type={showPassword ? "text" : "password"}
                              value={field.state.value}
                            />
                            <button
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                              onClick={() => setShowPassword((value) => !value)}
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
                          {isInvalid ? <FieldError errors={errors} /> : null}
                        </FieldContent>
                      </Field>
                    );
                  }}
                </form.Field>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <form.Subscribe
                  selector={(state) =>
                    [state.isSubmitting, hasPassword ? state.values.password.trim() : "ok"] as const
                  }
                >
                  {([isSubmitting, password]) => (
                    <Button
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      disabled={isSubmitting || (hasPassword && !password)}
                      onClick={() => void form.handleSubmit()}
                    >
                      {isSubmitting ? "Processing..." : "Confirm deletion"}
                    </Button>
                  )}
                </form.Subscribe>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
