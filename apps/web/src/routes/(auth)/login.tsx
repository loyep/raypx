import { EyeIcon, EyeSlashIcon, GithubLogoIcon, GoogleLogoIcon } from "@phosphor-icons/react";
import { Button } from "@raypx/design-system/components/ui/button";
import { Checkbox } from "@raypx/design-system/components/ui/checkbox";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { Separator } from "@raypx/design-system/components/ui/separator";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth";
import { siteConfig } from "@/config/site";
import { signIn, useSession } from "@/lib/auth";

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
  head: () => generatePageHead({ ...siteConfig, title: "Login - Raypx" }),
});

function LoginPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"github" | "google" | null>(null);

  // Redirect if already logged in
  if (session) {
    navigate({ to: "/dashboard" });
    return null;
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        setError(result.error.message || "Failed to sign in");
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOAuthSignIn(provider: "github" | "google") {
    setOauthLoading(provider);
    setError(null);

    try {
      await signIn.social({
        provider,
        callbackURL: "/dashboard",
      });
    } catch {
      setError(`Failed to sign in with ${provider}`);
      setOauthLoading(null);
    }
  }

  return (
    <AuthLayout subtitle="Sign in to your account to continue" title="Welcome back">
      <div className="space-y-5">
        {/* OAuth Buttons */}
        <div className="grid gap-3">
          <Button
            className="h-11 w-full"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuthSignIn("google")}
            type="button"
            variant="outline"
          >
            {oauthLoading === "google" ? (
              <Spinner className="mr-2" />
            ) : (
              <GoogleLogoIcon className="mr-2 size-5" />
            )}
            Continue with Google
          </Button>
          <Button
            className="h-11 w-full"
            disabled={oauthLoading !== null}
            onClick={() => handleOAuthSignIn("github")}
            type="button"
            variant="outline"
          >
            {oauthLoading === "github" ? (
              <Spinner className="mr-2" />
            ) : (
              <GithubLogoIcon className="mr-2 size-5" />
            )}
            Continue with GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">or continue with email</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form className="space-y-4" onSubmit={handleEmailSignIn}>
          {error && (
            <div className="slide-in-from-top-2 animate-in rounded-lg bg-destructive/10 p-3 text-destructive text-sm duration-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              className="h-11"
              id="email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                autoComplete="current-password"
                className="h-11 pr-10"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                type={showPassword ? "text" : "password"}
                value={password}
              />
              <button
                className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                type="button"
              >
                {showPassword ? (
                  <EyeSlashIcon className="size-4" />
                ) : (
                  <EyeIcon className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={rememberMe}
                id="remember"
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label className="cursor-pointer font-normal text-sm" htmlFor="remember">
                Remember me
              </Label>
            </div>
          </div>

          <Button className="h-11 w-full" disabled={isLoading} type="submit">
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="flex flex-col gap-4 border-t pt-6">
          <p className="text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link className="font-medium text-primary hover:underline" to="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
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
