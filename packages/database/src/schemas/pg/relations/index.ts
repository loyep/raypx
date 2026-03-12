import { aiRelations } from "./ai";
import { authRelations } from "./auth";
import { billingRelations } from "./billing";
import { workspaceRelations } from "./workspace";

export const relations = {
  ...aiRelations,
  ...authRelations,
  ...billingRelations,
  ...workspaceRelations,
};
