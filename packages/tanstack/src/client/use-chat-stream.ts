import type { AIChatStreamEvent } from "@raypx/shared/ai";
import { type AIErrorCode, getAIErrorMessage } from "@raypx/shared/ai";
import { useCallback, useState } from "react";

export type StreamTiming = {
  startedAt: number;
  firstDeltaAt: number | null;
  finishedAt: number | null;
  chunkCount: number;
};

export type ChatStreamInput = {
  prompt: string;
  providerId?: string;
  conversationId?: string;
};

export type ChatStreamCall = (input: ChatStreamInput) => Promise<AsyncIterable<AIChatStreamEvent>>;

type UseChatStreamOptions = {
  onEvent?: (event: AIChatStreamEvent) => void;
  onError?: (error: Error) => void;
};

export function useChatStream(call: ChatStreamCall, options?: UseChatStreamOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<string>("");
  const [error, setError] = useState("");
  const [timing, setTiming] = useState<StreamTiming | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);

  const sendPrompt = useCallback(
    async (input: ChatStreamInput) => {
      const prompt = input.prompt.trim();
      if (!prompt || isLoading) return;

      setError("");
      setIsLoading(true);
      setConversationTitle(null);

      const startedAt = Date.now();
      setTiming({
        startedAt,
        firstDeltaAt: null,
        finishedAt: null,
        chunkCount: 0,
      });

      try {
        const stream = await call({
          prompt,
          providerId: input.providerId,
          conversationId: input.conversationId,
        });

        let fullText = "";
        for await (const event of stream) {
          options?.onEvent?.(event);

          if (event.type === "meta" && event.conversationId) {
            setConversationId(event.conversationId);
            continue;
          }

          if (event.type === "delta" && event.text) {
            fullText += event.text;
            setTiming((prev) => {
              if (!prev) return prev;
              const now = Date.now();
              return {
                ...prev,
                firstDeltaAt: prev.firstDeltaAt ?? now,
                chunkCount: prev.chunkCount + 1,
              };
            });
            continue;
          }

          if (event.type === "done" && event.model) {
            setModel(event.model);
            setConversationTitle(event.title ?? null);
            setTiming((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                finishedAt: Date.now(),
              };
            });
            continue;
          }

          if (event.type === "error") {
            const message = event.code
              ? getAIErrorMessage(event.code as AIErrorCode, event.message)
              : event.message || "Chat stream failed";
            throw new Error(message);
          }
        }
      } catch (err) {
        const resolvedError = err instanceof Error ? err : new Error("Unknown error");
        setError(resolvedError.message);
        options?.onError?.(resolvedError);
      } finally {
        setIsLoading(false);
      }
    },
    [call, isLoading, options],
  );

  return {
    isLoading,
    model,
    error,
    timing,
    conversationId,
    conversationTitle,
    setConversationId,
    sendPrompt,
    clearError: () => setError(""),
    resetChat: () => {
      setModel("");
      setError("");
      setTiming(null);
      setConversationId(null);
      setConversationTitle(null);
    },
  };
}
