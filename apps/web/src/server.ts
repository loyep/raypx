import {
  getRequestTraceLogContext,
  resolveRequestTrace,
  runWithLogContext,
  withTraceHeaders,
} from "@raypx/core";
import { createStartHandler, defaultStreamHandler } from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

const fetch = createStartHandler({
  handler: async (ctx) => {
    const trace = resolveRequestTrace(ctx.request);

    return runWithLogContext(getRequestTraceLogContext(ctx.request, trace), async () => {
      const response = await defaultStreamHandler(ctx);
      return withTraceHeaders(response, trace);
    });
  },
});

export default createServerEntry({ fetch });
