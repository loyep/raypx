import { env } from "./env";
import { ResendEmailClient } from "./resend";
import { parseSmtpUrl, SMTPEmailClient } from "./smtp";
import { EmailError } from "./types";

export function createResendClient(): ResendEmailClient {
  if (!env.RESEND_API_KEY) {
    throw new EmailError("INVALID_CONFIGURATION", "Missing RESEND_API_KEY");
  }

  return new ResendEmailClient({
    apiKey: env.RESEND_API_KEY,
    fromEmail: env.EMAIL_FROM || "noreply@example.com",
    fromName: env.EMAIL_FROM_NAME,
  });
}

export function createSMTPClient(): SMTPEmailClient {
  const parsedUrlConfig = env.SMTP_URL ? parseSmtpUrl(env.SMTP_URL) : null;
  const host = parsedUrlConfig?.host;
  const port = parsedUrlConfig?.port ?? 587;
  const user = parsedUrlConfig?.user;
  const password = parsedUrlConfig?.password;
  const secure = parsedUrlConfig?.secure ?? false;

  if (!host || !user || !password) {
    throw new EmailError("INVALID_CONFIGURATION", "Missing SMTP_URL");
  }

  return new SMTPEmailClient({
    host,
    port,
    secure,
    user,
    password,
    fromEmail: env.EMAIL_FROM || "noreply@example.com",
    fromName: env.EMAIL_FROM_NAME,
  });
}
