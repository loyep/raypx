import { env } from "./env";
import { ResendEmailClient } from "./resend";
import { SMTPEmailClient } from "./smtp";
import type { EmailOptions, EmailResult } from "./types";
import { EmailError } from "./types";

let _defaultClient: ResendEmailClient | SMTPEmailClient | null = null;

/**
 * Check if email is configured (Resend or SMTP)
 */
export function isEmailConfigured(): boolean {
  return Boolean(env.RESEND_API_KEY || env.SMTP_URL);
}

function getDefaultClient(): ResendEmailClient | SMTPEmailClient {
  if (_defaultClient) return _defaultClient;
  if (env.RESEND_API_KEY) {
    _defaultClient = new ResendEmailClient({
      apiKey: env.RESEND_API_KEY,
      fromEmail: env.EMAIL_FROM || "noreply@example.com",
      fromName: env.EMAIL_FROM_NAME,
    });
  } else if (env.SMTP_URL) {
    _defaultClient = new SMTPEmailClient({
      url: env.SMTP_URL,
      fromEmail: env.EMAIL_FROM || "noreply@example.com",
      fromName: env.EMAIL_FROM_NAME,
    });
  } else {
    throw new EmailError("INVALID_CONFIGURATION", "Set RESEND_API_KEY or SMTP_URL to send emails");
  }
  return _defaultClient;
}

/**
 * Send an email using the default client (Resend or SMTP).
 * Use void sendEmail(...) to avoid awaiting (e.g. in auth callbacks) and prevent timing attacks.
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const client = getDefaultClient();
  return client.send(options);
}

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
