import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { toast } from "@raypx/design-system/components/ui/toast";
import { generatePageHead } from "@raypx/seo";
import {
  IconAlertTriangle,
  IconCircleCheck,
  IconPencil,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  AIProviderFormDialog,
  type AIProviderFormValues,
  emptyAIProviderForm,
} from "@/components/ai/provider-dialog";
import { siteConfig } from "@/config/site";
import { client } from "@/utils/orpc";

type ProviderItem = Awaited<
  ReturnType<typeof client.ai.getPreferences>
>["data"]["providers"][number];

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

export const Route = createFileRoute("/(app)/settings/ai-providers")({
  component: AIProviderSettingsPage,
  head: () => generatePageHead({ ...siteConfig, title: "AI Provider Settings - Raypx App" }),
});

function AIProviderSettingsPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AIProviderFormValues>(emptyAIProviderForm);

  const preferencesQuery = useQuery({
    queryKey: ["ai", "preferences"],
    queryFn: async () => (await client.ai.getPreferences()).data,
  });

  const providers = preferencesQuery.data?.providers ?? [];
  const sortedProviders = useMemo(
    () => [...providers].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [providers],
  );

  const createOrUpdateMutation = useMutation({
    mutationFn: async (values: AIProviderFormValues) => {
      if (values.mode === "create") {
        const created = await client.ai.providers.create({
          name: values.name.trim(),
          driver: values.driver,
          baseUrl: values.baseUrl.trim() || null,
          defaultModel: values.defaultModel.trim(),
          models: parseModels(values.modelsText),
          isEnabled: true,
          setDefault: providers.length === 0,
        });

        const createdProvider = created.data.providers.find(
          (item: ProviderItem) => item.name === values.name.trim(),
        );
        if (createdProvider && values.apiKey.trim()) {
          await client.ai.providers.setSecret({
            providerId: createdProvider.id,
            apiKey: values.apiKey.trim(),
          });
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
    },
    onSuccess: async (_, values) => {
      toast.success(values.mode === "create" ? "Provider created" : "Provider updated");
      setDialogOpen(false);
      setForm(emptyAIProviderForm);
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
    setForm(emptyAIProviderForm);
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
              Configure providers in a single panel, then enable or disable them without leaving
              this page.
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

      <AIProviderFormDialog
        description="Configure provider metadata and optional API key. API key is encrypted before storage."
        initialValues={form}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => {
          await createOrUpdateMutation.mutateAsync(values);
        }}
        open={dialogOpen}
        title={form.mode === "create" ? "Add Provider" : "Edit Provider"}
      />
    </div>
  );
}
