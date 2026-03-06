import { eq } from "@raypx/database";
import { user as User } from "@raypx/database/schemas";

export const storageService = {
  async deleteAvatar(context: { db: any; session: { user: { id: string } } }) {
    await context.db
      .update(User)
      .set({
        image: null,
        updatedAt: new Date(),
      })
      .where(eq(User.id, context.session.user.id));

    return { success: true };
  },
};
