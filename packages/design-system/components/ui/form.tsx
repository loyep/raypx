"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@raypx/design-system/components/ui/field";
import { Input } from "@raypx/design-system/components/ui/input";
import { cn } from "@raypx/design-system/lib/utils";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { useState } from "react";

type FieldMetaLike = {
  errors: unknown[];
  isTouched: boolean;
  isValid: boolean;
};

type StringFieldLike = {
  handleBlur: () => void;
  handleChange: (value: string) => void;
  name: string;
  state: {
    meta: FieldMetaLike;
    value: string;
  };
};

type BaseFieldProps = {
  className?: string;
  description?: React.ReactNode;
  id: string;
  inputClassName?: string;
  label: React.ReactNode;
  onValueChange?: () => void;
};

type FormTextFieldProps = BaseFieldProps & {
  field: StringFieldLike;
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    "aria-invalid" | "className" | "id" | "name" | "onBlur" | "onChange" | "type" | "value"
  >;
  renderAfterInput?: React.ReactNode | ((value: string) => React.ReactNode);
  type?: React.ComponentProps<typeof Input>["type"];
};

type FormPasswordFieldProps = BaseFieldProps & {
  autoComplete?: string;
  field: StringFieldLike;
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    | "aria-invalid"
    | "autoComplete"
    | "className"
    | "id"
    | "name"
    | "onBlur"
    | "onChange"
    | "type"
    | "value"
  >;
  renderAfterInput?: React.ReactNode | ((value: string) => React.ReactNode);
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

function FormGroup(props: React.ComponentProps<typeof FieldGroup>) {
  return <FieldGroup data-slot="form-group" {...props} />;
}

function FormItem(props: React.ComponentProps<typeof Field>) {
  return <Field data-slot="form-item" {...props} />;
}

function FormLabel(props: React.ComponentProps<typeof FieldLabel>) {
  return <FieldLabel data-slot="form-label" {...props} />;
}

function FormControl(props: React.ComponentProps<typeof FieldContent>) {
  return <FieldContent data-slot="form-control" {...props} />;
}

function FormDescription(props: React.ComponentProps<typeof FieldDescription>) {
  return <FieldDescription data-slot="form-description" {...props} />;
}

function FormMessage(props: React.ComponentProps<typeof FieldError>) {
  return <FieldError data-slot="form-message" {...props} />;
}

function FormSection({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("space-y-4", className)} data-slot="form-section" {...props} />;
}

function FormActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
      data-slot="form-actions"
      {...props}
    />
  );
}

function getFormFieldState(meta: FieldMetaLike) {
  return {
    errors: normalizeFieldErrors(meta.errors),
    isInvalid: meta.isTouched && !meta.isValid,
  };
}

function FormFieldMessage({ meta }: { meta: FieldMetaLike }) {
  const { errors, isInvalid } = getFormFieldState(meta);

  if (!isInvalid) {
    return null;
  }

  return <FormMessage errors={errors} />;
}

function FormTextField({
  className,
  description,
  field,
  id,
  inputClassName,
  inputProps,
  label,
  onValueChange,
  renderAfterInput,
  type = "text",
}: FormTextFieldProps) {
  const { isInvalid } = getFormFieldState(field.state.meta);
  const afterInput =
    typeof renderAfterInput === "function" ? renderAfterInput(field.state.value) : renderAfterInput;

  return (
    <FormItem className={className} data-invalid={isInvalid}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormControl>
        <Input
          aria-invalid={isInvalid}
          className={inputClassName}
          id={id}
          name={field.name}
          onBlur={field.handleBlur}
          onChange={(event) => {
            onValueChange?.();
            field.handleChange(event.target.value);
          }}
          type={type}
          value={field.state.value}
          {...inputProps}
        />
        {description ? <FormDescription>{description}</FormDescription> : null}
        {afterInput}
        <FormFieldMessage meta={field.state.meta} />
      </FormControl>
    </FormItem>
  );
}

function PasswordVisibilityButton({
  onToggle,
  visible,
}: {
  onToggle: () => void;
  visible: boolean;
}) {
  return (
    <button
      aria-label={visible ? "Hide password" : "Show password"}
      className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
      onClick={onToggle}
      tabIndex={-1}
      type="button"
    >
      {visible ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
    </button>
  );
}

function FormPasswordField({
  autoComplete = "current-password",
  className,
  description,
  field,
  id,
  inputClassName,
  inputProps,
  label,
  onValueChange,
  renderAfterInput,
}: FormPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const { isInvalid } = getFormFieldState(field.state.meta);
  const afterInput =
    typeof renderAfterInput === "function" ? renderAfterInput(field.state.value) : renderAfterInput;

  return (
    <FormItem className={className} data-invalid={isInvalid}>
      <FormLabel htmlFor={id}>{label}</FormLabel>
      <FormControl>
        <div className="relative">
          <Input
            aria-invalid={isInvalid}
            autoComplete={autoComplete}
            className={cn(inputClassName, "pr-10")}
            id={id}
            name={field.name}
            onBlur={field.handleBlur}
            onChange={(event) => {
              onValueChange?.();
              field.handleChange(event.target.value);
            }}
            type={visible ? "text" : "password"}
            value={field.state.value}
            {...inputProps}
          />
          <PasswordVisibilityButton
            onToggle={() => setVisible((current) => !current)}
            visible={visible}
          />
        </div>
        {description ? <FormDescription>{description}</FormDescription> : null}
        {afterInput}
        <FormFieldMessage meta={field.state.meta} />
      </FormControl>
    </FormItem>
  );
}

export {
  FormActions,
  FormControl,
  FormDescription,
  FormFieldMessage,
  FormGroup,
  FormItem,
  FormLabel,
  FormPasswordField,
  FormTextField,
  FormMessage,
  FormSection,
};
