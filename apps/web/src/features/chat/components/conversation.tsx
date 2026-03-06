import { PaperPlaneTiltIcon } from "@phosphor-icons/react";
import { Button } from "@raypx/design-system/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@raypx/design-system/components/ui/card";
import { Skeleton } from "@raypx/design-system/components/ui/skeleton";
import { Textarea } from "@raypx/design-system/components/ui/textarea";
import { cn } from "@raypx/design-system/lib/utils";
import type { RefObject } from "react";

type MessageItem = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ProviderItem = {
  id: string;
  name: string;
  driver: string;
};

type ConversationPanelProps = {
  messagesContainerRef: RefObject<HTMLDivElement | null>;
  conversationIsFetching: boolean;
  messages: MessageItem[];
  isLoading: boolean;
  error: string | null;
  providers: ProviderItem[];
  hasProviders: boolean;
  providerId: string;
  onProviderChange: (providerId: string) => void;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  canSend: boolean;
  onSendPrompt: () => Promise<void>;
};

export function ConversationPanel({
  messagesContainerRef,
  conversationIsFetching,
  messages,
  isLoading,
  error,
  providers,
  hasProviders,
  providerId,
  onProviderChange,
  prompt,
  onPromptChange,
  canSend,
  onSendPrompt,
}: ConversationPanelProps) {
  return (
    <Card className="overflow-hidden border-border/70">
      <CardHeader>
        <CardTitle>Conversation</CardTitle>
        <CardDescription>
          Send a prompt and stream responses with provider-level control.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className="max-h-[460px] space-y-3 overflow-y-auto rounded-lg border bg-muted/20 p-4"
          ref={messagesContainerRef}
        >
          {conversationIsFetching && messages.length === 0
            ? Array.from({ length: 3 }).map((_, index) => (
                <div className="space-y-2 rounded-md border p-3" key={`message-skeleton-${index}`}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              ))
            : null}
          {messages.length === 0 && !conversationIsFetching ? (
            <p className="px-1 py-3 text-muted-foreground text-sm">
              No messages yet. Start with: "Help me write login page copy."
            </p>
          ) : (
            messages.map((message) => (
              <div
                className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                key={message.id}
              >
                <div
                  className={cn(
                    "max-w-[90%] overflow-hidden rounded-2xl border px-3 py-2 text-sm md:max-w-[85%]",
                    message.role === "user"
                      ? "border-primary/20 bg-primary/10 text-foreground"
                      : "border-border bg-background",
                  )}
                >
                  <p className="mb-1 font-medium text-[11px] text-muted-foreground uppercase tracking-wide">
                    {message.role === "user" ? "You" : "Assistant"}
                  </p>
                  {message.role === "assistant" && isLoading && !message.text ? (
                    <div className="flex items-center gap-1 py-1">
                      <span className="size-1.5 animate-pulse rounded-full bg-foreground/70 [animation-delay:0ms]" />
                      <span className="size-1.5 animate-pulse rounded-full bg-foreground/70 [animation-delay:120ms]" />
                      <span className="size-1.5 animate-pulse rounded-full bg-foreground/70 [animation-delay:240ms]" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                      {message.text}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {error ? (
          <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-destructive text-sm">
            {error}
          </p>
        ) : null}

        <div className="space-y-3 rounded-lg border bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <label className="font-medium text-muted-foreground text-xs" htmlFor="chat-provider">
              Provider
            </label>
            <select
              className="rounded-md border bg-background px-2 py-1 text-sm"
              disabled={isLoading || !hasProviders}
              id="chat-provider"
              onChange={(event) => onProviderChange(event.target.value)}
              value={providerId}
            >
              <option value="default">Use my default</option>
              {providers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.driver})
                </option>
              ))}
            </select>
          </div>
          <Textarea
            disabled={isLoading}
            onChange={(event) => onPromptChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                void onSendPrompt();
              }
            }}
            placeholder="Type your prompt. Press Cmd/Ctrl + Enter to send."
            rows={4}
            value={prompt}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-muted-foreground text-xs">
              Use providers configured in AI provider settings.
            </p>
            <Button
              disabled={!prompt.trim() || isLoading || !canSend}
              onClick={() => void onSendPrompt()}
            >
              <PaperPlaneTiltIcon className="mr-2 size-4" />
              {isLoading ? "Generating..." : "Send"}
            </Button>
          </div>
          {!canSend ? (
            <p className="text-destructive text-xs">
              Please configure and select a provider before sending.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
