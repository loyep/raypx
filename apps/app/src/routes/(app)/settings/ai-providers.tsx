import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { Input } from "@raypx/design-system/components/ui/input";
import { ScrollArea } from "@raypx/design-system/components/ui/scroll-area";
import { toast } from "@raypx/design-system/components/ui/toast";
import { cn } from "@raypx/design-system/lib/utils";
import { IconCircleCheckFilled, IconKey, IconPlus, IconSearch, IconSparkles, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute } from "@tanstack/react-router";
import {
  AIProviderFormDialog,
  type AIProviderFormValues,
  BYOK_PROVIDER_LIBRARY,
  emptyAIProviderForm,
} from "@/components/ai/provider-form-dialog";
import { WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";
import { useEffect, useMemo, useState } from "react";

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

type ProviderLibraryItem = (typeof BYOK_PROVIDER_LIBRARY)[number];

function parseModels(models: string[]) {
  const seen = new Set<string>();
  const items: string[] = [];

  for (const model of models) {
    const value = model.trim();
    if (!value || seen.has(value)) continue;
    seen.add(value);
    items.push(value);
  }

  return items;
}

export const Route = createFileRoute("/(app)/settings/ai-providers")({
  component: AIProviderSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "AI Provider Settings - Raypx App" }),
});

function AIProviderSettingsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AIProviderFormValues>(emptyAIProviderForm);
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const [providerSearch, setProviderSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [draftApiKey, setDraftApiKey] = useState("");
  const [draftBaseUrl, setDraftBaseUrl] = useState("");
  const [draftDefaultModel, setDraftDefaultModel] = useState("");
  const [customModel, setCustomModel] = useState("");

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
  const configuredNames = new Set(providers.map((provider) => provider.name.toLowerCase()));

  useEffect(() => {
    if (providers.length === 0) {
      setSelectedProviderId(null);
      return;
    }

    const defaultProviderId =
      preferences?.defaultProviderId ??
      providers.find((provider) => provider.isDefault)?.id ??
      providers[0]?.id ??
      null;

    setSelectedProviderId((current) => {
      if (current && providers.some((provider) => provider.id === current)) {
        return current;
      }
      return defaultProviderId;
    });
  }, [preferences?.defaultProviderId, providers]);

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) ??
    providers.find((provider) => provider.isDefault) ??
    providers[0] ??
    null;

  useEffect(() => {
    if (!selectedProvider) {
      setDraftApiKey("");
      setDraftBaseUrl("");
      setDraftDefaultModel("");
      setCustomModel("");
      return;
    }

    setDraftApiKey("");
    setDraftBaseUrl(selectedProvider.baseUrl ?? "");
    setDraftDefaultModel(selectedProvider.defaultModel);
    setCustomModel("");
  }, [selectedProvider]);

  const selectedLibraryItem =
    BYOK_PROVIDER_LIBRARY.find(
      (item) => item.name.toLowerCase() === selectedProvider?.name.toLowerCase(),
    ) ?? null;

  const displayedModels = useMemo(() => {
    if (!selectedProvider) return [];
    return parseModels([
      ...(selectedLibraryItem?.recommendedModels ?? []),
      ...selectedProvider.models,
      draftDefaultModel,
    ]);
  }, [draftDefaultModel, selectedLibraryItem, selectedProvider]);

  const filteredProviders = useMemo(() => {
    const keyword = providerSearch.trim().toLowerCase();
    if (!keyword) return providers;
    return providers.filter((provider) => {
      return (
        provider.name.toLowerCase().includes(keyword) ||
        provider.driver.toLowerCase().includes(keyword)
      );
    });
  }, [providerSearch, providers]);

  const filteredCatalog = useMemo(() => {
    const keyword = providerSearch.trim().toLowerCase();
    const available = BYOK_PROVIDER_LIBRARY.filter(
      (provider) => !configuredNames.has(provider.name.toLowerCase()),
    );
    if (!keyword) return available;
    return available.filter((provider) => {
      return (
        provider.name.toLowerCase().includes(keyword) ||
        provider.description.toLowerCase().includes(keyword)
      );
    });
  }, [configuredNames, providerSearch]);

  const filteredModels = useMemo(() => {
    const keyword = modelSearch.trim().toLowerCase();
    if (!keyword) return displayedModels;
    return displayedModels.filter((model) => model.toLowerCase().includes(keyword));
  }, [displayedModels, modelSearch]);

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
          models: [values.defaultModel.trim()],
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

        if (createdProvider) {
          setSelectedProviderId(createdProvider.id);
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
        models: [values.defaultModel.trim()],
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

  const updateProviderMutation = useMutation({
    mutationFn: async (input: {
      providerId: string;
      baseUrl: string;
      defaultModel: string;
      models: string[];
      apiKey?: string;
      setDefault?: boolean;
    }) => {
      await client.ai.providers.update({
        providerId: input.providerId,
        baseUrl: input.baseUrl.trim() || null,
        defaultModel: input.defaultModel.trim(),
        models: input.models,
      });

      if (input.apiKey?.trim()) {
        await client.ai.providers.setSecret({
          providerId: input.providerId,
          apiKey: input.apiKey.trim(),
        });
      }

      if (input.setDefault) {
        await client.ai.providers.setDefault({ providerId: input.providerId });
      }
    },
    onSuccess: async () => {
      toast.success("Provider settings saved");
      setDraftApiKey("");
      setCustomModel("");
      await refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save provider settings");
    },
  });

  const actionMutation = useMutation({
    mutationFn: async (executor: () => Promise<unknown>) => executor(),
    onSuccess: async () => {
      await refresh();
    },
    onError: (error) => toast.error(error.message || "Action failed"),
  });

  const openCreateDialog = (provider?: ProviderLibraryItem) => {
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

  const handleAddCustomModel = () => {
    const trimmed = customModel.trim();
    if (!trimmed) return;
    if (!displayedModels.includes(trimmed)) {
      setDraftDefaultModel((current) => current || trimmed);
    }
    setCustomModel(trimmed);
  };

  const handleToggleModel = (model: string) => {
    if (!selectedProvider) return;

    const isEnabled = selectedProvider.models.includes(model);
    const nextModels = isEnabled
      ? selectedProvider.models.filter((item) => item !== model)
      : parseModels([...selectedProvider.models, model]);

    const nextDefault =
      draftDefaultModel === model && isEnabled && !nextModels.includes(model)
        ? nextModels[0] ?? ""
        : draftDefaultModel || nextModels[0] || "";

    setDraftDefaultModel(nextDefault);
    setCustomModel("");

    void updateProviderMutation.mutateAsync({
      providerId: selectedProvider.id,
      baseUrl: draftBaseUrl,
      defaultModel: nextDefault,
      models: parseModels([...nextModels, nextDefault]),
    });
  };

  const handleRemoveProvider = async (providerId: string) => {
    await actionMutation.mutateAsync(() => client.ai.providers.delete({ providerId }));
    if (selectedProviderId === providerId) {
      setSelectedProviderId(null);
    }
  };

  return (
    <WorkspacePage
      description="Manage your own AI providers in one place. Connect a key, choose a default model, and keep Ask pointed at the setup you control."
      kicker="Settings"
      title="AI Providers"
    >
      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="min-h-[42rem]">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle>Providers</CardTitle>
                <CardDescription>
                  Start with a small set of BYOK providers and grow from there.
                </CardDescription>
              </div>
              <Button className="gap-2" onClick={() => openCreateDialog()} size="sm">
                <IconPlus className="size-4" />
                Add
              </Button>
            </div>
            <div className="relative">
              <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
              <Input
                className="pl-9"
                onChange={(event) => setProviderSearch(event.target.value)}
                placeholder="Search providers..."
                value={providerSearch}
              />
            </div>
          </CardHeader>
          <CardContent className="min-h-0">
            <ScrollArea className="h-[31rem] pr-3">
              <div className="space-y-5">
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
                      Configured
                    </p>
                    <Badge variant="outline">{filteredProviders.length}</Badge>
                  </div>
                  {filteredProviders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-4 text-muted-foreground text-sm">
                      No configured providers yet. Add one to start using Ask.
                    </div>
                  ) : (
                    filteredProviders.map((provider) => (
                      <button
                        className={cn(
                          "w-full rounded-2xl border p-4 text-left transition-colors",
                          selectedProvider?.id === provider.id
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted/40",
                        )}
                        key={provider.id}
                        onClick={() => setSelectedProviderId(provider.id)}
                        type="button"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{provider.name}</p>
                              {provider.isDefault ? <Badge>Default</Badge> : null}
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {provider.driver} · {provider.defaultModel}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "mt-1 size-2.5 rounded-full",
                              provider.hasKey ? "bg-emerald-500" : "bg-amber-500",
                            )}
                          />
                        </div>
                      </button>
                    ))
                  )}
                </section>

                <section className="space-y-3">
                  <p className="font-medium text-muted-foreground text-xs uppercase tracking-[0.18em]">
                    Available to add
                  </p>
                  {filteredCatalog.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-4 text-muted-foreground text-sm">
                      Every suggested provider is already configured.
                    </div>
                  ) : (
                    filteredCatalog.map((provider) => (
                      <div className="rounded-2xl border p-4" key={provider.name}>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-medium">{provider.name}</p>
                            <Button
                              onClick={() => openCreateDialog(provider)}
                              size="sm"
                              variant="outline"
                            >
                              Add
                            </Button>
                          </div>
                          <p className="text-muted-foreground text-sm">{provider.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="border-primary/20">
            <CardHeader className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle>{selectedProvider?.name ?? "Choose a provider"}</CardTitle>
                  <CardDescription>
                    {selectedProvider
                      ? "Connect the key, pick a default model, and let Ask use this provider."
                      : "Pick a provider from the left, or add a new one to begin."}
                  </CardDescription>
                </div>
                {selectedProvider ? (
                  <div className="flex items-center gap-2">
                    {selectedProvider.isDefault ? <Badge>Default for Ask</Badge> : null}
                    <Badge variant="outline">
                      {selectedProvider.hasKey ? "Ready" : "Missing key"}
                    </Badge>
                  </div>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedProvider ? (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">API key</p>
                      <Input
                        onChange={(event) => setDraftApiKey(event.target.value)}
                        placeholder={selectedProvider.hasKey ? "Leave empty to keep current key" : "Paste API key"}
                        type="password"
                        value={draftApiKey}
                      />
                      <p className="text-muted-foreground text-xs">
                        {selectedProvider.keyHint
                          ? `Current key hint: ${selectedProvider.keyHint}`
                          : "Keys stay private and are only updated when you save."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Base URL</p>
                      <Input
                        onChange={(event) => setDraftBaseUrl(event.target.value)}
                        placeholder="https://..."
                        value={draftBaseUrl}
                      />
                      <p className="text-muted-foreground text-xs">
                        Leave this empty for the provider default endpoint.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Default model</p>
                      <Input
                        onChange={(event) => setDraftDefaultModel(event.target.value)}
                        placeholder="Choose or type a model id"
                        value={draftDefaultModel}
                      />
                      <p className="text-muted-foreground text-xs">
                        This is the model Ask will use by default.
                      </p>
                    </div>
                    <div className="flex items-end">
                      <Button
                        className="gap-2"
                        disabled={!draftDefaultModel.trim() || updateProviderMutation.isPending}
                        onClick={() =>
                          void updateProviderMutation.mutateAsync({
                            providerId: selectedProvider.id,
                            baseUrl: draftBaseUrl,
                            defaultModel: draftDefaultModel,
                            models: parseModels([
                              ...selectedProvider.models,
                              draftDefaultModel,
                              customModel,
                            ]),
                            apiKey: draftApiKey,
                            setDefault: preferences?.defaultProviderId !== selectedProvider.id,
                          })
                        }
                      >
                        <IconKey className="size-4" />
                        Save setup
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(selectedLibraryItem?.recommendedModels ?? []).map((model) => (
                      <Button
                        key={model}
                        onClick={() => setDraftDefaultModel(model)}
                        size="sm"
                        variant={draftDefaultModel === model ? "default" : "outline"}
                      >
                        {model}
                      </Button>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!selectedProvider.isDefault ? (
                      <Button
                        onClick={() =>
                          actionMutation.mutate(() =>
                            client.ai.providers.setDefault({ providerId: selectedProvider.id }),
                          )
                        }
                        size="sm"
                        variant="outline"
                      >
                        <IconSparkles className="size-4" />
                        Use for Ask
                      </Button>
                    ) : null}
                    {selectedProvider.hasKey ? (
                      <Button
                        onClick={() =>
                          actionMutation.mutate(() =>
                            client.ai.providers.removeSecret({ providerId: selectedProvider.id }),
                          )
                        }
                        size="sm"
                        variant="outline"
                      >
                        Remove key
                      </Button>
                    ) : null}
                    <Button
                      onClick={() => void handleRemoveProvider(selectedProvider.id)}
                      size="sm"
                      variant="destructive"
                    >
                      <IconTrash className="size-4" />
                      Delete provider
                    </Button>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-muted-foreground text-sm">
                  Add your first provider from the left. Once it exists, this detail area becomes
                  the main place to manage keys and models.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>Model list</CardTitle>
                  <CardDescription>
                    Keep model management lightweight: enable what you need, set one default, and
                    use custom IDs only when necessary.
                  </CardDescription>
                </div>
                <Badge variant="outline">{filteredModels.length}</Badge>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <IconSearch className="-translate-y-1/2 pointer-events-none absolute top-1/2 left-3 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    onChange={(event) => setModelSearch(event.target.value)}
                    placeholder="Search models..."
                    value={modelSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <Input
                    onChange={(event) => setCustomModel(event.target.value)}
                    placeholder="Custom model ID"
                    value={customModel}
                  />
                  <Button
                    disabled={!selectedProvider || !customModel.trim()}
                    onClick={handleAddCustomModel}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!selectedProvider ? (
                <div className="rounded-2xl border border-dashed p-6 text-muted-foreground text-sm">
                  Choose a provider first, then manage its default and enabled models here.
                </div>
              ) : filteredModels.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-6 text-muted-foreground text-sm">
                  No models match this search yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredModels.map((model) => {
                    const enabled = selectedProvider.models.includes(model);
                    const isDefault = draftDefaultModel === model;
                    return (
                      <div
                        className="flex flex-col gap-3 rounded-2xl border p-4 md:flex-row md:items-center md:justify-between"
                        key={model}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{model}</p>
                            {isDefault ? <Badge>Default</Badge> : null}
                            {enabled ? (
                              <Badge variant="outline">Enabled</Badge>
                            ) : (
                              <Badge variant="outline">Available</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-xs">
                            {enabled
                              ? "This model is part of the active catalog for this provider."
                              : "Turn it on when you want it selectable later."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {!isDefault ? (
                            <Button
                              onClick={() => setDraftDefaultModel(model)}
                              size="sm"
                              variant="outline"
                            >
                              <IconCircleCheckFilled className="size-4" />
                              Set default
                            </Button>
                          ) : null}
                          <Button
                            onClick={() => handleToggleModel(model)}
                            size="sm"
                            variant={enabled ? "outline" : "default"}
                          >
                            {enabled ? "Disable" : "Enable"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <AIProviderFormDialog
        description="Add the provider first. Key updates and model management will happen in the detail panel after creation."
        initialValues={form}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
        open={dialogOpen}
        title="Add provider"
      />
    </WorkspacePage>
  );
}
