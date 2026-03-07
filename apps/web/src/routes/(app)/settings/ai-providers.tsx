import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { toast } from "@raypx/design-system/components/ui/toast";
import { generatePageHead } from "@raypx/seo";
import { AI_PROVIDER_DRIVERS, type AIProviderDriver } from "@raypx/shared/ai";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { siteConfig } from "@/config/site";
import { client } from "@/utils/orpc";

type ProviderItem = Awaited<
  ReturnType<typeof client.ai.getPreferences>
>["data"]["providers"][number];

type FormState = {
  mode: "create" | "edit";
  providerId?: string;
  name: string;
  driver: AIProviderDriver;
  baseUrl: string;
  defaultModel: string;
  modelsText: string;
  apiKey: string;
};

const emptyForm: FormState = {
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

function toRecommendedModelText(driver: AIProviderDriver): string {
  return RECOMMENDED_MODELS[driver].join(", ");
}

export const Route = createFileRoute("/(app)/settings/ai-providers")({
  component: AIProviderSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "AI Provider Settings - Raypx" }),
});

function AIProviderSettingsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const preferencesQuery = useQuery({
    queryKey: ["ai", "preferences"],
    queryFn: async () => (await client.ai.getPreferences()).data,
  });

  const providers = preferencesQuery.data?.providers ?? [];

  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [providers],
  );
  const modelOptions = useMemo(() => {
    const options = parseModels(form.modelsText);
    const defaultModel = form.defaultModel.trim();
    if (!defaultModel || options.includes(defaultModel)) {
      return options;
    }
    return [defaultModel, ...options];
  }, [form.defaultModel, form.modelsText]);

  useEffect(() => {
    if (form.defaultModel.trim() || modelOptions.length === 0) return;
    setForm((prev) => ({ ...prev, defaultModel: modelOptions[0] ?? prev.defaultModel }));
  }, [form.defaultModel, modelOptions]);

  const createOrUpdateMutation = useMutation({
    mutationFn: async () => {
      if (form.mode === "create") {
        const created = await client.ai.providers.create({
          name: form.name.trim(),
          driver: form.driver,
          baseUrl: form.baseUrl.trim() || null,
          defaultModel: form.defaultModel.trim(),
          models: parseModels(form.modelsText),
          isEnabled: true,
          setDefault: providers.length === 0,
        });

        const createdProvider = created.data.providers.find(
          (item) => item.name === form.name.trim(),
        );
        if (createdProvider && form.apiKey.trim()) {
          await client.ai.providers.setSecret({
            providerId: createdProvider.id,
            apiKey: form.apiKey.trim(),
          });
        }
        return;
      }

      if (!form.providerId) {
        throw new Error("providerId is required");
      }

      await client.ai.providers.update({
        providerId: form.providerId,
        name: form.name.trim(),
        driver: form.driver,
        baseUrl: form.baseUrl.trim() || null,
        defaultModel: form.defaultModel.trim(),
        models: parseModels(form.modelsText),
      });

      if (form.apiKey.trim()) {
        await client.ai.providers.setSecret({
          providerId: form.providerId,
          apiKey: form.apiKey.trim(),
        });
      }
    },
    onSuccess: async () => {
      toast.success(form.mode === "create" ? "Provider created" : "Provider updated");
      setDialogOpen(false);
      setForm(emptyForm);
      await queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save provider");
    },
  });

  const toggleEnabledMutation = useMutation({
    mutationFn: async (provider: ProviderItem) =>
      client.ai.providers.update({ providerId: provider.id, isEnabled: !provider.isEnabled }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle provider");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (providerId: string) => client.ai.providers.setDefault({ providerId }),
    onSuccess: async () => {
      toast.success("Default provider updated");
      await queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to set default provider");
    },
  });

  const removeSecretMutation = useMutation({
    mutationFn: async (providerId: string) => client.ai.providers.removeSecret({ providerId }),
    onSuccess: async () => {
      toast.success("Provider key removed");
      await queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to remove provider key");
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (providerId: string) => client.ai.providers.delete({ providerId }),
    onSuccess: async () => {
      toast.success("Provider deleted");
      await queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete provider");
    },
  });

  const openCreateDialog = () => {
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEditDialog = (provider: ProviderItem) => {
    setForm({
      mode: "edit",
      providerId: provider.id,
      name: provider.name,
      driver: provider.driver,
      baseUrl: provider.baseUrl ?? "",
      defaultModel: provider.defaultModel,
      modelsText: provider.models.join(", "),
      apiKey: "",
    });
    setDialogOpen(true);
  };

  if (preferencesQuery.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading AI provider settings...</p>;
  }

  if (!preferencesQuery.data) {
    return <p className="text-destructive text-sm">Failed to load AI provider settings.</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>AI Providers</CardTitle>
            <CardDescription>
              Configure providers in a single panel, then enable/disable them without leaving this
              page.
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog}>
            <IconPlus className="mr-2 size-4" />
            Add Provider
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {sortedProviders.map((provider) => (
          <Card key={provider.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                {provider.isEnabled ? (
                  <IconCircleCheck className="size-4 text-green-600" />
                ) : (
                  <IconAlertTriangle className="size-4 text-amber-500" />
                )}
                {provider.name}
                <Badge variant="outline">{provider.driver}</Badge>
                {provider.isDefault ? <Badge>Default</Badge> : null}
              </CardTitle>
              <CardDescription>{provider.baseUrl || "No base URL"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-md border px-3 py-2">
                  <p className="text-muted-foreground text-xs">Model</p>
                  <p className="mt-1 font-mono">{provider.defaultModel}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-muted-foreground text-xs">Models</p>
                  <p className="mt-1 font-mono text-xs">{provider.models.join(", ")}</p>
                </div>
                <div className="rounded-md border px-3 py-2">
                  <p className="text-muted-foreground text-xs">Key</p>
                  <p className="mt-1 font-mono text-xs">
                    {provider.hasKey ? provider.keyHint : "Not set"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => openEditDialog(provider)} size="sm" variant="secondary">
                  <IconPencil className="mr-2 size-4" />
                  Configure
                </Button>
                <Button
                  onClick={() => toggleEnabledMutation.mutate(provider)}
                  size="sm"
                  variant={provider.isEnabled ? "outline" : "default"}
                >
                  {provider.isEnabled ? "Disable" : "Enable"}
                </Button>
                {!provider.isDefault ? (
                  <Button
                    disabled={!provider.isEnabled}
                    onClick={() => setDefaultMutation.mutate(provider.id)}
                    size="sm"
                    variant="outline"
                  >
                    Set Default
                  </Button>
                ) : null}
                {provider.hasKey ? (
                  <Button
                    onClick={() => removeSecretMutation.mutate(provider.id)}
                    size="sm"
                    variant="ghost"
                  >
                    Remove Key
                  </Button>
                ) : null}
                <Button
                  className="text-destructive"
                  onClick={() => deleteProviderMutation.mutate(provider.id)}
                  size="sm"
                  variant="ghost"
                >
                  <IconTrash className="mr-2 size-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{form.mode === "create" ? "Add Provider" : "Edit Provider"}</DialogTitle>
            <DialogDescription>
              Configure provider metadata and optional API key. API key is encrypted before storage.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Name</Label>
              <Input
                id="provider-name"
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                value={form.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider-driver">Driver</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                id="provider-driver"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, driver: event.target.value as AIProviderDriver }))
                }
                value={form.driver}
              >
                {AI_PROVIDER_DRIVERS.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
              <div className="pt-1">
                <Button
                  onClick={() =>
                    setForm((prev) => {
                      const modelsText = toRecommendedModelText(prev.driver);
                      const models = parseModels(modelsText);
                      return {
                        ...prev,
                        modelsText,
                        defaultModel: prev.defaultModel.trim() || models[0] || prev.defaultModel,
                      };
                    })
                  }
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  Load Recommended Models
                </Button>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="provider-base-url">Base URL</Label>
              <Input
                id="provider-base-url"
                onChange={(event) => setForm((prev) => ({ ...prev, baseUrl: event.target.value }))}
                placeholder="https://..."
                value={form.baseUrl}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="provider-model">Default Model</Label>
              {modelOptions.length > 0 ? (
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  id="provider-model"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, defaultModel: event.target.value }))
                  }
                  value={form.defaultModel}
                >
                  {modelOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id="provider-model"
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, defaultModel: event.target.value }))
                  }
                  placeholder="Type a model or load recommended models first"
                  value={form.defaultModel}
                />
              )}
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="provider-models">Models (comma separated)</Label>
              <Input
                id="provider-models"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, modelsText: event.target.value }))
                }
                placeholder="gpt-4o-mini, gpt-4.1-mini"
                value={form.modelsText}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="provider-api-key">API Key (optional)</Label>
              <Input
                id="provider-api-key"
                onChange={(event) => setForm((prev) => ({ ...prev, apiKey: event.target.value }))}
                placeholder={
                  form.mode === "edit" ? "Leave empty to keep unchanged" : "Paste API key"
                }
                type="password"
                value={form.apiKey}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setDialogOpen(false)} variant="ghost">
              Cancel
            </Button>
            <Button
              disabled={
                createOrUpdateMutation.isPending || !form.name.trim() || !form.defaultModel.trim()
              }
              onClick={() => createOrUpdateMutation.mutate()}
            >
              {createOrUpdateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
