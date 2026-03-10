import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendEmailMock, renderMock } = vi.hoisted(() => ({
  sendEmailMock: vi.fn(),
  renderMock: vi.fn(async () => "<p>Rendered</p>"),
}));

vi.mock("@react-email/render", () => ({
  render: renderMock,
}));

vi.mock("resend", () => ({
  Resend: class Resend {
    emails = {
      send: sendEmailMock,
    };

    constructor(public apiKey: string) {}
  },
}));

import { createResendClient, EmailError, ResendEmailClient } from "../src";

describe("email resend client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a resend client from env", () => {
    vi.stubEnv("RESEND_API_KEY", "re_test_123");
    vi.stubEnv("EMAIL_FROM", "hello@raypx.com");
    vi.stubEnv("EMAIL_FROM_NAME", "Raypx");

    expect(createResendClient()).toBeInstanceOf(ResendEmailClient);
  });

  it("rejects missing resend configuration", () => {
    vi.stubEnv("RESEND_API_KEY", "");

    expect(() => createResendClient()).toThrowError(
      new EmailError("INVALID_CONFIGURATION", "Missing RESEND_API_KEY"),
    );
  });

  it("formats recipients, tags, and react content for resend", async () => {
    sendEmailMock.mockResolvedValue({
      data: { id: "email_1" },
      error: null,
    });

    const client = new ResendEmailClient({
      apiKey: "re_test_123",
      fromEmail: "hello@raypx.com",
      fromName: "Raypx",
    });

    const result = await client.send({
      to: [{ email: "user@raypx.com", name: "User" }],
      cc: { email: "cc@raypx.com" },
      bcc: { email: "bcc@raypx.com", name: "Bcc" },
      replyTo: { email: "reply@raypx.com", name: "Support" },
      subject: "Welcome",
      react: {} as any,
      attachments: [{ filename: "hello.txt", content: "hello" }],
      headers: { "x-trace-id": "trace-1" },
      tags: { feature: "onboarding" },
    });

    expect(renderMock).toHaveBeenCalledTimes(1);
    expect(sendEmailMock).toHaveBeenCalledWith({
      from: "Raypx <hello@raypx.com>",
      to: ["User <user@raypx.com>"],
      cc: "cc@raypx.com",
      bcc: "Bcc <bcc@raypx.com>",
      replyTo: "Support <reply@raypx.com>",
      subject: "Welcome",
      html: "<p>Rendered</p>",
      attachments: [
        {
          filename: "hello.txt",
          content: Buffer.from("hello"),
        },
      ],
      headers: { "x-trace-id": "trace-1" },
      tags: [{ name: "feature", value: "onboarding" }],
    });
    expect(result).toEqual({
      id: "email_1",
      success: true,
    });
  });

  it("throws when no content is provided", async () => {
    const client = new ResendEmailClient({
      apiKey: "re_test_123",
      fromEmail: "hello@raypx.com",
    });

    await expect(
      client.send({
        to: { email: "user@raypx.com" },
        subject: "Missing content",
      }),
    ).rejects.toBeInstanceOf(EmailError);
  });
});
