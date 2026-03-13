// Email clients
export { createResendClient, createSMTPClient, isEmailConfigured, sendEmail } from "./client";
export { ResendEmailClient } from "./resend";
export { SMTPEmailClient } from "./smtp";

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
