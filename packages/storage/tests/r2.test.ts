import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", () => ({
  DeleteObjectCommand: class DeleteObjectCommand {
    constructor(public input: unknown) {}
  },
  GetObjectCommand: class GetObjectCommand {
    constructor(public input: unknown) {}
  },
  HeadObjectCommand: class HeadObjectCommand {
    constructor(public input: unknown) {}
  },
  PutObjectCommand: class PutObjectCommand {
    constructor(public input: unknown) {}
  },
  S3Client: class S3Client {
    send = sendMock;
  },
}));

vi.mock("nanoid", () => ({
  nanoid: vi.fn(() => "fixed-file-id"),
}));

import { createR2Storage, R2Storage } from "../src";
import { StorageError } from "../src/types";

describe("storage r2 client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects invalid configuration from env", () => {
    vi.stubEnv("R2_ACCOUNT_ID", "");
    vi.stubEnv("R2_ACCESS_KEY_ID", "");
    vi.stubEnv("R2_SECRET_ACCESS_KEY", "");
    vi.stubEnv("R2_BUCKET", "");

    expect(() => createR2Storage()).toThrowError(
      new StorageError("INVALID_CONFIGURATION", "Missing R2 configuration"),
    );
  });

  it("uploads files and returns a public url when requested", async () => {
    sendMock.mockResolvedValue({ ETag: '"etag-1"' });

    const storage = new R2Storage({
      accountId: "account-id",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
      bucket: "assets",
      publicUrl: "https://cdn.raypx.com",
    });

    const result = await storage.upload(Buffer.from("hello"), {
      public: true,
      contentType: "text/plain",
      key: "docs/hello.txt",
    });

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      key: "docs/hello.txt",
      url: "https://cdn.raypx.com/docs/hello.txt",
      size: 5,
      contentType: "text/plain",
      etag: '"etag-1"',
    });
  });

  it("rejects oversized uploads before sending to S3", async () => {
    const storage = new R2Storage({
      accountId: "account-id",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
      bucket: "assets",
    });

    await expect(
      storage.upload(Buffer.from("hello"), {
        maxFileSize: 4,
      }),
    ).rejects.toMatchObject({
      type: "FILE_TOO_LARGE",
    });

    expect(sendMock).not.toHaveBeenCalled();
  });

  it("reads file metadata and generates fallback public urls", async () => {
    sendMock.mockResolvedValueOnce({
      ContentLength: 12,
      ContentType: "image/png",
      LastModified: new Date("2026-03-10T00:00:00.000Z"),
      ETag: '"etag-2"',
      Metadata: { alt: "logo" },
    });

    const storage = new R2Storage({
      accountId: "account-id",
      accessKeyId: "access-key",
      secretAccessKey: "secret-key",
      bucket: "assets",
    });

    await expect(storage.getFileInfo("images/logo.png")).resolves.toEqual({
      key: "images/logo.png",
      size: 12,
      contentType: "image/png",
      lastModified: new Date("2026-03-10T00:00:00.000Z"),
      etag: '"etag-2"',
      metadata: { alt: "logo" },
    });

    expect(storage.getPublicUrl("images/logo.png")).toBe(
      "https://assets.account-id.r2.cloudflarestorage.com/images/logo.png",
    );
  });
});
