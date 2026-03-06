import { and, count, eq, gte } from "@raypx/database";
import { apikey, session } from "@raypx/database/schemas";

export const dashboardService = {
  async stats(context: { db: any; user: { id: string } }) {
    const userId = context.user.id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [apiKeysResult, sessionsResult] = await Promise.all([
      context.db.select({ count: count() }).from(apikey).where(eq(apikey.userId, userId)),
      context.db
        .select({ count: count() })
        .from(session)
        .where(and(eq(session.userId, userId), gte(session.createdAt, monthStart))),
    ]);

    return {
      apiKeys: apiKeysResult[0]?.count ?? 0,
      sessionsThisMonth: sessionsResult[0]?.count ?? 0,
      storage: {
        used: 0,
        limit: 100 * 1024 * 1024,
      },
    };
  },

  async activity(context: { db: any; user: { id: string } }) {
    const userId = context.user.id;
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const sessions = await context.db
      .select({ createdAt: session.createdAt })
      .from(session)
      .where(and(eq(session.userId, userId), gte(session.createdAt, sevenDaysAgo)));

    const activityMap = new Map<string, number>();
    for (const item of sessions) {
      if (item.createdAt) {
        const date = item.createdAt.toISOString().split("T")[0] as string;
        activityMap.set(date, (activityMap.get(date) ?? 0) + 1);
      }
    }

    const activity: Array<{ date: string; count: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split("T")[0] as string;
      activity.push({ date: dateStr, count: activityMap.get(dateStr) ?? 0 });
    }

    return activity;
  },
};
