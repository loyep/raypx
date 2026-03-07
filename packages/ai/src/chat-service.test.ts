import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateConversation = vi.fn();
const mockAppendMessage = vi.fn();
const mockPersistCallLog = vi.fn();
const mockStreamText = vi.fn();

vi.mock("./providers", () => ({
  getChatRuntime: vi.fn(() => ({
    providerId: "11111111-1111-4111-8111-111111111111",
    providerName: "Test Provider",
    providerDriver: "openai",
    displayModel: "openai/gpt-4o-mini",
    model: { id: "mock-model" },
  })),
}));

vi.mock("./persistence", () => ({
  createConversation: (...args: unknown[]) => mockCreateConversation(...args),
  listConversations: vi.fn(),
  getConversationWithMessages: vi.fn().mockResolvedValue(null),
  appendMessage: (...args: unknown[]) => mockAppendMessage(...args),
  deleteConversation: vi.fn(),
  persistCallLog: (...args: unknown[]) => mockPersistCallLog(...args),
}));

vi.mock("./persistence/preferences", () => ({
  getUserBoundProfile: vi.fn().mockResolvedValue({
    profile: {
      providerId: "11111111-1111-4111-8111-111111111111",
      model: "gpt-4o-mini",
      temperature: 0.7,
      maxTokens: 4096,
    },
  }),
  upsertUserProfile: vi.fn(),
  listUserProviders: vi.fn().mockResolvedValue([
    {
      id: "11111111-1111-4111-8111-111111111111",
      userId: "user-1",
      name: "Test Provider",
      driver: "openai",
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4o-mini",
      isEnabled: true,
      isDefault: true,
      metadata: null,
    },
  ]),
  listSystemProviders: vi.fn().mockResolvedValue([]),
  getUserProviderById: vi.fn().mockResolvedValue({
    id: "11111111-1111-4111-8111-111111111111",
    userId: "user-1",
    name: "Test Provider",
    driver: "openai",
    baseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    isEnabled: true,
    isDefault: true,
    metadata: null,
  }),
  getSystemProviderById: vi.fn().mockResolvedValue(null),
  getDefaultUserProvider: vi.fn(),
  createUserProvider: vi.fn(),
  updateUserProvider: vi.fn(),
  deleteUserProvider: vi.fn(),
  setDefaultUserProvider: vi.fn(),
  listSystemProviderCredentialsByProviderIds: vi.fn().mockResolvedValue([
    {
      id: "c1",
      providerId: "11111111-1111-4111-8111-111111111111",
      status: "active",
      keyHint: "sk-***123",
    },
  ]),
  getUserProviderCredential: vi.fn().mockResolvedValue({
    id: "c1",
    providerId: "11111111-1111-4111-8111-111111111111",
    apiKeyEncrypted: "aWQ=.ZW5j.cmFn",
    keyHint: "sk-***123",
    status: "active",
  }),
  setUserProviderSecret: vi.fn(),
  removeUserProviderSecret: vi.fn(),
}));

vi.mock("./security/credentials", () => ({
  encryptCredential: vi.fn(),
  decryptCredential: vi.fn().mockReturnValue("sk-test"),
  getCredentialHint: vi.fn(),
}));

vi.mock("ai", () => ({
  generateText: vi.fn(),
  streamText: (...args: unknown[]) => mockStreamText(...args),
}));

import { chatService } from "./chat-service";

describe("chatService.chatStream", () => {
  const createThrowingStream = (error: unknown): AsyncIterable<string> => ({
    [Symbol.asyncIterator]() {
      return {
        next: async () => {
          throw error;
        },
      };
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateConversation.mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
    });
    mockAppendMessage.mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
    });
    mockPersistCallLog.mockResolvedValue(undefined);
  });

  it("emits error event and persists error call log on stream failure", async () => {
    mockStreamText.mockReturnValue({
      textStream: createThrowingStream(new Error("rate limit exceeded")),
    });

    const { stream } = await chatService.chatStream(
      {
        db: {} as any,
        userId: "user-1",
      },
      {
        prompt: "hello",
      },
    );

    const events: Array<{ type: string; code?: string }> = [];
    const reader = stream.getReader();
    while (true) {
      const result = await reader.read();
      if (result.done) break;
      events.push(result.value as { type: string; code?: string });
    }

    expect(events.map((event) => event.type)).toContain("error");
    expect(mockPersistCallLog).toHaveBeenCalledTimes(1);
  });
});
