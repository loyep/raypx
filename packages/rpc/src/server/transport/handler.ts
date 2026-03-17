import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { authEnv, createEnv } from "@raypx/config/envs";
import {
  createLogger,
  getRequestTraceLogContext,
  resolveRequestTrace,
  runWithLogContext,
  withTraceHeaders,
} from "@raypx/core/logger";
import { appRouter } from "../routers";
import { createContext } from "./context";

const log = createLogger({ tag: "rpc" });

const env = createEnv(authEnv);
const allowedOrigins =
  env.ALLOWED_ORIGINS?.split(",")
    .map((o: string) => o.trim())
    .filter(Boolean) ?? [];

export const createHandler = (props: { prefix: `/${string}` }) => {
  const rpcHandler = new RPCHandler(appRouter, {
    plugins: [
      new CORSPlugin({
        origin: (origin) => {
          if (allowedOrigins.length > 0) {
            return allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
          }
          return origin;
        },
        allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH", "OPTIONS", "ANY"],
      }),
    ],
    interceptors: [
      ({ request, next }) => {
        const start = Date.now();
        const url = new URL(request.url);
        const path = url.pathname;
        const trace = resolveRequestTrace(request);

        log.debug(
          {
            method: request.method,
            path,
            requestId: trace.requestId,
            traceId: trace.traceId,
          },
          "RPC request started",
        );

        return next().then((result) => {
          const duration = Date.now() - start;

          if (result.matched && result.response) {
            log.info(
              {
                durationMs: duration,
                method: request.method,
                path,
                requestId: trace.requestId,
                statusCode: result.response.status,
                traceId: trace.traceId,
              },
              "RPC request completed",
            );
          } else {
            log.debug(
              {
                durationMs: duration,
                method: request.method,
                path,
                requestId: trace.requestId,
                traceId: trace.traceId,
              },
              "RPC request had no match",
            );
          }

          return result;
        });
      },
      onError(() => undefined),
    ],
  });

  const apiHandler = new OpenAPIHandler(appRouter, {
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
      }),
    ],
    interceptors: [onError(() => undefined)],
  });

  return async ({ request }: { request: Request }) => {
    const trace = resolveRequestTrace(request);

    return runWithLogContext(getRequestTraceLogContext(request, trace), async () => {
      try {
        const rpcResult = await rpcHandler.handle(request, {
          prefix: props.prefix,
          context: await createContext({ req: request, trace }),
        });
        if (rpcResult.response) return withTraceHeaders(rpcResult.response, trace);

        const apiResult = await apiHandler.handle(request, {
          prefix: `${props.prefix}/api-reference`,
          context: await createContext({ req: request, trace }),
        });
        if (apiResult.response) return withTraceHeaders(apiResult.response, trace);

        return withTraceHeaders(new Response("Not found", { status: 404 }), trace);
      } catch (error) {
        if (error instanceof Error) {
          log.error(
            {
              err: error,
            },
            "RPC handler failed",
          );
        } else {
          log.error(
            {
              error,
            },
            "RPC handler failed with unknown error",
          );
        }
        throw error;
      }
    });
  };
};
