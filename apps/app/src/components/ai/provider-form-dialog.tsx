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
import { useEffect } from "react";
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
  setDefault: boolean;
};

export const BYOK_PROVIDER_LIBRARY = [
  {
    name: "OpenAI",
    driver: "openai",
    description: "Direct support for OpenAI models and the fastest path for most users.",
    recommendedModels: ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"],
  },
  {
    name: "Anthropic",
    driver: "anthropic",
    description: "Claude models for longer reasoning and writing-heavy workflows.",
    recommendedModels: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"],
  },
  {
    name: "Google",
    driver: "google",
    description: "Gemini models with Google-native API access.",
    recommendedModels: ["gemini-2.0-flash", "gemini-1.5-pro"],
  },
  {
    name: "OpenAI Compatible",
    driver: "openai",
    description: "Use custom gateways or providers that speak the OpenAI-compatible API shape.",
    recommendedModels: ["your-model-id"],
  },
] as const satisfies readonly {
  name: string;
  driver: AIProviderDriver;
  description: string;
  recommendedModels: readonly string[];
}[];

export const emptyAIProviderForm: AIProviderFormValues = {
  mode: "create",
  name: "",
  driver: "openai",
  baseUrl: "",
  defaultModel: "",
  modelsText: "",
  apiKey: "",
  setDefault: false,
};

const RECOMMENDED_MODELS: Record<AIProviderDriver, string[]> = {
  openai: ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"],
  anthropic: ["claude-3-5-haiku-latest", "claude-3-5-sonnet-latest"],
  google: ["gemini-2.0-flash", "gemini-1.5-pro"],
  alibaba: ["qwen-max", "qwen-plus", "qwen-turbo"],
  zhipu: ["glm-4-plus", "glm-4-air", "glm-4-flash"],
  "azure-openai": ["gpt-4o-mini", "gpt-4.1-mini", "gpt-4.1"],
};

function recommendedModelsForDriver(driver: AIProviderDriver) {
  return RECOMMENDED_MODELS[driver] ?? [];
}

export function parseModels(modelsText: string): string[] {
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
  setDefault: z.boolean(),
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

  useEffect(() => {
    const recommended = recommendedModelsForDriver(form.state.values.driver);
    const currentDefault = form.state.values.defaultModel.trim();
    const nextModels = parseModels([currentDefault, ...recommended].join(", "));

    form.setFieldValue("modelsText", nextModels.join(", "));
    if (!currentDefault && recommended[0]) {
      form.setFieldValue("defaultModel", recommended[0]);
    }
  }, [form, form.state.values.defaultModel, form.state.values.driver]);

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
                          const models = recommendedModelsForDriver(field.state.value);
                          form.setFieldValue("modelsText", models.join(", "));
                          form.setFieldValue("defaultModel", models[0] ?? "");
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
              {(field) => (
                <FormItem
                  className="sm:col-span-2"
                  data-invalid={field.state.meta.isTouched && !field.state.meta.isValid}
                >
                  <FormLabel htmlFor="provider-model">Default model</FormLabel>
                  <FormControl>
                    <Input
                      id="provider-model"
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextValue = event.target.value;
                        field.handleChange(nextValue);
                        const models = parseModels([nextValue, ...recommendedModelsForDriver(form.state.values.driver)].join(", "));
                        form.setFieldValue("modelsText", models.join(", "));
                      }}
                      placeholder="Type a model ID or use a recommended one"
                      value={field.state.value}
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {recommendedModelsForDriver(form.state.values.driver).map((model) => (
                      <Button
                        key={model}
                        onClick={() => {
                          field.handleChange(model);
                          form.setFieldValue(
                            "modelsText",
                            parseModels([model, ...recommendedModelsForDriver(form.state.values.driver)].join(", ")).join(", "),
                          );
                        }}
                        size="sm"
                        type="button"
                        variant={field.state.value === model ? "default" : "outline"}
                      >
                        {model}
                      </Button>
                    ))}
                  </div>
                  <p className="pt-2 text-muted-foreground text-xs">
                    Recommended models help you get started quickly. You can still type a custom
                    model ID here.
                  </p>
                  <FormFieldMessage meta={field.state.meta} />
                </FormItem>
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

            <form.Field name="setDefault">
              {(field) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel htmlFor="provider-default">Default provider</FormLabel>
                  <FormControl>
                    <label className="flex items-center gap-3 rounded-md border px-3 py-3 text-sm">
                      <input
                        checked={field.state.value}
                        id="provider-default"
                        onBlur={field.handleBlur}
                        onChange={(event) => field.handleChange(event.target.checked)}
                        type="checkbox"
                      />
                      Use this provider as the default model source for Ask.
                    </label>
                  </FormControl>
                </FormItem>
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
