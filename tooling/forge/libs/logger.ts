import { createConsola } from "consola";

const forgeLogger = createConsola({}).withTag("forge");
export const logger = forgeLogger;
