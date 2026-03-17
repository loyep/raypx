import { ok } from "../../contracts/response";
import { o } from "../../transport/middleware";

export const systemRouter = {
  health: o.handler(() => ok("OK")),
};
