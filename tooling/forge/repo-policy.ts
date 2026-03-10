export interface RepoPolicy {
  testing?: {
    required?: string[];
    allowNoTests?: string[];
  };
  operability?: {
    requiredScripts?: string[];
    allowMissingScripts?: Record<string, string[]>;
    buildable?: string[];
    sourceOnly?: string[];
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
  operability: {
    requiredScripts: ["clean", "typecheck", "test"],
    allowMissingScripts: {
      "tooling/tsconfig": ["clean", "typecheck", "test"],
    },
    buildable: ["apps/web"],
    sourceOnly: [
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
      "tooling/tsconfig",
    ],
  },
};
