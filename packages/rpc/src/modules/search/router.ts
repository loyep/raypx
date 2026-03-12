import { z } from "zod";
import { searchService } from "../../application/search/service";
import { ok } from "../../contracts/response";
import { protectedProcedure } from "../../transport/middleware";

export const searchRouter = {
  webSearch: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(400),
        limit: z.number().int().min(1).max(10).default(5),
        spaceId: z.string().uuid().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const result = await searchService.webSearch(context, input);
      return ok(result);
    }),
  citations: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().uuid().optional(),
        spaceId: z.string().uuid().optional(),
      }),
    )
    .handler(async ({ context, input }) => {
      const result = await searchService.listCitations(context, input);
      return ok(result);
    }),
  retrieveFromSpace: protectedProcedure
    .input(
      z.object({
        spaceId: z.string().uuid(),
        query: z.string().min(1).max(200),
        limit: z.number().int().min(1).max(20).default(8),
      }),
    )
    .handler(async ({ context, input }) => {
      const result = await searchService.retrieveFromSpace(context, input);
      return ok(result);
    }),
};
