import { create } from "zustand";

type PendingStream = {
  conversationCacheId: string;
  assistantMessageId: string;
};

type ChatSessionState = {
  prompt: string;
  isLoading: boolean;
  activeConversationId: string | null;
  pendingStream: PendingStream | null;
  setPrompt: (prompt: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setPendingStream: (pendingStream: PendingStream | null) => void;
  resetSessionState: () => void;
};

export const useChatSessionStore = create<ChatSessionState>((set) => ({
  prompt: "",
  isLoading: false,
  activeConversationId: null,
  pendingStream: null,
  setPrompt: (prompt) => set({ prompt }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setActiveConversationId: (activeConversationId) => set({ activeConversationId }),
  setPendingStream: (pendingStream) => set({ pendingStream }),
  resetSessionState: () =>
    set({
      prompt: "",
      isLoading: false,
      activeConversationId: null,
      pendingStream: null,
    }),
}));
