import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { generateThumbnail, getImageDimensions, isValidImage, processImage } from "../src/image";
import { StorageError } from "../src/types";

async function createFixture(width = 8, height = 6): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 12, g: 34, b: 56 },
    },
  })
    .png()
    .toBuffer();
}

describe("storage image helpers", () => {
  it("detects valid images and reports their dimensions", async () => {
    const fixture = await createFixture(10, 7);

    await expect(isValidImage(fixture)).resolves.toBe(true);
    await expect(getImageDimensions(fixture)).resolves.toEqual({
      width: 10,
      height: 7,
    });
  });

  it("processes images with resizing and format conversion", async () => {
    const fixture = await createFixture(12, 12);

    const output = await processImage(fixture, {
      width: 4,
      height: 4,
      format: "webp",
      quality: 75,
    });

    const metadata = await sharp(output).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(4);
    expect(metadata.height).toBe(4);
  });

  it("generates square thumbnails and wraps processing failures", async () => {
    const fixture = await createFixture(30, 20);
    const thumbnail = await generateThumbnail(fixture, 16);
    const metadata = await sharp(thumbnail).metadata();

    expect(metadata.format).toBe("webp");
    expect(metadata.width).toBe(16);
    expect(metadata.height).toBe(16);

    await expect(processImage(Buffer.from("not-an-image"))).rejects.toBeInstanceOf(StorageError);
  });
});
