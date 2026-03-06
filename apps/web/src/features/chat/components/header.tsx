import { Badge } from "@raypx/design-system/components/ui/badge";
import { Button } from "@raypx/design-system/components/ui/button";

type ChatTiming = {
  startedAt: number;
  firstDeltaAt?: number;
  finishedAt?: number;
  chunkCount: number;
};

type ChatHeaderProps = {
  activeTitle: string;
  timing?: ChatTiming;
  onStartNewConversation: () => void;
};

export function ChatHeader({ activeTitle, timing, onStartNewConversation }: ChatHeaderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-bold text-2xl tracking-tight">AI Chat</h1>
        <Button onClick={onStartNewConversation} size="sm" variant="outline">
          New conversation
        </Button>
      </div>
      <p className="text-muted-foreground">
        Try AI SDK chat through oRPC procedure `ai.chatStream` with selectable provider.
      </p>
      <Badge variant="secondary">{activeTitle}</Badge>
      {timing ? (
        <p className="text-muted-foreground text-xs">
          {timing.firstDeltaAt
            ? `First token ${timing.firstDeltaAt - timing.startedAt}ms`
            : "Waiting for first token..."}
          {" · "}
          {timing.finishedAt ? `Total ${timing.finishedAt - timing.startedAt}ms` : "Generating..."}
          {" · "}
          chunks: {timing.chunkCount}
        </p>
      ) : null}
    </div>
  );
}
