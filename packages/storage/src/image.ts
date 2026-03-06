import sharp from "sharp";

import type { ImageProcessingOptions } from "./types";
import { StorageError } from "./types";

/**
 * Convert input to Buffer
 */
function toBuffer(input: Buffer | ArrayBuffer): Buffer {
  return Buffer.isBuffer(input) ? input : Buffer.from(input);
}

/**
 * Process an image with the given options
 */
export async function processImage(
  input: Buffer | ArrayBuffer,
  options: ImageProcessingOptions = {},
): Promise<Buffer> {
  try {
    let image = sharp(toBuffer(input));

    // Get metadata for format detection
    const metadata = await image.metadata();

    // Resize if dimensions specified
    if (options.width || options.height) {
      image = image.resize({
        width: options.width,
        height: options.height,
        fit: options.fit ?? "cover",
        withoutEnlargement: true,
      });
    }

    // Strip metadata if requested
    if (options.stripMetadata) {
      image = image.withMetadata({});
    }

    // Convert format
    const format = options.format ?? (metadata.format as ImageProcessingOptions["format"]);
    const quality = options.quality ?? 80;

    switch (format) {
      case "jpeg":
        image = image.jpeg({ quality, mozjpeg: true });
        break;
      case "png":
        image = image.png({ compressionLevel: 9 });
        break;
      case "webp":
        image = image.webp({ quality });
        break;
      case "avif":
        image = image.avif({ quality });
        break;
      default:
        // Keep original format if not specified
        break;
    }

    return image.toBuffer();
  } catch (error) {
    throw new StorageError(
      "UPLOAD_FAILED",
      `Failed to process image: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Get image dimensions
 */
export async function getImageDimensions(
  input: Buffer | ArrayBuffer,
): Promise<{ width: number; height: number }> {
  try {
    const image = sharp(toBuffer(input));
    const metadata = await image.metadata();

    return {
      width: metadata.width ?? 0,
      height: metadata.height ?? 0,
    };
  } catch {
    throw new StorageError("UPLOAD_FAILED", "Failed to get image dimensions");
  }
}

/**
 * Check if a buffer is a valid image
 */
export async function isValidImage(input: Buffer | ArrayBuffer): Promise<boolean> {
  try {
    const image = sharp(toBuffer(input));
    const metadata = await image.metadata();
    return metadata.format !== undefined;
  } catch {
    return false;
  }
}

/**
 * Generate thumbnail
 */
export async function generateThumbnail(input: Buffer | ArrayBuffer, size = 200): Promise<Buffer> {
  return processImage(input, {
    width: size,
    height: size,
    fit: "cover",
    format: "webp",
    quality: 75,
    stripMetadata: true,
  });
}
