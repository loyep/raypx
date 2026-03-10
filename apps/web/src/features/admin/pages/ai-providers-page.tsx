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
import { IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  AIProviderFormDialog,
  type AIProviderFormValues,
  emptyAIProviderForm,
} from "@/components/ai/provider-dialog";
import { client } from "@/utils/orpc";

type ProviderItem = Awaited<
  ReturnType<typeof client.ai.system.providers.list>
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

export function AdminAIProvidersPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<AIProviderFormValues>(emptyAIProviderForm);

  const providersQuery = useQuery({
    queryKey: ["adminAiProviders", "list"],
    queryFn: async () => (await client.ai.system.providers.list({})).data.providers,
  });

  const providers = providersQuery.data ?? [];
  const sorted = useMemo(
    () => [...providers].sort((a, b) => Number(b.isDefault) - Number(a.isDefault)),
    [providers],
  );

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["adminAiProviders"] });
    await queryClient.invalidateQueries({ queryKey: ["ai", "preferences"] });
  };

  const saveMutation = useMutation({
    mutationFn: async (values: AIProviderFormValues) => {
      if (values.mode === "create") {
        const response = await client.ai.system.providers.create({
          name: values.name.trim(),
          driver: values.driver,
          baseUrl: values.baseUrl.trim() || null,
          defaultModel: values.defaultModel.trim(),
          models: parseModels(values.modelsText),
          isEnabled: true,
          setDefault: providers.length === 0,
        });

        if (values.apiKey.trim()) {
          const created = response.data.providers.find(
            (item: ProviderItem) => item.name === values.name.trim(),
          );
          if (created) {
            await client.ai.system.providers.setSecret({
              providerId: created.id,
              apiKey: values.apiKey.trim(),
            });
          }
        }

        return;
      }

      if (!values.providerId) {
        throw new Error("providerId is required");
      }

      await client.ai.system.providers.update({
        providerId: values.providerId,
        name: values.name.trim(),
        driver: values.driver,
        baseUrl: values.baseUrl.trim() || null,
        defaultModel: values.defaultModel.trim(),
        models: parseModels(values.modelsText),
      });

      if (values.apiKey.trim()) {
        await client.ai.system.providers.setSecret({
          providerId: values.providerId,
          apiKey: values.apiKey.trim(),
        });
      }
    },
    onSuccess: async (_, values) => {
      toast.success(
        values.mode === "create" ? "System provider created" : "System provider updated",
      );
      setDialogOpen(false);
      setForm(emptyAIProviderForm);
      await refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save provider");
    },
  });

  const mutateProvider = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
    onError: (error) => toast.error(error.message || "Operation failed"),
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

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">AI Providers</h1>
          <p className="text-muted-foreground">Manage system-level providers for all users.</p>
        </div>
        <Button className="gap-2" onClick={openCreateDialog}>
          <IconPlus className="size-4" />
          Add Provider
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Provider Registry</CardTitle>
          <CardDescription>Enable, disable, set default, and rotate provider keys.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {sorted.length === 0 ? (
            <p className="text-muted-foreground text-sm">No system provider yet.</p>
          ) : (
            sorted.map((provider) => (
              <div className="rounded-lg border p-4" key={provider.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{provider.name}</p>
                      {provider.isDefault ? <Badge>Default</Badge> : null}
                      {provider.isEnabled ? (
                        <Badge variant="outline">Enabled</Badge>
                      ) : (
                        <Badge variant="destructive">Disabled</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {provider.driver} · {provider.defaultModel}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Models: {provider.models.join(", ")}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Key: {provider.hasKey ? (provider.keyHint ?? "Configured") : "Missing"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => openEditDialog(provider)} size="sm" variant="outline">
                      <IconPencil className="size-4" />
                    </Button>
                    <Button
                      onClick={() =>
                        mutateProvider.mutate(() =>
                          client.ai.system.providers.update({
                            providerId: provider.id,
                            isEnabled: !provider.isEnabled,
                          }),
                        )
                      }
                      size="sm"
                      variant="outline"
                    >
                      {provider.isEnabled ? "Disable" : "Enable"}
                    </Button>
                    {!provider.isDefault ? (
                      <Button
                        onClick={() =>
                          mutateProvider.mutate(() =>
                            client.ai.system.providers.setDefault({ providerId: provider.id }),
                          )
                        }
                        size="sm"
                        variant="outline"
                      >
                        Set Default
                      </Button>
                    ) : null}
                    {provider.hasKey ? (
                      <Button
                        onClick={() =>
                          mutateProvider.mutate(() =>
                            client.ai.system.providers.removeSecret({ providerId: provider.id }),
                          )
                        }
                        size="sm"
                        variant="outline"
                      >
                        Remove Key
                      </Button>
                    ) : null}
                    <Button
                      onClick={() =>
                        mutateProvider.mutate(() =>
                          client.ai.system.providers.delete({ providerId: provider.id }),
                        )
                      }
                      size="sm"
                      variant="destructive"
                    >
                      <IconTrash className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AIProviderFormDialog
        initialValues={form}
        onOpenChange={setDialogOpen}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
        open={dialogOpen}
        title={form.mode === "create" ? "Add Provider" : "Edit Provider"}
      />
    </div>
  );
}
