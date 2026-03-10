import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGetSessionFromRequest, mockCreateAuth } = vi.hoisted(() => ({
  mockGetSessionFromRequest: vi.fn(),
  mockCreateAuth: vi.fn(() => ({ api: {} })),
}));

vi.mock("../src/server", () => ({
  createAuth: mockCreateAuth,
  getSessionFromRequest: mockGetSessionFromRequest,
}));

import { getRpcSessionFromRequest } from "../src/rpc";

describe("auth rpc helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("delegates request session lookup to server auth helper", async () => {
    const request = new Request("https://raypx.test");
    const session = { session: { id: "session-1" }, user: { id: "user-1" } };
    mockGetSessionFromRequest.mockResolvedValue(session);

    const result = await getRpcSessionFromRequest(request);

    expect(mockGetSessionFromRequest).toHaveBeenCalledWith({ api: {} }, request);
    expect(result).toEqual(session);
  });
});
