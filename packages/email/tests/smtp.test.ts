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
async function loadEmailModule() {
  vi.resetModules();
  return import("../src");
}

describe("email smtp client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an smtp client from SMTP_URL", async () => {
    vi.stubEnv("SMTP_URL", "smtp://mailer:secret@smtp.raypx.com:2525");
    const { createSMTPClient } = await loadEmailModule();
    const { SMTPEmailClient } = await import("../src/smtp");

    expect(await createSMTPClient()).toBeInstanceOf(SMTPEmailClient);
    expect(createTransportMock).toHaveBeenCalledWith("smtp://mailer:secret@smtp.raypx.com:2525");
  });

  it("rejects missing smtp configuration", async () => {
    vi.stubEnv("SMTP_URL", "");
    const { createSMTPClient } = await loadEmailModule();

    await expect(createSMTPClient()).rejects.toThrow("Missing SMTP_URL");
  });

  it("supports smtps URLs and encoded credentials", async () => {
    vi.stubEnv("SMTP_URL", "smtps://mailer%40raypx.com:sec%2Fret@smtp.raypx.com");
    const { createSMTPClient } = await loadEmailModule();
    const { SMTPEmailClient } = await import("../src/smtp");

    expect(await createSMTPClient()).toBeInstanceOf(SMTPEmailClient);
    expect(createTransportMock).toHaveBeenCalledWith(
      "smtps://mailer%40raypx.com:sec%2Fret@smtp.raypx.com",
    );
  });

  it("formats recipients and returns message ids", async () => {
    const { SMTPEmailClient } = await import("../src/smtp");
    sendMailMock.mockResolvedValue({ messageId: "smtp_1" });

    const client = new SMTPEmailClient({
      url: "smtp://mailer:secret@smtp.raypx.com:2525",
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
    const { SMTPEmailClient } = await import("../src/smtp");
    verifyMock.mockResolvedValueOnce(true);
    verifyMock.mockRejectedValueOnce(new Error("nope"));

    const client = new SMTPEmailClient({
      url: "smtps://mailer:secret@smtp.raypx.com",
      fromEmail: "hello@raypx.com",
    });

    await expect(client.verify()).resolves.toBe(true);
    await expect(client.verify()).resolves.toBe(false);
  });
});
