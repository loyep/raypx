import { db, schemas } from "@raypx/database";

export const systemService = {
  async health() {
    const start = performance.now();
    const userCount = await db.$count(schemas.user);
    const end = performance.now();

    return {
      status: "OK" as const,
      duration: `${end - start}ms`,
      userCount,
    };
  },
};
