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
import { useState } from "react";
import { z } from "zod";
import { signIn } from "@/lib/auth";

type SignInValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const defaultValues: SignInValues = {
  email: "",
  password: "",
  rememberMe: false,
};

const emailSchema = z.email("Enter a valid email address.");
const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
  rememberMe: z.boolean(),
});

type EmailSignInFormProps = {
  formId: string;
  inputClassName?: string;
  submitButtonClassName?: string;
  submitLabel?: string;
  submittingLabel?: string;
  onSuccess?: () => void | Promise<void>;
};

function validateEmail(value: string) {
  return emailSchema.safeParse(value).success ? undefined : "Enter a valid email address.";
}

function validatePassword(value: string) {
  return value.trim().length > 0 ? undefined : "Password is required.";
}

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

export function EmailSignInForm({
  formId,
  inputClassName,
  onSuccess,
  submitButtonClassName,
  submitLabel = "Sign in",
  submittingLabel = "Signing in...",
}: EmailSignInFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm({
    defaultValues,
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        const result = await signIn.email(value);
        if (result.error) {
          setSubmitError(result.error.message || "Failed to sign in");
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
          name="email"
          validators={{
            onBlur: ({ value }) => validateEmail(value),
            onSubmit: ({ value }) => validateEmail(value),
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
            onBlur: ({ value }) => validatePassword(value),
            onSubmit: ({ value }) => validatePassword(value),
          }}
        >
          {(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={`${formId}-password`}>Password</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Input
                      aria-invalid={isInvalid}
                      autoComplete="current-password"
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
                  {isInvalid ? (
                    <FieldError errors={normalizeFieldErrors(field.state.meta.errors)} />
                  ) : null}
                </FieldContent>
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="rememberMe">
          {(field) => (
            <Field orientation="horizontal">
              <Checkbox
                checked={field.state.value}
                id={`${formId}-remember`}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <FieldContent className="gap-0">
                <FieldLabel
                  className="cursor-pointer font-normal text-sm"
                  htmlFor={`${formId}-remember`}
                >
                  Remember me
                </FieldLabel>
              </FieldContent>
            </Field>
          )}
        </form.Field>
      </FieldGroup>

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
