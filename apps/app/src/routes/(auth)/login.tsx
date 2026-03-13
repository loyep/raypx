import { OAuthButton, OAuthButtonGroup } from "@raypx/auth";
import { Button } from "@raypx/design-system/components/ui/button";
import { Separator } from "@raypx/design-system/components/ui/separator";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { generatePageHead } from "@raypx/seo";
import { IconBrandGithub, IconBrandGoogle } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth";
import { EmailSignInForm } from "@/components/auth/sign-in-form";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
  head: () => generatePageHead({ ...siteConfig, title: "Login - Raypx App" }),
});

function LoginPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [, setError] = useState<string | null>(null);

  return (
    <AuthLayout subtitle="Sign in to continue your conversations" title="Welcome back">
      <div className="space-y-5">
        <OAuthButtonGroup
          callbackURL="/chat"
          onError={setError}
          onFocusReturn={() => router.invalidate()}
        >
          <div className="grid gap-3">
            <OAuthButton
              provider="google"
              render={({ disabled, isLoading, onClick }) => (
                <Button className="w-full" disabled={disabled} onClick={onClick} type="button">
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
                <Button className="w-full" disabled={disabled} onClick={onClick} type="button">
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

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
          </div>
        </div>

        <EmailSignInForm
          formId="login-page"
          onSuccess={() => navigate({ to: "/chat" })}
          submitButtonClassName="w-full"
        />

        <p className="border-t pt-6 text-center text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link className="font-medium text-primary hover:underline" to="/signup">
            Sign up
          </Link>
        </p>
      </div>
      <p className="mt-6 text-center text-muted-foreground text-xs">
        By clicking continue, you agree to our{" "}
        <Link className="underline hover:text-foreground" to="/terms">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link className="underline hover:text-foreground" to="/privacy">
          Privacy Policy
        </Link>
        .
      </p>
    </AuthLayout>
  );
}
