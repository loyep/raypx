// R2 Storage

export { createR2Storage } from "./env";
// Image processing
export {
  generateThumbnail,
  getImageDimensions,
  isValidImage,
  processImage,
} from "./image";
export { R2Storage } from "./r2";

// Types
export type {
  FileInfo,
  ImageProcessingOptions,
  StorageConfig,
  StorageErrorType,
  StorageProvider,
  UploadOptions,
  UploadResult,
} from "./types";
export { StorageError } from "./types";
