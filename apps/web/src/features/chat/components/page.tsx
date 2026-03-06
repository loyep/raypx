import { ConversationPanel } from "@/features/chat/components/conversation";
import { ChatHeader } from "@/features/chat/components/header";
import { ProviderMissingCard } from "@/features/chat/components/provider-missing";
import { useChatController } from "@/features/chat/hooks/use-chat-controller";

type ChatPageProps = {
  routeConversationId: string | null;
  onRouteConversationChange: (conversationId: string | null) => void;
};

export function ChatPage({ routeConversationId, onRouteConversationChange }: ChatPageProps) {
  const {
    activeTitle,
    canSend,
    conversationIsFetching,
    error,
    hasEnabledProviders,
    isLoading,
    messages,
    messagesContainerRef,
    onPromptChange,
    onProviderChange,
    onSendPrompt,
    prompt,
    providerId,
    providers,
    startNewConversation,
    timing,
  } = useChatController({ onRouteConversationChange, routeConversationId });

  return (
    <div className="space-y-6">
      <ChatHeader
        activeTitle={activeTitle}
        onStartNewConversation={startNewConversation}
        timing={timing}
      />

      {!hasEnabledProviders ? <ProviderMissingCard /> : null}

      <ConversationPanel
        canSend={canSend}
        conversationIsFetching={conversationIsFetching}
        error={error}
        hasProviders={hasEnabledProviders}
        isLoading={isLoading}
        messages={messages}
        messagesContainerRef={messagesContainerRef}
        onPromptChange={onPromptChange}
        onProviderChange={onProviderChange}
        onSendPrompt={onSendPrompt}
        prompt={prompt}
        providerId={providerId}
        providers={providers}
      />
    </div>
  );
}
