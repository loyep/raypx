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
    this.transporter = nodemailer.createTransport(config.url);
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
