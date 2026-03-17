import type { RouterClient } from "@orpc/server";
import { aiRouter } from "../modules/ai/router";
import { searchRouter } from "../modules/search/router";
import { sessionRouter } from "../modules/session/router";
import { systemRouter } from "../modules/system/router";
import { workspaceRouter } from "../modules/workspace/router";
import { composeRpcPlugins } from "../plugins/compose";
import { createRpcPluginList } from "../plugins/list";

const baseRouter = {
  system: systemRouter,
  session: sessionRouter,
  ai: aiRouter,
  workspace: workspaceRouter,
  search: searchRouter,
};

export const appRouter = composeRpcPlugins(baseRouter, createRpcPluginList()) as any;
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
