/**
 * Storage provider types
 */
export type StorageProvider = "r2" | "s3" | "local";

/**
 * File upload options
 */
export interface UploadOptions {
  /**
   * Custom key/path for the file
   */
  key?: string;

  /**
   * Content type (MIME type)
   */
  contentType?: string;

  /**
   * Custom metadata
   */
  metadata?: Record<string, string>;

  /**
   * Cache control header
   */
  cacheControl?: string;

  /**
   * Whether the file should be publicly accessible
   */
  public?: boolean;

  /**
   * Maximum file size in bytes (default: 10MB)
   */
  maxFileSize?: number;

  /**
   * Allowed file extensions
   */
  allowedExtensions?: string[];
}

/**
 * Image processing options
 */
export interface ImageProcessingOptions {
  /**
   * Resize width
   */
  width?: number;

  /**
   * Resize height
   */
  height?: number;

  /**
   * Resize fit mode
   */
  fit?: "cover" | "contain" | "fill" | "inside" | "outside";

  /**
   * Output format
   */
  format?: "jpeg" | "png" | "webp" | "avif";

  /**
   * Quality (1-100)
   */
  quality?: number;

  /**
   * Whether to strip metadata
   */
  stripMetadata?: boolean;
}

/**
 * Upload result
 */
export interface UploadResult {
  /**
   * File key/path in storage
   */
  key: string;

  /**
   * Public URL (if public)
   */
  url?: string;

  /**
   * File size in bytes
   */
  size: number;

  /**
   * Content type
   */
  contentType: string;

  /**
   * ETag from storage provider
   */
  etag?: string;
}

/**
 * File info
 */
export interface FileInfo {
  key: string;
  size: number;
  contentType?: string;
  lastModified?: Date;
  etag?: string;
  metadata?: Record<string, string>;
}

/**
 * Storage configuration
 */
export interface StorageConfig {
  /**
   * Storage provider
   */
  provider: StorageProvider;

  /**
   * Cloudflare R2 configuration
   */
  r2?: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    publicUrl?: string;
  };

  /**
   * AWS S3 configuration
   */
  s3?: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucket: string;
    endpoint?: string;
  };

  /**
   * Local storage configuration (for development)
   */
  local?: {
    basePath: string;
    publicUrl?: string;
  };
}

/**
 * Storage error types
 */
export type StorageErrorType =
  | "FILE_TOO_LARGE"
  | "INVALID_FILE_TYPE"
  | "UPLOAD_FAILED"
  | "DELETE_FAILED"
  | "FILE_NOT_FOUND"
  | "INVALID_CONFIGURATION";

/**
 * Custom storage error class
 */
export class StorageError extends Error {
  constructor(
    public type: StorageErrorType,
    message: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}
