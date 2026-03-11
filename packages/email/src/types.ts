import type { ReactElement } from "react";

/**
 * Email provider types
 */
export type EmailProvider = "resend" | "smtp";

/**
 * Email recipient
 */
export interface EmailRecipient {
  email: string;
  name?: string;
}

/**
 * Email attachment
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
}

/**
 * Email options
 */
export interface EmailOptions {
  /**
   * Recipient email addresses
   */
  to: EmailRecipient | EmailRecipient[];

  /**
   * CC recipients
   */
  cc?: EmailRecipient | EmailRecipient[];

  /**
   * BCC recipients
   */
  bcc?: EmailRecipient | EmailRecipient[];

  /**
   * Reply-to address
   */
  replyTo?: EmailRecipient;

  /**
   * Email subject
   */
  subject: string;

  /**
   * Plain text content
   */
  text?: string;

  /**
   * HTML content (mutually exclusive with react component)
   */
  html?: string;

  /**
   * React email component (mutually exclusive with html)
   */
  react?: ReactElement;

  /**
   * File attachments
   */
  attachments?: EmailAttachment[];

  /**
   * Custom headers
   */
  headers?: Record<string, string>;

  /**
   * Email tags (for tracking in Resend)
   */
  tags?: Record<string, string>;
}

/**
 * Email send result
 */
export interface EmailResult {
  /**
   * Message ID from the provider
   */
  id: string;

  /**
   * Whether the email was sent successfully
   */
  success: boolean;

  /**
   * Error message if failed
   */
  error?: string;
}

/**
 * Resend configuration
 */
export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName?: string;
}

export interface SMTPConfig {
  url: string;
  fromEmail: string;
  fromName?: string;
}

/**
 * Email configuration
 */
export interface EmailConfig {
  provider: EmailProvider;
  resend?: ResendConfig;
  smtp?: SMTPConfig;
}

/**
 * Email error types
 */
export type EmailErrorType =
  | "INVALID_RECIPIENT"
  | "MISSING_CONTENT"
  | "SEND_FAILED"
  | "INVALID_CONFIGURATION"
  | "TEMPLATE_NOT_FOUND";

/**
 * Custom email error class
 */
export class EmailError extends Error {
  constructor(
    public type: EmailErrorType,
    message: string,
  ) {
    super(message);
    this.name = "EmailError";
  }
}
