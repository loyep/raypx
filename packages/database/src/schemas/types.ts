import type * as schema from "./pg";
import type { relations } from "./pg/relations";

export type Relations = typeof relations;
export type Schema = typeof schema;
