import { Button } from "@raypx/design-system/components/ui/button";
import { Checkbox } from "@raypx/design-system/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@raypx/design-system/components/ui/field";
import { Input } from "@raypx/design-system/components/ui/input";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { signUp } from "@/lib/auth";

type SignUpValues = {
  name: string;
  email: string;
  password: string;
  agreeTerms: boolean;
};

const defaultValues: SignUpValues = {
  name: "",
  email: "",
  password: "",
  agreeTerms: false,
};

const emailSchema = z.email("Enter a valid email address.");
const signUpSchema = z.object({
  name: z.string().trim().min(1, "Full name is required."),
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters."),
  agreeTerms: z.boolean().refine((value) => value, "You must agree to the terms to continue."),
});

type EmailSignUpFormProps = {
  formId: string;
  inputClassName?: string;
  submitButtonClassName?: string;
  submitLabel?: string;
  submittingLabel?: string;
  onSuccess?: () => void | Promise<void>;
};

function normalizeFieldErrors(errors: unknown[]) {
  return errors
    .map((error) => {
      if (typeof error === "string") {
        return { message: error };
      }

      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        return { message: error.message };
      }

      return undefined;
    })
    .filter((error): error is { message: string } => Boolean(error));
}

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

export function EmailSignUpForm({
  formId,
  inputClassName,
  onSuccess,
  submitButtonClassName,
  submitLabel = "Create account",
  submittingLabel = "Creating account...",
}: EmailSignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

        await onSuccess?.();
      } catch {
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    },
  });

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
      {submitError ? (
        <div className="slide-in-from-top-2 animate-in rounded-lg bg-destructive/10 p-3 text-destructive text-sm duration-200">
          {submitError}
        </div>
      ) : null}

      <FieldGroup>
        <form.Field
          name="name"
          validators={{
            onBlur: ({ value }) => (value.trim() ? undefined : "Full name is required."),
            onSubmit: ({ value }) => (value.trim() ? undefined : "Full name is required."),
          }}
        >
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`${formId}-name`}>Full name</FieldLabel>
                <FieldContent>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="name"
                    className={inputClassName}
                    id={`${formId}-name`}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      if (submitError) {
                        setSubmitError(null);
                      }
                      field.handleChange(event.target.value);
                    }}
                    placeholder="John Doe"
                    type="text"
                    value={field.state.value}
                  />
                  {isInvalid ? (
                    <FieldError errors={normalizeFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </FieldContent>
              </Field>
            );
          }}
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
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`${formId}-email`}>Email</FieldLabel>
                <FieldContent>
                  <Input
                    aria-invalid={isInvalid}
                    autoComplete="email"
                    className={inputClassName}
                    id={`${formId}-email`}
                    name={field.name}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      if (submitError) {
                        setSubmitError(null);
                      }
                      field.handleChange(event.target.value);
                    }}
                    placeholder="name@example.com"
                    type="email"
                    value={field.state.value}
                  />
                  {isInvalid ? (
                    <FieldError errors={normalizeFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </FieldContent>
              </Field>
            );
          }}
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
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            const passwordStrength = getPasswordStrength(field.state.value);

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="new-password"
                      className={`${inputClassName ?? ""} pr-10`.trim()}
                      id={`${formId}-password`}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        if (submitError) {
                          setSubmitError(null);
                        }
                        field.handleChange(event.target.value);
                      }}
                      placeholder="Create a password"
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
                  {field.state.value ? (
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
                  ) : null}
                  {isInvalid ? (
                    <FieldError errors={normalizeFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </FieldContent>
              </Field>
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
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid} orientation="horizontal">
                <Checkbox
                  checked={field.state.value}
                  id={`${formId}-terms`}
                  onCheckedChange={(checked) => field.handleChange(checked === true)}
                />
                <FieldContent>
                  <FieldLabel
                    className="cursor-pointer font-normal text-sm leading-tight"
                    htmlFor={`${formId}-terms`}
                  >
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
                  </FieldLabel>
                  {isInvalid ? (
                    <FieldError errors={normalizeFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </FieldContent>
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <form.Subscribe
        selector={(state) =>
          [state.canSubmit, state.isSubmitting, state.values.agreeTerms] as const
        }
      >
        {([canSubmit, isSubmitting, agreeTerms]) => (
          <Button
            className={submitButtonClassName}
            disabled={!canSubmit || isSubmitting || !agreeTerms}
            type="submit"
          >
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" />
                {submittingLabel}
              </>
            ) : (
              submitLabel
            )}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
