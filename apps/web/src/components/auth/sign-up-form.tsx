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
import { FormErrorAlert } from "@/components/form/error-alert";
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
      <FormErrorAlert message={submitError} />

      <FormGroup>
        <form.Field
          name="name"
          validators={{
            onBlur: ({ value }) => (value.trim() ? undefined : "Full name is required."),
            onSubmit: ({ value }) => (value.trim() ? undefined : "Full name is required."),
          }}
        >
          {(field) => {
            return (
              <FormTextField
                field={field}
                id={`${formId}-name`}
                inputClassName={inputClassName}
                inputProps={{
                  autoComplete: "name",
                  placeholder: "John Doe",
                }}
                label="Full name"
                onValueChange={() => {
                  if (submitError) {
                    setSubmitError(null);
                  }
                }}
              />
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
            return (
              <FormTextField
                field={field}
                id={`${formId}-email`}
                inputClassName={inputClassName}
                inputProps={{
                  autoComplete: "email",
                  placeholder: "name@example.com",
                }}
                label="Email"
                onValueChange={() => {
                  if (submitError) {
                    setSubmitError(null);
                  }
                }}
                type="email"
              />
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
            const passwordStrength = getPasswordStrength(field.state.value);

            return (
              <FormPasswordField
                autoComplete="new-password"
                field={field}
                id={`${formId}-password`}
                inputClassName={inputClassName}
                inputProps={{ placeholder: "Create a password" }}
                label="Password"
                onValueChange={() => {
                  if (submitError) {
                    setSubmitError(null);
                  }
                }}
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
          {(field) => {
            return (
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
                  </FormLabel>
                  <FormFieldMessage meta={field.state.meta} />
                </FormControl>
              </FormItem>
            );
          }}
        </form.Field>
      </FormGroup>

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
