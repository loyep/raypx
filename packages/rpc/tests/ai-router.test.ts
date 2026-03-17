import { call } from "@orpc/server";
import { AIServiceError, chatService } from "@raypx/ai/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { aiRouter } from "../src/server/routers/ai";
import { createMockContext } from "./test-utils";

describe("aiRouter", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects protected procedures when session is missing", async () => {
    const context = createMockContext({ withSession: false });

    await expect(
      call(
        aiRouter.chat.complete,
        {
          prompt: "hello",
        },
        { context },
      ),
    ).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  it("maps AI error to ORPC status for chat", async () => {
    const context = createMockContext();
    vi.spyOn(chatService, "chat").mockRejectedValue(new AIServiceError("AI_RATE_LIMITED", "429"));

    await expect(
      call(
        aiRouter.chat.complete,
        {
          prompt: "hello",
        },
        { context },
      ),
    ).rejects.toMatchObject({
      code: "TOO_MANY_REQUESTS",
    });
  });

  it("supports provider management procedures", async () => {
    const context = createMockContext();

    vi.spyOn(chatService, "listUserProviders").mockResolvedValue([] as any);
    vi.spyOn(chatService, "createUserProvider").mockResolvedValue({
      providers: [],
      source: "default",
      defaultProviderId: null,
      model: "",
      temperature: 0.7,
      maxTokens: 4096,
    } as any);
    vi.spyOn(chatService, "setDefaultProvider").mockResolvedValue({
      providers: [],
      source: "default",
      defaultProviderId: null,
      model: "",
      temperature: 0.7,
      maxTokens: 4096,
    } as any);

    const list = await call(aiRouter.providers.list, {}, { context });
    expect(list.data.providers).toEqual([]);

    const created = await call(
      aiRouter.providers.create,
      {
        name: "OpenAI",
        driver: "openai",
        defaultModel: "gpt-4o-mini",
      },
      { context },
    );
    expect(created.data.source).toBeDefined();

    const updated = await call(
      aiRouter.providers.setDefault,
      {
        providerId: "11111111-1111-4111-8111-111111111111",
      },
      { context },
    );
    expect(updated.data.source).toBeDefined();
  });
});
