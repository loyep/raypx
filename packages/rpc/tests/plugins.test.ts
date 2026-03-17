import { describe, expect, it } from "vitest";
import { composeRpcPlugins, type RpcPlugin } from "../src/server/plugins/compose";

describe("composeRpcPlugins", () => {
  it("composes plugin routers onto base router", () => {
    const baseRouter = { healthCheck: "ok" };
    const plugins: RpcPlugin[] = [
      {
        id: "plugin-a",
        version: "1.0.0",
        rpc: {
          namespace: "adminUsers",
          router: { list: "handler" },
        },
      },
    ];

    const result = composeRpcPlugins(baseRouter, plugins);

    expect(result).toEqual({
      healthCheck: "ok",
      adminUsers: { list: "handler" },
    });
  });

  it("throws when plugin namespace conflicts", () => {
    const baseRouter = { healthCheck: "ok" };
    const plugins: RpcPlugin[] = [
      {
        id: "plugin-a",
        version: "1.0.0",
        rpc: {
          namespace: "adminUsers",
          router: {},
        },
      },
      {
        id: "plugin-b",
        version: "1.0.0",
        rpc: {
          namespace: "adminUsers",
          router: {},
        },
      },
    ];

    expect(() => composeRpcPlugins(baseRouter, plugins)).toThrow(
      'Duplicate rpc namespace: "adminUsers"',
    );
  });

  it("throws when plugin id conflicts", () => {
    const baseRouter = { healthCheck: "ok" };
    const plugins: RpcPlugin[] = [
      {
        id: "admin",
        version: "1.0.0",
        rpc: {
          namespace: "adminUsers",
          router: {},
        },
      },
      {
        id: "admin",
        version: "1.1.0",
        rpc: {
          namespace: "billing",
          router: {},
        },
      },
    ];

    expect(() => composeRpcPlugins(baseRouter, plugins)).toThrow(
      'Duplicate rpc plugin id: "admin"',
    );
  });
});
