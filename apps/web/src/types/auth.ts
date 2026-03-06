/**
 * Extended user type that includes custom fields from the database
 * These fields are not part of Better Auth's default User type
 */
export type ExtendedUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Custom fields
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  username?: string | null;
  displayUsername?: string | null;
};

/**
 * Helper function to check if user is admin
 */
export const isAdmin = (user: { role?: string | null } | undefined | null): boolean => {
  return user?.role === "admin";
};
