/**
 * @raypx/email - Server-only (Resend, Nodemailer)
 * SMTP/nodemailer is loaded dynamically, not from main export.
 */
export { createResendClient, createSMTPClient, isEmailConfigured, sendEmail } from "./client";
export { ResendEmailClient } from "./resend";

// Types
export type {
  EmailAttachment,
  EmailConfig,
  EmailErrorType,
  EmailOptions,
  EmailProvider,
  EmailRecipient,
  EmailResult,
  ResendConfig,
  SMTPConfig,
} from "./types";
export { EmailError } from "./types";
