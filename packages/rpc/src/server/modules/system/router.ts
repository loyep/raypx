import { systemService } from "../../application/system/service";
import { ok } from "../../contracts/response";
import { o } from "../../transport/middleware";

export const systemRouter = {
  health: o.handler(() => ok("OK")),
  healthDetail: o.handler(async () => ok(await systemService.health())),
};
