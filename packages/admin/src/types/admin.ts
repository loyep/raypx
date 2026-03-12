export type AdminUserRole = "admin" | "user" | "superadmin";

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  banned: boolean | null;
  banReason: string | null;
  banExpires: Date | null;
  username: string | null;
  createdAt: Date;
  emailVerified: boolean;
};

export type AdminUsersListInput = {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: AdminUserRole;
  banned?: boolean;
};

export type AdminUsersListResult = {
  users: AdminUser[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type AdminUserUpdateInput = {
  id: string;
  role?: AdminUserRole;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date | null;
};

export type AdminUserStats = {
  total: number;
  admins: number;
  banned: number;
  verified: number;
};

export type AdminKeyPoolSummary = {
  totalProviders: number;
  configuredKeys: number;
  enabledProviders: number;
  defaultProviderName: string | null;
};

export type AdminPromptPolicySummary = {
  totalProfiles: number;
  systemProfiles: number;
  modeProfiles: number;
  spaceProfiles: number;
  userProfiles: number;
};

export type AdminUsageOverview = {
  totalCalls: number;
  totalTokens: number;
  totalCostUsdCents: number;
  activeSubscriptions: number;
  userProviders: number;
};
