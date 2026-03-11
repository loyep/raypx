import { render } from "@react-email/render";
import type { CreateEmailOptions } from "resend";
import { Resend } from "resend";

import type { EmailOptions, EmailResult, ResendConfig } from "./types";
import { EmailError } from "./types";

/**
 * Resend email client
 */
export class ResendEmailClient {
  private client: Resend;
  private fromEmail: string;
  private fromName?: string;

  constructor(config: ResendConfig) {
    this.client = new Resend(config.apiKey);
    this.fromEmail = config.fromEmail;
    this.fromName = config.fromName;
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

      // Build email payload - use type assertion to handle conditional properties
      const payload: CreateEmailOptions = {
        from,
        to,
        cc,
        bcc,
        replyTo: options.replyTo ? this.formatRecipients(options.replyTo) : undefined,
        subject: options.subject,
        html: html ?? "",
        attachments: options.attachments?.map((a) => ({
          filename: a.filename,
          content: a.content instanceof Buffer ? a.content : Buffer.from(a.content),
        })),
        headers: options.headers,
        tags: options.tags
          ? Object.entries(options.tags).map(([name, value]) => ({ name, value }))
          : undefined,
      };

      const { data, error } = await this.client.emails.send(payload);

      if (error) {
        return {
          id: "",
          success: false,
          error: error.message,
        };
      }

      return {
        id: data?.id ?? "",
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
   * Format recipient(s) for Resend API
   */
  private formatRecipients(recipient: EmailOptions["to"]): string | string[] {
    if (Array.isArray(recipient)) {
      return recipient.map((r) => (r.name ? `${r.name} <${r.email}>` : r.email));
    }
    return recipient.name ? `${recipient.name} <${recipient.email}>` : recipient.email;
  }
}
