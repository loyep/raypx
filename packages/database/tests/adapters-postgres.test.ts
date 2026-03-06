import { beforeEach, describe, expect, it, vi } from "vitest";

process.env.DATABASE_URL ??= "postgres://localhost:5432/raypx_test";
process.env.DB_LOG_SQL ??= "true";
process.env.DB_LOG_PARAMS ??= "masked";

const endMock = vi.fn(async () => undefined);
const postgresMock = vi.fn(() => ({ end: endMock }));
const drizzleMock = vi.fn(({ client }: { client: unknown }) => ({ client, kind: "mock-db" }));

vi.mock("postgres", () => ({
  default: postgresMock,
}));

vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: drizzleMock,
}));

beforeEach(() => {
  endMock.mockClear();
  postgresMock.mockClear();
  drizzleMock.mockClear();
});

describe("createClientWithConnection", async () => {
  const { createClient, createClientWithConnection } = await import("../src/adapters/postgres");

  it("creates db/client pair and closes with default timeout", async () => {
    const result = createClientWithConnection({
      databaseUrl: "postgres://example.com/raypx",
      closeTimeout: 9,
    });

    expect(drizzleMock).toHaveBeenCalledTimes(1);
    expect(result.db).toEqual(expect.objectContaining({ kind: "mock-db" }));

    await result.close();
    expect(endMock).toHaveBeenCalledWith({ timeout: 9 });
  });

  it("allows overriding close timeout at call site", async () => {
    const result = createClientWithConnection({
      databaseUrl: "postgres://example.com/raypx",
      closeTimeout: 9,
    });

    await result.close({ timeout: 2 });
    expect(endMock).toHaveBeenCalledWith({ timeout: 2 });
  });

  it("keeps createClient backward-compatible", () => {
    const db = createClient({
      databaseUrl: "postgres://example.com/raypx",
    });

    expect(db).toEqual(expect.objectContaining({ kind: "mock-db" }));
  });
});
