// Email clients
export { createResendClient, ResendEmailClient } from "./resend";
export { createSMTPClient, SMTPEmailClient } from "./smtp";

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
