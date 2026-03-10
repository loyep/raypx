import { beforeEach, describe, expect, it, vi } from "vitest";

const { renderMock, sendMailMock, verifyMock, createTransportMock } = vi.hoisted(() => ({
  renderMock: vi.fn(async () => "<p>Rendered</p>"),
  sendMailMock: vi.fn(),
  verifyMock: vi.fn(),
  createTransportMock: vi.fn(),
}));

createTransportMock.mockImplementation(() => ({
  sendMail: sendMailMock,
  verify: verifyMock,
}));

vi.mock("@react-email/render", () => ({
  render: renderMock,
}));

vi.mock("nodemailer", () => ({
  default: {
    createTransport: createTransportMock,
  },
}));

import { createSMTPClient, EmailError, SMTPEmailClient } from "../src";

describe("email smtp client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an smtp client from env", () => {
    vi.stubEnv("SMTP_HOST", "smtp.raypx.com");
    vi.stubEnv("SMTP_PORT", "2525");
    vi.stubEnv("SMTP_USER", "mailer");
    vi.stubEnv("SMTP_PASSWORD", "secret");

    expect(createSMTPClient()).toBeInstanceOf(SMTPEmailClient);
  });

  it("rejects missing smtp configuration", () => {
    vi.stubEnv("SMTP_HOST", "");
    vi.stubEnv("SMTP_USER", "");
    vi.stubEnv("SMTP_PASSWORD", "");

    expect(() => createSMTPClient()).toThrowError(
      new EmailError(
        "INVALID_CONFIGURATION",
        "Missing SMTP configuration (SMTP_HOST, SMTP_USER, SMTP_PASSWORD)",
      ),
    );
  });

  it("formats recipients and returns message ids", async () => {
    sendMailMock.mockResolvedValue({ messageId: "smtp_1" });

    const client = new SMTPEmailClient({
      host: "smtp.raypx.com",
      port: 2525,
      user: "mailer",
      password: "secret",
      fromEmail: "hello@raypx.com",
      fromName: "Raypx",
    });

    const result = await client.send({
      to: [{ email: "user@raypx.com", name: "User" }, { email: "ops@raypx.com" }],
      replyTo: { email: "support@raypx.com" },
      subject: "Reset",
      react: {} as any,
    });

    expect(sendMailMock).toHaveBeenCalledWith({
      from: "Raypx <hello@raypx.com>",
      to: "User <user@raypx.com>, ops@raypx.com",
      cc: undefined,
      bcc: undefined,
      replyTo: "support@raypx.com",
      subject: "Reset",
      html: "<p>Rendered</p>",
      text: undefined,
      attachments: undefined,
      headers: undefined,
    });
    expect(result).toEqual({
      id: "smtp_1",
      success: true,
    });
  });

  it("reports verification state from the transporter", async () => {
    verifyMock.mockResolvedValueOnce(true);
    verifyMock.mockRejectedValueOnce(new Error("nope"));

    const client = new SMTPEmailClient({
      host: "smtp.raypx.com",
      port: 465,
      user: "mailer",
      password: "secret",
      fromEmail: "hello@raypx.com",
    });

    await expect(client.verify()).resolves.toBe(true);
    await expect(client.verify()).resolves.toBe(false);
  });
});
