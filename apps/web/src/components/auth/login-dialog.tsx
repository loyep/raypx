import { Button } from "@raypx/design-system/components/ui/button";
import { Checkbox } from "@raypx/design-system/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { Separator } from "@raypx/design-system/components/ui/separator";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { OAuthButton, OAuthButtonGroup, signIn } from "@/lib/auth";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function GoogleBrandIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24">
      <path
        d="M21.35 12.26c0-.79-.07-1.55-.21-2.26H12v4.28h5.23a4.46 4.46 0 0 1-1.94 2.93v2.43h3.13c1.83-1.68 2.93-4.16 2.93-7.38Z"
        fill="#4285F4"
      />
      <path
        d="M12 21.75c2.63 0 4.83-.87 6.44-2.36l-3.13-2.43c-.87.58-1.99.93-3.31.93-2.54 0-4.69-1.72-5.46-4.02H3.31v2.51A9.73 9.73 0 0 0 12 21.75Z"
        fill="#34A853"
      />
      <path
        d="M6.54 13.87a5.84 5.84 0 0 1 0-3.74V7.62H3.31a9.75 9.75 0 0 0 0 8.76l3.23-2.51Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.11c1.43 0 2.72.49 3.73 1.45l2.8-2.8C16.82 3.16 14.62 2.25 12 2.25a9.73 9.73 0 0 0-8.69 5.37l3.23 2.51C7.31 7.83 9.46 6.11 12 6.11Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function GitHubBrandIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.24.78-.55 0-.27-.01-.99-.02-1.95-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.11-.75.4-1.25.72-1.54-2.56-.29-5.26-1.28-5.26-5.69 0-1.26.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.14 1.18a10.8 10.8 0 0 1 5.72 0c2.18-1.49 3.14-1.18 3.14-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.08 0 4.42-2.7 5.4-5.28 5.68.41.36.78 1.08.78 2.17 0 1.57-.02 2.83-.02 3.22 0 .31.2.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

export function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        return;
      }

      onOpenChange(false);
      navigate({ to: "/dashboard" });
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="gap-3 p-5 sm:max-w-md sm:p-6">
        <DialogHeader>
          <DialogTitle>Sign in</DialogTitle>
          <DialogDescription>Sign in without leaving your current page.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <OAuthButtonGroup
            callbackURL="/dashboard"
            onError={setError}
            onFocusReturn={() => router.invalidate()}
          >
            <div className="grid gap-2">
              <OAuthButton
                provider="google"
                render={({ disabled, isLoading, onClick }) => (
                  <Button
                    className="h-9 w-full text-sm"
                    disabled={disabled}
                    onClick={onClick}
                    type="button"
                    variant="outline"
                  >
                    {isLoading ? (
                      <Spinner className="mr-2" />
                    ) : (
                      <GoogleBrandIcon className="mr-2 size-4" />
                    )}
                    Continue with Google
                  </Button>
                )}
              />
              <OAuthButton
                provider="github"
                render={({ disabled, isLoading, onClick }) => (
                  <Button
                    className="h-9 w-full text-sm"
                    disabled={disabled}
                    onClick={onClick}
                    type="button"
                    variant="outline"
                  >
                    {isLoading ? (
                      <Spinner className="mr-2" />
                    ) : (
                      <GitHubBrandIcon className="mr-2 size-4" />
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
              <span className="bg-background px-2 text-muted-foreground">or use email</span>
            </div>
          </div>

          <form className="space-y-2.5" onSubmit={handleEmailSignIn}>
            {error && (
              <div className="rounded-lg bg-destructive/10 p-2 text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="login-email">Email</Label>
              <Input
                autoComplete="email"
                id="login-email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="login-password">Password</Label>
              <div className="relative">
                <Input
                  autoComplete="current-password"
                  className="pr-10"
                  id="login-password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
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
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={rememberMe}
                id="login-remember"
                onCheckedChange={(checked) => setRememberMe(checked === true)}
              />
              <Label className="cursor-pointer font-normal text-sm" htmlFor="login-remember">
                Remember me
              </Label>
            </div>

            <Button className="h-9 w-full text-sm" disabled={isLoading} type="submit">
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

          <p className="pt-0.5 text-center text-muted-foreground text-sm">
            Don't have an account?{" "}
            <Link
              className="font-medium text-primary hover:underline"
              onClick={() => onOpenChange(false)}
              to="/signup"
            >
              Create one now
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
