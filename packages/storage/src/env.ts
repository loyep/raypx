import { createEnv, storageEnv } from "@raypx/config";
import { R2Storage } from "./r2";
import { StorageError } from "./types";

export function createR2Storage(): R2Storage {
  const env = createEnv({
    ...storageEnv,
    skip: true,
  });

  if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY || !env.R2_BUCKET) {
    throw new StorageError("INVALID_CONFIGURATION", "Missing R2 configuration");
  }

  return new R2Storage({
    accountId: env.R2_ACCOUNT_ID,
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    bucket: env.R2_BUCKET,
    publicUrl: env.R2_PUBLIC_URL,
  });
}
