import { useChatStream } from "@raypx/ai/client";
import { Alert, AlertDescription, AlertTitle } from "@raypx/design-system/components/ui/alert";
import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@raypx/design-system/components/ui/card";
import { ScrollArea } from "@raypx/design-system/components/ui/scroll-area";
import { Textarea } from "@raypx/design-system/components/ui/textarea";
import { toast } from "@raypx/design-system/components/ui/toast";
import { client } from "@raypx/rpc/client";
import { generatePageHead } from "@raypx/seo";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IconAlertCircle, IconArrowUpRight, IconLoader2, IconSparkles } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { InsightCard, WorkspacePage } from "@/components/workspace/workspace-primitives";
import { siteConfig } from "@/config/site";

export const Route = createFileRoute("/(app)/ask/")({
  component: AskPage,
  head: () => generatePageHead({ ...siteConfig, title: "Ask - Raypx App" }),
});

function AskPage() {
  const queryClient = useQueryClient();
  const [prompt, setPrompt] = useState(
    "Research the latest design direction for a personal AI workspace and summarize it with citations.",
  );
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
    }>
  >([]);
  const capabilitiesQuery = useQuery({
    queryKey: ["ai", "capabilities"],
    queryFn: async () => (await client.ai.capabilities()).data,
  });
  const entitlementsQuery = useQuery({
    queryKey: ["billing", "entitlements"],
    queryFn: async () => (await client.billing.entitlements.get()).data,
  });
  const spacesQuery = useQuery({
    queryKey: ["workspace", "spaces"],
    queryFn: async () => (await client.workspace.spaces.list()).data.spaces,
  });
  const preferencesQuery = useQuery({
    queryKey: ["ai", "preferences"],
    queryFn: async () => (await client.ai.preferences.get()).data,
  });
  const providersQuery = useQuery({
    queryKey: ["settings", "providers"],
    queryFn: async () => (await client.ai.providers.list({})).data.providers,
  });

  const capabilities = capabilitiesQuery.data;
  const entitlements = entitlementsQuery.data;
  const spaces = spacesQuery.data ?? [];
  const preferences = preferencesQuery.data;
  const providers = (providersQuery.data ?? []) as {
    id: string;
    name: string;
    defaultModel: string;
  }[];
  const defaultProvider =
    providers.find((provider) => provider.id === preferences?.defaultProviderId) ?? null;
  const activeModel = preferences?.model || defaultProvider?.defaultModel || "";

  const {
    clearError,
    conversationId,
    conversationTitle,
    error,
    isLoading,
    sendPrompt,
    timing,
  } = useChatStream(
    (input) =>
      client.ai.chat.stream({
        prompt: input.prompt,
        providerId: input.providerId,
        model: input.model,
        conversationId: input.conversationId,
      }) as Promise<any>,
    {
      onEvent: (event) => {
        if (event.type === "delta") {
          setMessages((current) => {
            const lastMessage = current.at(-1);
            if (lastMessage?.role === "assistant") {
              return [
                ...current.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + event.text },
              ];
            }

            return [
              ...current,
              {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: event.text,
              },
            ];
          });
        }
      },
      onError: (streamError) => {
        toast.error(streamError.message || "Ask failed");
      },
    },
  );

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "assistant") ?? null,
    [messages],
  );

  useEffect(() => {
    if (!conversationId) return;
    void queryClient.invalidateQueries({ queryKey: ["ai", "threads"] });
  }, [conversationId, queryClient]);

  useEffect(() => {
    if (!conversationTitle) return;
    toast.success(`Saved thread: ${conversationTitle}`);
  }, [conversationTitle]);

  const handleSubmit = async () => {
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error("Enter a prompt first");
      return;
    }

    clearError();
    setMessages((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedPrompt,
      },
    ]);

    await sendPrompt({
      prompt: trimmedPrompt,
      providerId: defaultProvider?.id,
      model: activeModel || undefined,
      conversationId: conversationId ?? undefined,
    });
  };

  return (
    <WorkspacePage
      description="Ask is the top-level entry into the personal workspace. It resolves models, source modes, and workspace context before chat UI gets opinionated."
      kicker="Workspace"
      title="Ask"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          description="Search, research, writing, and summarization are explicit system modes."
          title="Workspace modes"
          value={capabilities?.workspaceModes.length ?? 0}
        />
        <InsightCard
          description="BYOK and hosted pool stay separate but discoverable."
          title="Source modes"
          value={entitlements?.sourceModes.join(" + ") ?? "byok"}
        />
        <InsightCard
          description="Spaces hold reusable files, prompts, and thread context."
          title="Active spaces"
          value={spaces.length}
        />
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Current model source</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {defaultProvider ? (
            <p className="text-muted-foreground">
              Ask will use <span className="font-medium text-foreground">{defaultProvider.name}</span>
              {" · "}
              <span className="font-medium text-foreground">
                {preferences?.model || defaultProvider.defaultModel}
              </span>
              {" "}by default.
            </p>
          ) : (
            <p className="text-muted-foreground">
              No provider is configured yet. Add one from Settings before wiring up the Ask flow.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prompt surface</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <IconAlertCircle />
              <AlertTitle>Ask could not complete</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          {!defaultProvider ? (
            <Alert>
              <IconSparkles />
              <AlertTitle>No provider configured yet</AlertTitle>
              <AlertDescription>
                Add your own provider key in Settings before sending the first prompt.
              </AlertDescription>
            </Alert>
          ) : null}

          <Textarea
            className="min-h-32"
            onChange={(event) => setPrompt(event.target.value)}
            value={prompt}
          />
          <div className="flex flex-wrap gap-3">
            <Button disabled={!defaultProvider || isLoading} onClick={() => void handleSubmit()}>
              {isLoading ? <IconLoader2 className="size-4 animate-spin" /> : null}
              {isLoading ? "Thinking..." : "Send prompt"}
            </Button>
            <Button render={<Link to="/spaces" />} variant="outline">
              Open spaces
            </Button>
            <Button render={<Link to="/settings/ai-providers" />} variant="outline">
              Manage providers
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {defaultProvider ? <Badge variant="outline">{defaultProvider.name}</Badge> : null}
            {activeModel ? <Badge variant="outline">{activeModel}</Badge> : null}
            {conversationId ? <Badge variant="outline">Thread ready</Badge> : null}
            {timing?.firstDeltaAt && timing?.startedAt ? (
              <Badge variant="outline">
                First token {(timing.firstDeltaAt - timing.startedAt).toString()}ms
              </Badge>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="min-h-[26rem]">
          <CardHeader>
            <CardTitle>Live response</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Send a prompt to start a real thread. The first version only needs to prove the
                model path is wired correctly.
              </p>
            ) : (
              <ScrollArea className="h-[24rem] pr-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      className={
                        message.role === "user"
                          ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-primary-foreground text-sm"
                          : "max-w-[90%] rounded-2xl border bg-muted/30 px-4 py-3 text-sm"
                      }
                      key={message.id}
                    >
                      <p className="mb-2 text-[11px] uppercase tracking-[0.18em] opacity-70">
                        {message.role === "user" ? "You" : "Raypx"}
                      </p>
                      <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Thread status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="font-medium">Conversation</p>
              <p className="mt-1 text-muted-foreground">
                {conversationTitle || "Waiting for the first completed answer"}
              </p>
              <p className="mt-2 break-all text-muted-foreground text-xs">
                {conversationId || "No conversation id yet"}
              </p>
            </div>

            <div className="rounded-2xl border bg-muted/20 p-4">
              <p className="font-medium">Latest assistant reply</p>
              <p className="mt-2 line-clamp-6 text-muted-foreground leading-6">
                {lastAssistantMessage?.content || "The streamed answer will appear here too."}
              </p>
            </div>

            <Button
              disabled={!conversationId}
              render={<Link to="/threads" />}
              variant="outline"
            >
              Open threads
              <IconArrowUpRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </WorkspacePage>
  );
}
