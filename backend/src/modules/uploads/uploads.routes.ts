import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { env } from '../../config/env.js';
import { BadRequestError } from '../../errors/AppError.js';
import { authenticate } from '../../middleware/auth.js';

export const uploadsRouter = Router();
uploadsRouter.use(authenticate);

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const IMAGE_MIME_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const LOGO_MIME_EXT: Record<string, string> = {
  'image/svg+xml': '.svg',
  'image/png': '.png',
  'image/webp': '.webp',
};

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
});

function sanitizeSvg(svgContent: string): string {
  return svgContent
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');
}

async function saveUpload(folder: 'images' | 'logos', ext: string, buffer: Buffer) {
  const targetDir = path.resolve(env.uploadDir, folder);
  await fs.mkdir(targetDir, { recursive: true });
  const filename = `${crypto.randomUUID()}${ext}`;
  const fullPath = path.join(targetDir, filename);
  await fs.writeFile(fullPath, buffer);
  const relativePath = `/uploads/${folder}/${filename}`;
  return {
    path: relativePath,
    url: `${env.publicBaseUrl}${relativePath}`,
  };
}

uploadsRouter.post('/image', memoryUpload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new BadRequestError('No file uploaded');
  }
  const ext = IMAGE_MIME_EXT[file.mimetype];
  if (!ext) {
    throw new BadRequestError('Only jpg, png, and webp images are allowed (max 5 MB)');
  }
  const saved = await saveUpload('images', ext, file.buffer);
  res.status(201).json(saved);
});

uploadsRouter.post('/logo', memoryUpload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    throw new BadRequestError('No file uploaded');
  }
  const ext = LOGO_MIME_EXT[file.mimetype];
  if (!ext) {
    throw new BadRequestError('Only svg, png, and webp logos are allowed (max 5 MB)');
  }
  const buffer =
    ext === '.svg' ? Buffer.from(sanitizeSvg(file.buffer.toString('utf8')), 'utf8') : file.buffer;
  const saved = await saveUpload('logos', ext, buffer);
  res.status(201).json(saved);
});
