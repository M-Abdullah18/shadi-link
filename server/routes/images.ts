import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ImageModel } from '../models/image.js';
import { requireAdmin } from '../auth.js';
import { connectDb } from '../db.js';

/**
 * Validates file magic bytes against allowed image formats
 */
export function detectMagicBytes(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!buffer || buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF (bytes 0-3) and WEBP (bytes 8-11)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return 'image/webp';
  }

  return null;
}

export function createPublicImageRouter(): Router {
  const router = Router();

  // GET /api/images/:id - Public image serving route
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      // Protect against NoSQL operator injection & invalid ID formats
      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'NotFound', message: 'Image not found' });
        return;
      }

      await connectDb();
      const image = await ImageModel.findById(new mongoose.Types.ObjectId(id)).lean();
      if (!image || !image.data) {
        res.status(404).json({ error: 'NotFound', message: 'Image not found' });
        return;
      }

      // Serve image bytes with security and cache headers
      res.setHeader('Content-Type', image.contentType);
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.status(200).send(image.data);
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong' });
    }
  });

  return router;
}

export function createAdminImageRouter(): Router {
  const router = Router();

  // POST /api/admin/images - Raw binary body upload (max 1 MB)
  router.post('/', requireAdmin, async (req: Request, res: Response) => {
    try {
      const buffer = req.body;
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
        res.status(400).json({
          error: 'BadRequest',
          message: 'Please provide raw binary image data in request body',
        });
        return;
      }

      if (buffer.length > 1024 * 1024) {
        res.status(400).json({
          error: 'PayloadTooLarge',
          message: 'Image size exceeds 1 MB limit',
        });
        return;
      }

      // Check magic bytes, not just the Content-Type header
      const detectedType = detectMagicBytes(buffer);
      if (!detectedType) {
        res.status(400).json({
          error: 'UnsupportedMediaType',
          message: 'Invalid image format. Allowed formats: image/jpeg, image/png, image/webp',
        });
        return;
      }

      await connectDb();
      const newImage = await ImageModel.create({
        data: buffer,
        contentType: detectedType,
        size: buffer.length,
      });

      res.status(201).json({
        imageId: String(newImage._id),
        contentType: detectedType,
        size: buffer.length,
      });
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong' });
    }
  });

  // DELETE /api/admin/images/:id - Delete an image
  router.delete('/:id', requireAdmin, async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ error: 'BadRequest', message: 'Invalid image ID format' });
        return;
      }

      await connectDb();
      const result = await ImageModel.findByIdAndDelete(new mongoose.Types.ObjectId(id));
      if (!result) {
        res.status(404).json({ error: 'NotFound', message: 'Image not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'Image deleted successfully' });
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Something went wrong' });
    }
  });

  return router;
}
