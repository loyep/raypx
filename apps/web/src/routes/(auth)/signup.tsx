import { Button } from "@raypx/design-system/components/ui/button";
import { FieldSeparator } from "@raypx/design-system/components/ui/field";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { generatePageHead } from "@raypx/seo";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth";
import { EmailSignUpForm } from "@/components/auth/email-sign-up-form";
import { siteConfig } from "@/config/site";
import { OAuthButton, OAuthButtonGroup } from "@/lib/auth";

export const Route = createFileRoute("/(auth)/signup")({
  component: SignUpPage,
  head: () => generatePageHead({ ...siteConfig, title: "Sign Up - Raypx" }),
});

function SignUpPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [, setError] = useState<string | null>(null);

  return (
    <AuthLayout subtitle="Get started with Raypx for free" title="Create an account">
      <div className="space-y-5">
        {/* OAuth Buttons */}
        <OAuthButtonGroup
          callbackURL="/dashboard"
          onError={setError}
          onFocusReturn={() => router.invalidate()}
        >
          <div className="grid gap-3">
            <OAuthButton
              provider="google"
              render={({ disabled, isLoading, onClick }) => (
                <Button
                  className="h-10 w-full text-sm"
                  disabled={disabled}
                  onClick={onClick}
                  type="button"
                  variant="outline"
                >
                  {isLoading ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <IconBrandGoogle className="mr-2 size-5" />
                  )}
                  Continue with Google
                </Button>
              )}
            />
            <OAuthButton
              provider="github"
              render={({ disabled, isLoading, onClick }) => (
                <Button
                  className="h-10 w-full text-sm"
                  disabled={disabled}
                  onClick={onClick}
                  type="button"
                  variant="outline"
                >
                  {isLoading ? (
                    <Spinner className="mr-2" />
                  ) : (
                    <IconBrandGithub className="mr-2 size-5" />
                  )}
                  Continue with GitHub
                </Button>
              )}
            />
          </div>
        </OAuthButtonGroup>

        <FieldSeparator className="my-1 h-1">OR</FieldSeparator>

        {/* Email/Password Form */}
        <EmailSignUpForm
          formId="signup-page"
          inputClassName="h-11"
          onSuccess={() => navigate({ to: "/dashboard" })}
          submitButtonClassName="h-10 w-full text-sm"
        />

        <div className="flex flex-col gap-4 border-t pt-6">
          <p className="text-center text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link className="font-medium text-primary hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
