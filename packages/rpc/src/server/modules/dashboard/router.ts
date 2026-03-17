import { dashboardService } from "../../application/dashboard/service";
import { protectedProcedure } from "../../transport/middleware";

export const dashboardRouter = {
  stats: protectedProcedure.handler(async ({ context }) => {
    return dashboardService.stats(context);
  }),

  activity: protectedProcedure.handler(async ({ context }) => {
    return dashboardService.activity(context);
  }),
};
