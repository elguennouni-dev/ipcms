import { mkdir, writeFile, unlink } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

export const uploadDir = () => process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');

/** Resize + convert any raster image to WebP, store it in the upload dir, return the stored filename. */
export async function saveImage(file: File, prefix: string, maxWidth: number) {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });
  const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()))
    .rotate().resize({ width: maxWidth, withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
  const name = `${prefix.replace(/[^a-z0-9-]/gi, '')}-${Date.now()}.webp`;
  await writeFile(path.join(dir, name), data);
  return { name, width: info.width, height: info.height };
}

export async function deleteImage(name: string) {
  if (!name) return;
  await unlink(path.join(uploadDir(), path.basename(name))).catch(() => {});
}
