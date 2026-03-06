// R2 Storage

// Image processing
export {
  generateThumbnail,
  getImageDimensions,
  isValidImage,
  processImage,
} from "./image";
export { createR2Storage, R2Storage } from "./r2";

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
