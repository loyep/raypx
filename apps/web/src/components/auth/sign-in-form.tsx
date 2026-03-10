import { Button } from "@raypx/design-system/components/ui/button";
import { Checkbox } from "@raypx/design-system/components/ui/checkbox";
import {
  FormControl,
  FormGroup,
  FormItem,
  FormLabel,
  FormPasswordField,
  FormTextField,
} from "@raypx/design-system/components/ui/form";
import { Spinner } from "@raypx/design-system/components/ui/spinner";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";
import { FormErrorAlert } from "@/components/form/error-alert";
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

export function EmailSignInForm({
  formId,
  inputClassName,
  onSuccess,
  submitButtonClassName,
  submitLabel = "Sign in",
  submittingLabel = "Signing in...",
}: EmailSignInFormProps) {
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
      <FormErrorAlert message={submitError} />

      <FormGroup>
        <form.Field
          name="email"
          validators={{
            onBlur: ({ value }) => validateEmail(value),
            onSubmit: ({ value }) => validateEmail(value),
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
            onBlur: ({ value }) => validatePassword(value),
            onSubmit: ({ value }) => validatePassword(value),
          }}
        >
          {(field) => {
            return (
              <FormPasswordField
                field={field}
                id={`${formId}-password`}
                inputClassName={inputClassName}
                inputProps={{ placeholder: "Enter your password" }}
                label="Password"
                onValueChange={() => {
                  if (submitError) {
                    setSubmitError(null);
                  }
                }}
              />
            );
          }}
        </form.Field>

        <form.Field name="rememberMe">
          {(field) => (
            <FormItem orientation="horizontal">
              <Checkbox
                checked={field.state.value}
                id={`${formId}-remember`}
                onCheckedChange={(checked) => field.handleChange(checked === true)}
              />
              <FormControl className="gap-0">
                <FormLabel
                  className="cursor-pointer font-normal text-sm"
                  htmlFor={`${formId}-remember`}
                >
                  Remember me
                </FormLabel>
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
