import { beforeEach, describe, expect, it, vi } from "vitest";

const mockCreateAlibaba = vi.fn();
const mockCreateAnthropic = vi.fn();
const mockCreateGoogleGenerativeAI = vi.fn();
const mockCreateOpenAICompatible = vi.fn();

vi.mock("@ai-sdk/alibaba", () => ({
  createAlibaba: (...args: unknown[]) => mockCreateAlibaba(...args),
}));

vi.mock("@ai-sdk/anthropic", () => ({
  createAnthropic: (...args: unknown[]) => mockCreateAnthropic(...args),
}));

vi.mock("@ai-sdk/google", () => ({
  createGoogleGenerativeAI: (...args: unknown[]) => mockCreateGoogleGenerativeAI(...args),
}));

vi.mock("@ai-sdk/openai-compatible", () => ({
  createOpenAICompatible: (...args: unknown[]) => mockCreateOpenAICompatible(...args),
}));

describe("AI provider runtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the Alibaba provider for the alibaba driver", async () => {
    const model = { id: "qwen-model" };
    const client = vi.fn(() => model);
    mockCreateAlibaba.mockReturnValue(client);

    const { getChatRuntime } = await import("../src/providers");
    const runtime = getChatRuntime(
      {
        id: "provider-1",
        name: "Qwen",
        driver: "alibaba",
        baseUrl: null,
        defaultModel: "qwen3.5-plus",
      },
      { apiKey: "sk-qwen" },
    );

    expect(mockCreateAlibaba).toHaveBeenCalledWith({
      apiKey: "sk-qwen",
      baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
    });
    expect(client).toHaveBeenCalledWith("qwen3.5-plus");
    expect(runtime.model).toBe(model);
  });

  it("uses the Anthropic provider for the anthropic driver", async () => {
    const model = { id: "claude-model" };
    const client = vi.fn(() => model);
    mockCreateAnthropic.mockReturnValue(client);

    const { getChatRuntime } = await import("../src/providers");
    const runtime = getChatRuntime(
      {
        id: "provider-2",
        name: "Claude",
        driver: "anthropic",
        baseUrl: null,
        defaultModel: "claude-3-7-sonnet-latest",
      },
      { apiKey: "sk-ant-test" },
    );

    expect(mockCreateAnthropic).toHaveBeenCalledWith({
      apiKey: "sk-ant-test",
      baseURL: "https://api.anthropic.com/v1",
      name: "anthropic",
    });
    expect(client).toHaveBeenCalledWith("claude-3-7-sonnet-latest");
    expect(runtime.model).toBe(model);
  });

  it("uses the Google provider for the google driver", async () => {
    const model = { id: "gemini-model" };
    const client = vi.fn(() => model);
    mockCreateGoogleGenerativeAI.mockReturnValue(client);

    const { getChatRuntime } = await import("../src/providers");
    const runtime = getChatRuntime(
      {
        id: "provider-3",
        name: "Gemini",
        driver: "google",
        baseUrl: null,
        defaultModel: "gemini-2.5-flash",
      },
      { apiKey: "google-key" },
    );

    expect(mockCreateGoogleGenerativeAI).toHaveBeenCalledWith({
      apiKey: "google-key",
      baseURL: "https://generativelanguage.googleapis.com/v1beta",
      name: "google",
    });
    expect(client).toHaveBeenCalledWith("gemini-2.5-flash");
    expect(runtime.model).toBe(model);
  });

  it("uses the OpenAI-compatible provider for openai-compatible drivers", async () => {
    const model = { id: "openai-model" };
    const client = vi.fn(() => model);
    mockCreateOpenAICompatible.mockReturnValue(client);

    const { getChatRuntime } = await import("../src/providers");
    const runtime = getChatRuntime(
      {
        id: "provider-4",
        name: "OpenAI",
        driver: "openai",
        baseUrl: null,
        defaultModel: "gpt-4o-mini",
      },
      { apiKey: "sk-openai" },
    );

    expect(mockCreateOpenAICompatible).toHaveBeenCalledWith({
      apiKey: "sk-openai",
      baseURL: "https://api.openai.com/v1",
      name: "openai",
    });
    expect(client).toHaveBeenCalledWith("gpt-4o-mini");
    expect(runtime.model).toBe(model);
  });

  it("uses the OpenAI-compatible provider for zhipu and azure-openai drivers", async () => {
    const client = vi.fn((modelId: string) => ({ id: modelId }));
    mockCreateOpenAICompatible.mockReturnValue(client);

    const { getChatRuntime } = await import("../src/providers");

    getChatRuntime(
      {
        id: "provider-5",
        name: "Zhipu",
        driver: "zhipu",
        baseUrl: null,
        defaultModel: "glm-5",
      },
      { apiKey: "zhipu-key" },
    );

    getChatRuntime(
      {
        id: "provider-6",
        name: "Azure OpenAI",
        driver: "azure-openai",
        baseUrl: "https://azure.example/v1",
        defaultModel: "gpt-4.1-mini",
      },
      { apiKey: "azure-key" },
    );

    expect(mockCreateOpenAICompatible).toHaveBeenNthCalledWith(1, {
      apiKey: "zhipu-key",
      baseURL: "https://open.bigmodel.cn/api/paas/v4",
      name: "zhipu",
    });
    expect(mockCreateOpenAICompatible).toHaveBeenNthCalledWith(2, {
      apiKey: "azure-key",
      baseURL: "https://azure.example/v1",
      name: "azure-openai",
    });
  });
});
