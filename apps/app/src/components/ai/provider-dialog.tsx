import { Button } from "@raypx/design-system/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import {
  FormControl,
  FormFieldMessage,
  FormGroup,
  FormItem,
  FormLabel,
  FormPasswordField,
  FormTextField,
} from "@raypx/design-system/components/ui/form";
import { Input } from "@raypx/design-system/components/ui/input";
import { AI_PROVIDER_DRIVERS, type AIProviderDriver } from "@raypx/shared/ai";
import { useForm } from "@tanstack/react-form";
import { useEffect, useMemo } from "react";
import { z } from "zod";

export type AIProviderFormValues = {
  mode: "create" | "edit";
  providerId?: string;
  name: string;
  driver: AIProviderDriver;
  baseUrl: string;
  defaultModel: string;
  modelsText: string;
  apiKey: string;
};

export const emptyAIProviderForm: AIProviderFormValues = {
  mode: "create",
  name: "",
  driver: "openai",
  baseUrl: "",
  defaultModel: "",
  modelsText: "",
  apiKey: "",
};

const RECOMMENDED_MODELS: Record<AIProviderDriver, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"],
  anthropic: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"],
  google: ["gemini-2.0-flash", "gemini-1.5-pro"],
  alibaba: ["qwen-max", "qwen-plus", "qwen-turbo"],
  zhipu: ["glm-4-plus", "glm-4-air", "glm-4-flash"],
  "azure-openai": ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"],
};

function parseModels(modelsText: string): string[] {
  const seen = new Set<string>();
  const models: string[] = [];

  for (const part of modelsText.split(",")) {
    const model = part.trim();
    if (!model || seen.has(model)) continue;
    seen.add(model);
    models.push(model);
  }

  return models;
}

const providerFormSchema = z.object({
  mode: z.enum(["create", "edit"]),
  providerId: z.string().optional(),
  name: z.string().trim().min(1, "Name is required."),
  driver: z.enum(AI_PROVIDER_DRIVERS),
  baseUrl: z
    .string()
    .trim()
    .refine(
      (value) => !value || /^https?:\/\//.test(value),
      "Base URL must start with http:// or https://",
    ),
  defaultModel: z.string().trim().min(1, "Default model is required."),
  modelsText: z.string().trim().min(1, "Provide at least one model."),
  apiKey: z.string(),
});

type AIProviderFormDialogProps = {
  description?: string;
  initialValues: AIProviderFormValues;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AIProviderFormValues) => Promise<void>;
  open: boolean;
  title: string;
};

export function AIProviderFormDialog({
  description,
  initialValues,
  onOpenChange,
  onSubmit,
  open,
  title,
}: AIProviderFormDialogProps) {
  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onSubmit: providerFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  useEffect(() => {
    if (open) {
      form.reset(initialValues);
    }
  }, [form, initialValues, open]);

  const modelOptions = useMemo(() => {
    const options = parseModels(form.state.values.modelsText);
    const defaultModel = form.state.values.defaultModel.trim();
    if (!defaultModel || options.includes(defaultModel)) {
      return options;
    }
    return [defaultModel, ...options];
  }, [form.state.values.defaultModel, form.state.values.modelsText]);

  useEffect(() => {
    if (form.state.values.defaultModel.trim() || modelOptions.length === 0) return;
    form.setFieldValue("defaultModel", modelOptions[0] ?? "");
  }, [form, form.state.values.defaultModel, modelOptions]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <FormGroup className="grid gap-4 py-2 sm:grid-cols-2">
            <form.Field
              name="name"
              validators={{
                onBlur: ({ value }) => (value.trim() ? undefined : "Name is required."),
              }}
            >
              {(field) => <FormTextField field={field} id="provider-name" label="Name" />}
            </form.Field>

            <form.Field name="driver">
              {(field) => (
                <FormItem>
                  <FormLabel htmlFor="provider-driver">Driver</FormLabel>
                  <FormControl>
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      id="provider-driver"
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value as AIProviderDriver)
                      }
                      value={field.state.value}
                    >
                      {AI_PROVIDER_DRIVERS.map((driver) => (
                        <option key={driver} value={driver}>
                          {driver}
                        </option>
                      ))}
                    </select>
                    <div className="pt-1">
                      <Button
                        onClick={() => {
                          const modelsText = RECOMMENDED_MODELS[field.state.value].join(", ");
                          const models = parseModels(modelsText);
                          form.setFieldValue("modelsText", modelsText);
                          if (!form.state.values.defaultModel.trim()) {
                            form.setFieldValue("defaultModel", models[0] ?? "");
                          }
                        }}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        Load Recommended Models
                      </Button>
                    </div>
                    <FormFieldMessage meta={field.state.meta} />
                  </FormControl>
                </FormItem>
              )}
            </form.Field>

            <form.Field
              name="baseUrl"
              validators={{
                onBlur: ({ value }) =>
                  !value.trim() || /^https?:\/\//.test(value.trim())
                    ? undefined
                    : "Base URL must start with http:// or https://",
              }}
            >
              {(field) => (
                <FormTextField
                  className="sm:col-span-2"
                  field={field}
                  id="provider-base-url"
                  inputProps={{ placeholder: "https://..." }}
                  label="Base URL"
                />
              )}
            </form.Field>

            <form.Field
              name="defaultModel"
              validators={{
                onBlur: ({ value }) => (value.trim() ? undefined : "Default model is required."),
              }}
            >
              {(field) => {
                const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <FormItem
                    className="sm:col-span-2"
                    data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                  >
                    <FormLabel htmlFor="provider-model">Default Model</FormLabel>
                    <FormControl>
                      {modelOptions.length > 0 ? (
                        <select
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                          id="provider-model"
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          value={field.state.value}
                        >
                          {modelOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <Input
                          aria-invalid={isInvalid}
                          id="provider-model"
                          onBlur={field.handleBlur}
                          onChange={(event) => field.handleChange(event.target.value)}
                          placeholder="Type a model or load recommended models first"
                          value={field.state.value}
                        />
                      )}
                      <FormFieldMessage meta={field.state.meta} />
                    </FormControl>
                  </FormItem>
                );
              }}
            </form.Field>

            <form.Field
              name="modelsText"
              validators={{
                onBlur: ({ value }) =>
                  parseModels(value).length ? undefined : "Provide at least one model.",
              }}
            >
              {(field) => (
                <FormTextField
                  className="sm:col-span-2"
                  description="Separate models with commas."
                  field={field}
                  id="provider-models"
                  inputProps={{ placeholder: "gpt-4o-mini, gpt-4.1-mini" }}
                  label="Models (comma separated)"
                />
              )}
            </form.Field>

            <form.Field name="apiKey">
              {(field) => (
                <FormPasswordField
                  autoComplete="off"
                  className="sm:col-span-2"
                  field={field}
                  id="provider-api-key"
                  inputProps={{
                    placeholder:
                      form.state.values.mode === "edit"
                        ? "Leave empty to keep unchanged"
                        : "Paste API key",
                  }}
                  label={`API Key ${form.state.values.mode === "edit" ? "(optional)" : ""}`}
                />
              )}
            </form.Field>
          </FormGroup>

          <div className="flex justify-end gap-2">
            <Button onClick={() => onOpenChange(false)} type="button" variant="ghost">
              Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button disabled={!canSubmit || isSubmitting} type="submit">
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
