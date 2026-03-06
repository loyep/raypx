import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSPlugin } from "@orpc/server/plugins";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { authEnv, createEnv } from "@raypx/config/envs";
import { createLogger } from "@raypx/logger";
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

        log.debug(`--> ${request.method} ${path}`);

        return next().then((result) => {
          const duration = Date.now() - start;

          if (result.matched && result.response) {
            log.info(`<-- ${request.method} ${path} ${result.response.status} ${duration}ms`);
          } else {
            log.debug(`<-- ${request.method} ${path} no match ${duration}ms`);
          }

          return result;
        });
      },
      onError((error: unknown) => {
        if (error instanceof Error) {
          log.error("RPC Error:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        } else {
          log.error("RPC Error (unknown):", error);
        }
      }),
    ],
  });

  const apiHandler = new OpenAPIHandler(appRouter, {
    plugins: [
      new OpenAPIReferencePlugin({
        schemaConverters: [new ZodToJsonSchemaConverter()],
      }),
    ],
    interceptors: [
      onError((error: unknown) => {
        if (error instanceof Error) {
          log.error("OpenAPI Error:", {
            name: error.name,
            message: error.message,
            stack: error.stack,
          });
        } else {
          log.error("OpenAPI Error (unknown):", error);
        }
      }),
    ],
  });

  return async ({ request }: { request: Request }) => {
    const rpcResult = await rpcHandler.handle(request, {
      prefix: props.prefix,
      context: await createContext({ req: request }),
    });
    if (rpcResult.response) return rpcResult.response;

    const apiResult = await apiHandler.handle(request, {
      prefix: `${props.prefix}/api-reference`,
      context: await createContext({ req: request }),
    });
    if (apiResult.response) return apiResult.response;

    return new Response("Not found", { status: 404 });
  };
};
