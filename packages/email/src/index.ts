// Email clients
export { createResendClient, createSMTPClient } from "./client";
export { ResendEmailClient } from "./resend";
export { SMTPEmailClient } from "./smtp";

// Email templates
export {
  BaseEmail,
  DeleteAccountEmail,
  EmailFooter,
  EmailHeader,
  emailTemplates,
  PasswordResetEmail,
  VerificationEmail,
  WelcomeEmail,
} from "./templates";

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
