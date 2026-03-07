import { Button } from "@raypx/design-system/components/ui/button";
import { Checkbox } from "@raypx/design-system/components/ui/checkbox";
import { FieldSeparator } from "@raypx/design-system/components/ui/field";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { generatePageHead } from "@raypx/seo";
import { IconBrandGithub, IconBrandGoogle, IconEye, IconEyeOff } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { AuthLayout } from "@/components/auth";
import { siteConfig } from "@/config/site";
import { OAuthButton, OAuthButtonGroup, signUp } from "@/lib/auth";

export const Route = createFileRoute("/(auth)/signup")({
  component: SignUpPage,
  head: () => generatePageHead({ ...siteConfig, title: "Sign Up - Raypx" }),
});

function SignUpPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength indicator
  const passwordStrength = getPasswordStrength(password);

  function getPasswordStrength(pwd: string): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
    if (score <= 2) return { score, label: "Fair", color: "bg-warning" };
    if (score <= 3) return { score, label: "Good", color: "bg-primary" };
    return { score, label: "Strong", color: "bg-success" };
  }

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || "Failed to create account");
      } else {
        navigate({ to: "/dashboard" });
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

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
        <form className="space-y-4" onSubmit={handleEmailSignUp}>
          {error && (
            <div className="slide-in-from-top-2 animate-in rounded-lg bg-destructive/10 p-3 text-destructive text-sm duration-200">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              autoComplete="name"
              className="h-11"
              id="name"
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              type="text"
              value={name}
            />
          </div>

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
                autoComplete="new-password"
                className="h-11 pr-10"
                id="password"
                minLength={8}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
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
                {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
              </button>
            </div>
            {/* Password strength indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength.score >= level ? passwordStrength.color : "bg-muted"
                      }`}
                      key={level}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-xs">
                  Password strength: {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2">
            <Checkbox
              checked={agreeTerms}
              id="terms"
              onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            />
            <Label className="cursor-pointer font-normal text-sm leading-tight" htmlFor="terms">
              I agree to the{" "}
              <Link
                className="font-semibold text-primary underline decoration-primary/70 underline-offset-3 transition-colors hover:text-primary/90 hover:decoration-primary"
                to="/terms"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                className="font-semibold text-primary underline decoration-primary/70 underline-offset-3 transition-colors hover:text-primary/90 hover:decoration-primary"
                to="/privacy"
              >
                Privacy Policy
              </Link>
            </Label>
          </div>

          <Button className="h-10 w-full text-sm" disabled={isLoading || !agreeTerms} type="submit">
            {isLoading ? (
              <>
                <Spinner className="mr-2" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

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
