import { generateAllComponentExports, logger } from "../utils";

export async function runUiGenerate(): Promise<void> {
  const start = Date.now();
  logger.info("Generating UI component exports...");
  await generateAllComponentExports();
  logger.success(`✓ UI exports generated in ${Date.now() - start}ms`);
}
