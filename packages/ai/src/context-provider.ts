export type ContextChunk = {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
};

export type ContextProviderInput = {
  query: string;
  userId: string;
  conversationId?: string;
};

export type ContextProvider = (input: ContextProviderInput) => Promise<ContextChunk[]>;

export const defaultContextProvider: ContextProvider = async () => [];
