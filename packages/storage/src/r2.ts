import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  type PutObjectCommandInput,
  S3Client,
} from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";

import type { FileInfo, StorageConfig, UploadOptions, UploadResult } from "./types";
import { StorageError } from "./types";

/**
 * Convert input to Buffer
 */
function toBuffer(input: Buffer | ArrayBuffer): Buffer {
  return Buffer.isBuffer(input) ? input : Buffer.from(input);
}

/**
 * Cloudflare R2 storage client
 */
export class R2Storage {
  private client: S3Client;
  private bucket: string;
  private publicUrl?: string;
  private accountId: string;

  constructor(config: NonNullable<StorageConfig["r2"]>) {
    this.bucket = config.bucket;
    this.publicUrl = config.publicUrl;
    this.accountId = config.accountId;

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  /**
   * Upload a file to R2
   */
  async upload(
    file: Buffer | ArrayBuffer | ReadableStream,
    options: UploadOptions = {},
  ): Promise<UploadResult> {
    const buffer =
      file instanceof ReadableStream
        ? Buffer.from(await new Response(file).arrayBuffer())
        : toBuffer(file);

    // Validate file size (default 10MB)
    const maxSize = options.maxFileSize ?? 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new StorageError("FILE_TOO_LARGE", `File size exceeds ${maxSize} bytes`);
    }

    // Generate key if not provided
    const key = options.key ?? this.generateKey();

    const input: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: options.contentType,
      Metadata: options.metadata,
      CacheControl: options.cacheControl,
    };

    try {
      const result = await this.client.send(new PutObjectCommand(input));

      return {
        key,
        url: options.public ? this.getPublicUrl(key) : undefined,
        size: buffer.length,
        contentType: options.contentType ?? "application/octet-stream",
        etag: result.ETag,
      };
    } catch (error) {
      throw new StorageError("UPLOAD_FAILED", `Failed to upload file: ${error}`);
    }
  }

  /**
   * Delete a file from R2
   */
  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
    } catch (error) {
      throw new StorageError("DELETE_FAILED", `Failed to delete file: ${error}`);
    }
  }

  /**
   * Get file info
   */
  async getFileInfo(key: string): Promise<FileInfo> {
    try {
      const result = await this.client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      return {
        key,
        size: result.ContentLength ?? 0,
        contentType: result.ContentType,
        lastModified: result.LastModified,
        etag: result.ETag,
        metadata: result.Metadata,
      };
    } catch {
      throw new StorageError("FILE_NOT_FOUND", `File not found: ${key}`);
    }
  }

  /**
   * Get file as buffer
   */
  async get(key: string): Promise<Buffer> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const body = result.Body;
      if (!body) {
        throw new StorageError("FILE_NOT_FOUND", `File not found: ${key}`);
      }

      return Buffer.from(await body.transformToByteArray());
    } catch (error) {
      if (error instanceof StorageError) throw error;
      throw new StorageError("FILE_NOT_FOUND", `File not found: ${key}`);
    }
  }

  /**
   * Get public URL for a file
   */
  getPublicUrl(key: string): string {
    if (this.publicUrl) {
      return `${this.publicUrl}/${key}`;
    }
    return `https://${this.bucket}.${this.accountId}.r2.cloudflarestorage.com/${key}`;
  }

  /**
   * Generate a unique file key
   */
  private generateKey(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const id = nanoid(16);

    return `${year}/${month}/${day}/${id}`;
  }
}

/**
 * Create an R2 storage instance from environment
 */
export function createR2Storage(): R2Storage {
  const config = {
    accountId: process.env.R2_ACCOUNT_ID ?? "",
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
    bucket: process.env.R2_BUCKET ?? "",
    publicUrl: process.env.R2_PUBLIC_URL,
  };

  if (!config.accountId || !config.accessKeyId || !config.secretAccessKey || !config.bucket) {
    throw new StorageError("INVALID_CONFIGURATION", "Missing R2 configuration");
  }

  return new R2Storage(config);
}
