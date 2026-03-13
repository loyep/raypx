import { authClient, signIn, signUp } from "@raypx/auth";
import { FormErrorAlert } from "@raypx/design-system/components/form-error-alert";
import { Button } from "@raypx/design-system/components/ui/button";
import { Checkbox } from "@raypx/design-system/components/ui/checkbox";
import {
  FormControl,
  FormFieldMessage,
  FormGroup,
  FormItem,
  FormLabel,
  FormPasswordField,
  FormTextField,
} from "@raypx/design-system/components/ui/form";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  agreeTerms: boolean;
};

const emailSchema = z.email("Enter a valid email address.");

const signUpSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  agreeTerms: z.boolean().refine((value) => value, "You must agree to the terms to continue."),
});

const defaultValues: SignUpValues = {
  name: "",
  email: "",
  password: "",
  agreeTerms: false,
};

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive" };
  if (score <= 2) return { score, label: "Fair", color: "bg-warning" };
  if (score <= 3) return { score, label: "Good", color: "bg-primary" };
  return { score, label: "Strong", color: "bg-success" };
}

type EmailSignUpFormProps = {
  formId: string;
  onSuccess?: () => void | Promise<void>;
  submitButtonClassName?: string;
};

export function EmailSignUpForm({
  formId,
  onSuccess,
  submitButtonClassName,
}: EmailSignUpFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        const result = await signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
        });
        if (result.error) {
          setSubmitError(result.error.message || "Failed to create account");
          return;
        }
        setPendingVerification({ email: value.email, password: value.password });
      } catch {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    },
  });

  const handleVerifyOtp = async () => {
    if (!pendingVerification || !otp.trim()) return;
    setOtpError(null);
    setIsVerifying(true);

    try {
      const result = await authClient.emailOtp.verifyEmail({
        email: pendingVerification.email,
        otp: otp.trim(),
      });

      if (result.error) {
        setOtpError(result.error.message || "Invalid verification code");
        return;
      }

      const signInResult = await signIn.email({
        email: pendingVerification.email,
        password: pendingVerification.password,
      });

      if (signInResult.error) {
        setOtpError(signInResult.error.message || "Failed to sign in");
        return;
      }

      await onSuccess?.();
    } catch {
      setOtpError("An unexpected error occurred. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="space-y-4">
        <p className="text-center text-muted-foreground text-sm">
          We sent a 6-digit code to <strong>{pendingVerification.email}</strong>. Enter it below to
          verify your email.
        </p>
        <FormErrorAlert message={otpError} />
        <div className="space-y-2">
          <label className="font-medium text-sm" htmlFor={`${formId}-otp`}>
            Verification code
          </label>
          <input
            autoComplete="one-time-code"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-lg tracking-[0.5em] ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            id={`${formId}-otp`}
            maxLength={6}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
              setOtpError(null);
            }}
            placeholder="000000"
            type="text"
            value={otp}
          />
        </div>
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={otp.length !== 6 || isVerifying}
            onClick={handleVerifyOtp}
            type="button"
          >
            {isVerifying ? (
              <>
                <Spinner className="mr-2" />
                Verifying...
              </>
            ) : (
              "Verify & sign in"
            )}
          </Button>
          <Button
            onClick={() => {
              setPendingVerification(null);
              setOtp("");
              setOtpError(null);
            }}
            type="button"
            variant="outline"
          >
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      id={formId}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      <FormErrorAlert message={submitError} />

      <FormGroup>
        <form.Field
          name="name"
          validators={{
            onBlur: ({ value }) => (value.trim() ? undefined : "Full name is required."),
            onSubmit: ({ value }) => (value.trim() ? undefined : "Full name is required."),
          }}
        >
          {(field) => (
            <FormTextField
              field={field}
              id={`${formId}-name`}
              inputProps={{ autoComplete: "name", placeholder: "John Doe" }}
              label="Full name"
              onValueChange={() => submitError && setSubmitError(null)}
            />
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onBlur: ({ value }) =>
              emailSchema.safeParse(value).success ? undefined : "Enter a valid email address.",
            onSubmit: ({ value }) =>
              emailSchema.safeParse(value).success ? undefined : "Enter a valid email address.",
          }}
        >
          {(field) => (
            <FormTextField
              field={field}
              id={`${formId}-email`}
              inputProps={{ autoComplete: "email", placeholder: "name@example.com" }}
              label="Email"
              onValueChange={() => submitError && setSubmitError(null)}
              type="email"
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onBlur: ({ value }) =>
              value.length >= 8 ? undefined : "Password must be at least 8 characters.",
            onSubmit: ({ value }) =>
              value.length >= 8 ? undefined : "Password must be at least 8 characters.",
          }}
        >
          {(field) => {
            const passwordStrength = getPasswordStrength(field.state.value);

            return (
              <FormPasswordField
                autoComplete="new-password"
                field={field}
                id={`${formId}-password`}
                inputProps={{ placeholder: "Create a password" }}
                label="Password"
                onValueChange={() => submitError && setSubmitError(null)}
                renderAfterInput={(value) =>
                  value ? (
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
                  ) : null
                }
              />
            );
          }}
        </form.Field>

        <form.Field
          name="agreeTerms"
          validators={{
            onSubmit: ({ value }) =>
              value ? undefined : "You must agree to the terms to continue.",
          }}
        >
          {(field) => (
            <FormItem
              data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
              orientation="horizontal"
            >
              <Checkbox
                checked={field.state.value}
                id={`${formId}-terms`}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <FormControl>
                <FormLabel
                  className="cursor-pointer font-normal text-sm leading-tight"
                  htmlFor={`${formId}-terms`}
                >
                  I agree to the{" "}
                  <Link
                    className="font-semibold text-primary underline underline-offset-3"
                    to="/terms"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    className="font-semibold text-primary underline underline-offset-3"
                    to="/privacy"
                  >
                    Privacy Policy
                  </Link>
                  .
                </FormLabel>
                <FormFieldMessage meta={field.state.meta} />
              </FormControl>
            </FormItem>
          )}
        </form.Field>
      </FormGroup>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button
            className={submitButtonClassName}
            disabled={!canSubmit || isSubmitting}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
