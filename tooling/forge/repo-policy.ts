export interface RepoPolicy {
  testing?: {
    required?: string[];
    allowNoTests?: string[];
  };
}

export const repoPolicy: RepoPolicy = {
  testing: {
    required: [
      "apps/web",
      "packages/admin",
      "packages/ai",
      "packages/auth",
      "packages/config",
      "packages/core",
      "packages/database",
      "packages/design-system",
      "packages/email",
      "packages/i18n",
      "packages/observability",
      "packages/rpc",
      "packages/seo",
      "packages/shared",
      "packages/storage",
      "packages/stripe",
      "packages/telemetry",
      "tooling/forge",
    ],
    allowNoTests: [],
  },
};
