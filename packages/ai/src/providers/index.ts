import { createAlibaba } from "@ai-sdk/alibaba";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import type { AIProviderDriver } from "@raypx/shared/ai";
import { createAIServiceError } from "../errors";

const DEFAULT_QWEN_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const DEFAULT_ZHIPU_BASE_URL = "https://open.bigmodel.cn/api/paas/v4";
const DEFAULT_OPENAI_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_ANTHROPIC_BASE_URL = "https://api.anthropic.com/v1";
const DEFAULT_GOOGLE_BASE_URL = "https://generativelanguage.googleapis.com/v1beta";

type OpenAICompatibleModel = ReturnType<ReturnType<typeof createOpenAICompatible>>;
type AlibabaModel = ReturnType<ReturnType<typeof createAlibaba>>;

export type ChatRuntime = {
  providerId: string;
  providerName: string;
  providerDriver: AIProviderDriver;
  displayModel: string;
  model: OpenAICompatibleModel | AlibabaModel;
};

export type ProviderRuntimeConfig = {
  id: string;
  name: string;
  driver: AIProviderDriver;
  baseUrl: string | null;
  defaultModel: string;
};

function requireApiKey(apiKey: string | null | undefined) {
  const normalized = apiKey?.trim();
  if (!normalized) {
    throw createAIServiceError("AI_PROVIDER_UNAVAILABLE", "Provider API key is not configured");
  }
  return normalized;
}

function requireModel(model: string | null | undefined) {
  const normalized = model?.trim();
  if (!normalized) {
    throw createAIServiceError("AI_BAD_REQUEST", "Provider model is not configured");
  }
  return normalized;
}

function resolveBaseUrl(config: ProviderRuntimeConfig): string {
  if (config.driver === "openai") {
    return config.baseUrl?.trim() || DEFAULT_OPENAI_BASE_URL;
  }
  if (config.driver === "alibaba") {
    return config.baseUrl?.trim() || DEFAULT_QWEN_BASE_URL;
  }
  if (config.driver === "zhipu") {
    return config.baseUrl?.trim() || DEFAULT_ZHIPU_BASE_URL;
  }
  if (config.driver === "anthropic") {
    return config.baseUrl?.trim() || DEFAULT_ANTHROPIC_BASE_URL;
  }
  if (config.driver === "google") {
    return config.baseUrl?.trim() || DEFAULT_GOOGLE_BASE_URL;
  }

  const baseUrl = config.baseUrl?.trim();
  if (!baseUrl) {
    throw createAIServiceError(
      "AI_BAD_REQUEST",
      `Provider ${config.name} requires baseUrl for driver ${config.driver}`,
    );
  }
  return baseUrl;
}

export function getChatRuntime(
  config: ProviderRuntimeConfig,
  input: {
    apiKey: string;
    model?: string | null;
  },
): ChatRuntime {
  const apiKey = requireApiKey(input.apiKey);
  const modelName = requireModel(input.model?.trim() || config.defaultModel);

  if (config.driver === "alibaba") {
    const client = createAlibaba({
      apiKey,
      baseURL: resolveBaseUrl(config),
    });

    return {
      providerId: config.id,
      providerName: config.name,
      providerDriver: config.driver,
      displayModel: `${config.driver}/${modelName}`,
      model: client(modelName),
    };
  }

  const client = createOpenAICompatible({
    name: config.driver,
    baseURL: resolveBaseUrl(config),
    apiKey,
  });

  return {
    providerId: config.id,
    providerName: config.name,
    providerDriver: config.driver,
    displayModel: `${config.driver}/${modelName}`,
    model: client(modelName),
  };
}
