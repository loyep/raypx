import { ok } from "../../contracts/response";
import { protectedProcedure } from "../../transport/middleware";

export const sessionRouter = {
  me: protectedProcedure.handler(({ context }) => {
    return ok({
      message: "This is private",
      user: context.session?.user,
    });
  }),
};
