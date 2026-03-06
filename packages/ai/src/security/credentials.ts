import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { aiEnv, createEnv } from "@raypx/config/envs";

const env = createEnv(aiEnv);
const ALGO = "aes-256-gcm";

function getSecretKey(): Buffer {
  const secret = env.APP_KEY?.trim() || env.AI_CREDENTIALS_SECRET?.trim();
  if (!secret) {
    throw new Error("APP_KEY (or AI_CREDENTIALS_SECRET) is not configured");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptCredential(plainText: string): string {
  const key = getSecretKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${encrypted.toString("base64")}.${tag.toString("base64")}`;
}

export function decryptCredential(cipherText: string): string {
  const [ivBase64, encryptedBase64, tagBase64] = cipherText.split(".");
  if (!ivBase64 || !encryptedBase64 || !tagBase64) {
    throw new Error("Invalid encrypted credential format");
  }

  const key = getSecretKey();
  const iv = Buffer.from(ivBase64, "base64");
  const encrypted = Buffer.from(encryptedBase64, "base64");
  const tag = Buffer.from(tagBase64, "base64");
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return plain.toString("utf8");
}

export function getCredentialHint(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length <= 6) {
    return `${trimmed.slice(0, 1)}***`;
  }
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-3)}`;
}
