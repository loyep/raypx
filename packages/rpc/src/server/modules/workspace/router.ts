import { z } from "zod";
import { workspaceService } from "../../application/workspace/service";
import { ok } from "../../contracts/response";
import { protectedProcedure } from "../../transport/middleware";

const spaceInputSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  colorToken: z.string().max(40).nullable().optional(),
  icon: z.string().max(40).nullable().optional(),
  defaultProviderId: z.string().uuid().nullable().optional(),
  promptProfileId: z.string().uuid().nullable().optional(),
});

export const workspaceRouter = {
  spaces: {
    list: protectedProcedure.handler(async ({ context }) => {
      const items = await workspaceService.listSpaces(context);
      return ok({ spaces: items });
    }),
    get: protectedProcedure
      .input(z.object({ spaceId: z.string().uuid() }))
      .handler(async ({ context, input }) => {
        const space = await workspaceService.getSpace(context, input);
        return ok({ space });
      }),
    create: protectedProcedure.input(spaceInputSchema).handler(async ({ context, input }) => {
      const space = await workspaceService.createSpace(context, input);
      return ok({ space });
    }),
    update: protectedProcedure
      .input(
        spaceInputSchema.extend({ spaceId: z.string().uuid(), isArchived: z.boolean().optional() }),
      )
      .handler(async ({ context, input }) => {
        const space = await workspaceService.updateSpace(context, input);
        return ok({ space });
      }),
    delete: protectedProcedure
      .input(z.object({ spaceId: z.string().uuid() }))
      .handler(async ({ context, input }) => {
        const space = await workspaceService.deleteSpace(context, input);
        return ok({ space });
      }),
  },
  spaceFiles: {
    list: protectedProcedure
      .input(z.object({ spaceId: z.string().uuid(), query: z.string().max(160).optional() }))
      .handler(async ({ context, input }) => {
        const files = await workspaceService.listSpaceFiles(context, input);
        return ok({ files });
      }),
  },
  spaceThreads: {
    list: protectedProcedure
      .input(z.object({ spaceId: z.string().uuid() }))
      .handler(async ({ context, input }) => {
        const threads = await workspaceService.listSpaceThreads(context, input);
        return ok({ threads });
      }),
  },
};
