import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { toast } from "@raypx/design-system/components/ui/toast";
import { IconKey, IconPencil, IconPlus, IconSparkles, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  AIProviderFormDialog,
  type AIProviderFormValues,
  BYOK_PROVIDER_LIBRARY,
  emptyAIProviderForm,
  parseModels,
} from "@/components/ai/provider-form-dialog";
import { WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";
import { useState } from "react";

type ProviderRecord = {
  id: string;
  name: string;
  isDefault: boolean;
  isEnabled: boolean;
  hasKey: boolean;
  keyHint?: string | null;
  driver: string;
  baseUrl?: string | null;
  defaultModel: string;
  models: string[];
};

export const Route = createFileRoute("/(app)/settings/ai-providers")({
  component: AIProviderSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "AI Provider Settings - Raypx App" }),
});

function AIProviderSettingsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AIProviderFormValues>(emptyAIProviderForm);
  const providersQuery = useQuery({
    queryKey: ["settings", "providers"],
    queryFn: async () => (await client.ai.providers.list({})).data.providers,
  });
  const preferencesQuery = useQuery({
    queryKey: ["ai", "preferences"],
    queryFn: async () => (await client.ai.preferences.get()).data,
  });

  const providers = (providersQuery.data ?? []) as ProviderRecord[];
  const preferences = preferencesQuery.data;
  const defaultProvider =
    providers.find((provider) => provider.id === preferences?.defaultProviderId) ??
    providers.find((provider) => provider.isDefault) ??
    null;
  const configuredDrivers = new Set(providers.map((provider) => provider.name.toLowerCase()));

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["settings", "providers"] }),
      queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] }),
      queryClient.invalidateQueries({ queryKey: ["ai", "capabilities"] }),
    ]);
  };

  const saveMutation = useMutation({
    mutationFn: async (values: AIProviderFormValues) => {
      if (values.mode === "create") {
        const response = await client.ai.providers.create({
          name: values.name.trim(),
          driver: values.driver,
          baseUrl: values.baseUrl.trim() || null,
          defaultModel: values.defaultModel.trim(),
          models: parseModels(values.modelsText),
          isEnabled: true,
          setDefault: values.setDefault,
        });

        const createdProvider =
          response.data.providers.find(
            (item: { id: string; name: string }) => item.name === values.name.trim(),
          ) ?? null;

        if (createdProvider && values.apiKey.trim()) {
          await client.ai.providers.setSecret({
            providerId: createdProvider.id,
            apiKey: values.apiKey.trim(),
          });
        }

        if (createdProvider && values.setDefault && !response.data.defaultProviderId) {
          await client.ai.providers.setDefault({ providerId: createdProvider.id });
        }

        return;
      }

      if (!values.providerId) {
        throw new Error("providerId is required");
      }

      await client.ai.providers.update({
        providerId: values.providerId,
        name: values.name.trim(),
        driver: values.driver,
        baseUrl: values.baseUrl.trim() || null,
        defaultModel: values.defaultModel.trim(),
        models: parseModels(values.modelsText),
      });

      if (values.apiKey.trim()) {
        await client.ai.providers.setSecret({
          providerId: values.providerId,
          apiKey: values.apiKey.trim(),
        });
      }

      if (values.setDefault) {
        await client.ai.providers.setDefault({ providerId: values.providerId });
      }
    },
    onSuccess: async (_, values) => {
      toast.success(values.mode === "create" ? "Provider added" : "Provider updated");
      setDialogOpen(false);
      setForm(emptyAIProviderForm);
      await refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save provider");
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (executor: () => Promise<unknown>) => executor(),
    onSuccess: refresh,
    onError: (error) => toast.error(error.message || "Action failed"),
  });

  const openCreateDialog = (provider?: (typeof BYOK_PROVIDER_LIBRARY)[number]) => {
    setForm({
      ...emptyAIProviderForm,
      name: provider?.name ?? "",
      driver: provider?.driver ?? "openai",
      defaultModel: provider?.recommendedModels[0] ?? "",
      modelsText: provider?.recommendedModels.join(", ") ?? "",
      baseUrl: provider?.name === "OpenAI Compatible" ? "https://api.example.com/v1" : "",
    });
    setDialogOpen(true);
  };

  const openEditDialog = (provider: ProviderRecord) => {
    setForm({
      mode: "edit",
      providerId: provider.id,
      name: provider.name,
      driver: provider.driver as AIProviderFormValues["driver"],
      baseUrl: provider.baseUrl ?? "",
      defaultModel: provider.defaultModel,
      modelsText: provider.models.join(", "),
      apiKey: "",
      setDefault: provider.isDefault,
    });
    setDialogOpen(true);
  };

  return (
    <WorkspacePage
      description="Raypx is currently BYOK-first. Connect your own providers, choose a default model, and keep Ask pointed at the setup you control."
      kicker="Settings"
      title="AI Providers"
    >
      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-primary/20">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Current default</CardTitle>
                <CardDescription>
                  This is the provider Ask will use unless a later workspace override is introduced.
                </CardDescription>
              </div>
              <Button className="gap-2" onClick={() => openCreateDialog()}>
                <IconPlus className="size-4" />
                Add provider
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {defaultProvider ? (
              <div className="rounded-2xl border bg-muted/30 p-4">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{defaultProvider.name}</p>
                  <Badge>Default</Badge>
                  {defaultProvider.hasKey ? <Badge variant="outline">Ready</Badge> : null}
                </div>
                <p className="mt-2 text-muted-foreground text-sm">
                  {defaultProvider.driver} · {preferences?.model || defaultProvider.defaultModel}
                </p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Source: your own key · Models: {defaultProvider.models.join(", ")}
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed p-4 text-muted-foreground text-sm">
                No default provider yet. Add one below to start using Ask with your own model key.
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {providers.length === 0 ? (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>No providers configured yet</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-sm">
                    Add your own provider key first. Hosted mode can come later, but the first
                    version should feel fully usable with your own providers.
                  </CardContent>
                </Card>
              ) : (
                providers.map((provider) => (
                  <Card key={provider.id}>
                    <CardHeader className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{provider.name}</CardTitle>
                        {provider.isDefault ? <Badge>Default</Badge> : null}
                        {provider.hasKey ? (
                          <Badge variant="outline">Key ready</Badge>
                        ) : (
                          <Badge variant="outline">Missing key</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <p className="text-muted-foreground">
                        {provider.driver} · {provider.defaultModel}
                      </p>
                      <p className="text-muted-foreground">Models: {provider.models.join(", ")}</p>
                      <p className="text-muted-foreground">
                        Key hint: {provider.keyHint ?? (provider.hasKey ? "Configured" : "Not set")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={() => openEditDialog(provider)} size="sm" variant="outline">
                          <IconPencil className="size-4" />
                          Edit
                        </Button>
                        {!provider.isDefault ? (
                          <Button
                            onClick={() =>
                              actionMutation.mutate(() =>
                                client.ai.providers.setDefault({ providerId: provider.id }),
                              )
                            }
                            size="sm"
                            variant="outline"
                          >
                            <IconSparkles className="size-4" />
                            Set default
                          </Button>
                        ) : null}
                        {provider.hasKey ? (
                          <Button
                            onClick={() =>
                              actionMutation.mutate(() =>
                                client.ai.providers.removeSecret({ providerId: provider.id }),
                              )
                            }
                            size="sm"
                            variant="outline"
                          >
                            <IconKey className="size-4" />
                            Remove key
                          </Button>
                        ) : null}
                        <Button
                          onClick={() =>
                            actionMutation.mutate(() =>
                              client.ai.providers.delete({ providerId: provider.id }),
                            )
                          }
                          size="sm"
                          variant="destructive"
                        >
                          <IconTrash className="size-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {providers.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Supported providers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {BYOK_PROVIDER_LIBRARY.map((provider) => (
                <div className="rounded-xl border p-4" key={provider.name}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-muted-foreground text-sm">{provider.description}</p>
                      <p className="text-muted-foreground text-xs">
                        Recommended: {provider.recommendedModels.join(", ")}
                      </p>
                    </div>
                    <Button onClick={() => openCreateDialog(provider)} size="sm" variant="outline">
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Supported providers</CardTitle>
              <CardDescription>
                Keep this list intentionally short at first so adding a provider feels fast instead
                of like configuring a whole platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {BYOK_PROVIDER_LIBRARY.map((provider) => {
                const alreadyConfigured = configuredDrivers.has(provider.name.toLowerCase());
                return (
                  <div className="rounded-xl border p-4" key={provider.name}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{provider.name}</p>
                          {alreadyConfigured ? <Badge variant="outline">Configured</Badge> : null}
                        </div>
                        <p className="text-muted-foreground text-sm">{provider.description}</p>
                        <p className="text-muted-foreground text-xs">
                          Recommended: {provider.recommendedModels.join(", ")}
                        </p>
                      </div>
                      <Button
                        disabled={alreadyConfigured}
                        onClick={() => openCreateDialog(provider)}
                        size="sm"
                        variant="outline"
                      >
                        {alreadyConfigured ? "Added" : "Add"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      <AIProviderFormDialog
        description="Connect your own provider and pick the default model you want Ask to use."
        initialValues={form}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
        open={dialogOpen}
        title={form.mode === "create" ? "Add provider" : "Edit provider"}
      />
    </WorkspacePage>
  );
}
