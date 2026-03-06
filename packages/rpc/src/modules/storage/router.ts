import { storageService } from "../../application/storage/service";
import { protectedProcedure } from "../../transport/middleware";

export const storageRouter = {
  avatar: {
    delete: protectedProcedure.handler(async ({ context }) => {
      return storageService.deleteAvatar(context);
    }),
  },
};
