import { env } from "./env";
import { ResendEmailClient } from "./resend";
import { SMTPEmailClient } from "./smtp";
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
  if (!env.SMTP_URL) {
    throw new EmailError("INVALID_CONFIGURATION", "Missing SMTP_URL");
  }

  return new SMTPEmailClient({
    url: env.SMTP_URL,
    fromEmail: env.EMAIL_FROM || "noreply@example.com",
    fromName: env.EMAIL_FROM_NAME,
  });
}
