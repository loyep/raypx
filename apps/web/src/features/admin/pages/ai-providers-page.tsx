import { PencilSimpleIcon, PlusIcon, TrashIcon } from "@phosphor-icons/react";
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
  DialogHeader,
  DialogTitle,
} from "@raypx/design-system/components/ui/dialog";
import { Input } from "@raypx/design-system/components/ui/input";
import { Label } from "@raypx/design-system/components/ui/label";
import { toast } from "@raypx/design-system/components/ui/toast";
import { AI_PROVIDER_DRIVERS, type AIProviderDriver } from "@raypx/shared/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { client } from "@/utils/orpc";

type ProviderItem = Awaited<
  ReturnType<typeof client.ai.system.providers.list>
>["data"]["providers"][number];

type FormState = {
  mode: "create" | "edit";
  providerId?: string;
  name: string;
  driver: AIProviderDriver;
  baseUrl: string;
  defaultModel: string;
  apiKey: string;
};

const emptyForm: FormState = {
  mode: "create",
  name: "",
  driver: "openai",
  baseUrl: "",
  defaultModel: "",
  apiKey: "",
};

export function AdminAIProvidersPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

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
    mutationFn: async () => {
      if (form.mode === "create") {
        const response = await client.ai.system.providers.create({
          name: form.name.trim(),
          driver: form.driver,
          baseUrl: form.baseUrl.trim() || null,
          defaultModel: form.defaultModel.trim(),
          isEnabled: true,
          setDefault: providers.length === 0,
        });

        if (form.apiKey.trim()) {
          const created = response.data.providers.find((item) => item.name === form.name.trim());
          if (created) {
            await client.ai.system.providers.setSecret({
              providerId: created.id,
              apiKey: form.apiKey.trim(),
            });
          }
        }

        return;
      }

      if (!form.providerId) throw new Error("providerId is required");

      await client.ai.system.providers.update({
        providerId: form.providerId,
        name: form.name.trim(),
        driver: form.driver,
        baseUrl: form.baseUrl.trim() || null,
        defaultModel: form.defaultModel.trim(),
      });

      if (form.apiKey.trim()) {
        await client.ai.system.providers.setSecret({
          providerId: form.providerId,
          apiKey: form.apiKey.trim(),
        });
      }
    },
    onSuccess: async () => {
      toast.success(form.mode === "create" ? "System provider created" : "System provider updated");
      setDialogOpen(false);
      setForm(emptyForm);
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
          <PlusIcon className="size-4" />
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
                      Key: {provider.hasKey ? (provider.keyHint ?? "Configured") : "Missing"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={() => openEditDialog(provider)} size="sm" variant="outline">
                      <PencilSimpleIcon className="size-4" />
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
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form.mode === "create" ? "Add Provider" : "Edit Provider"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                value={form.name}
              />
            </div>
            <div className="space-y-1">
              <Label>Driver</Label>
              <select
                className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, driver: e.target.value as AIProviderDriver }))
                }
                value={form.driver}
              >
                {AI_PROVIDER_DRIVERS.map((driver) => (
                  <option key={driver} value={driver}>
                    {driver}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Base URL</Label>
              <Input
                onChange={(e) => setForm((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="https://..."
                value={form.baseUrl}
              />
            </div>
            <div className="space-y-1">
              <Label>Default Model</Label>
              <Input
                onChange={(e) => setForm((prev) => ({ ...prev, defaultModel: e.target.value }))}
                value={form.defaultModel}
              />
            </div>
            <div className="space-y-1">
              <Label>API Key {form.mode === "edit" ? "(optional)" : ""}</Label>
              <Input
                onChange={(e) => setForm((prev) => ({ ...prev, apiKey: e.target.value }))}
                type="password"
                value={form.apiKey}
              />
            </div>
            <Button
              className="w-full"
              disabled={saveMutation.isPending}
              onClick={() => saveMutation.mutate()}
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
