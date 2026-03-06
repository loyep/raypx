import { aiRelations } from "./ai";
import { authRelations } from "./auth";
import { billingRelations } from "./billing";

export const relations = {
  ...aiRelations,
  ...authRelations,
  ...billingRelations,
};
