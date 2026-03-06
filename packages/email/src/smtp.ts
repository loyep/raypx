import { render } from "@react-email/render";
import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";

import type { EmailOptions, EmailResult, SMTPConfig } from "./types";
import { EmailError } from "./types";

/**
 * SMTP email client using nodemailer
 */
export class SMTPEmailClient {
  private transporter: Transporter;
  private fromEmail: string;
  private fromName?: string;

  constructor(config: SMTPConfig) {
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure ?? config.port === 465,
      auth: {
        user: config.user,
        pass: config.password,
      },
    });
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    try {
      // Prepare HTML content
      let html = options.html;
      if (options.react) {
        html = await render(options.react);
      }

      if (!html && !options.text) {
        throw new EmailError(
          "MISSING_CONTENT",
          "Email must have either html, react, or text content",
        );
      }

      // Format recipients
      const to = this.formatRecipients(options.to);
      const cc = options.cc ? this.formatRecipients(options.cc) : undefined;
      const bcc = options.bcc ? this.formatRecipients(options.bcc) : undefined;

      // Format from address
      const from = this.fromName ? `${this.fromName} <${this.fromEmail}>` : this.fromEmail;

      const result = await this.transporter.sendMail({
        from,
        to,
        cc,
        bcc,
        replyTo: options.replyTo ? this.formatRecipients(options.replyTo) : undefined,
        subject: options.subject,
        html: html ?? undefined,
        text: options.text,
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content,
          contentType: a.contentType,
        })),
        headers: options.headers,
      });

      return {
        id: result.messageId,
        success: true,
      };
    } catch (error) {
      if (error instanceof EmailError) throw error;

      return {
        id: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format recipient(s) for nodemailer
   */
  private formatRecipients(recipient: EmailOptions["to"]): string {
    if (Array.isArray(recipient)) {
      return recipient.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email)).join(", ");
    }
    return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
  }
}

/**
 * Create an SMTP client from environment
 */
export function createSMTPClient(): SMTPEmailClient {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number.parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const fromEmail = process.env.EMAIL_FROM ?? "noreply@example.com";
  const fromName = process.env.EMAIL_FROM_NAME;

  if (!host || !user || !password) {
    throw new EmailError(
      "INVALID_CONFIGURATION",
      "Missing SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)",
    );
  }

  return new SMTPEmailClient({
    host,
    port,
    user,
    password,
    fromEmail,
    fromName,
  });
}
