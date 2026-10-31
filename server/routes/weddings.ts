import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import {
  WeddingModel,
  WeddingZodSchema,
  computeWeddingMetadata,
  formatPakistanDate,
  IWedding,
} from '../models/wedding.js';
import { ImageModel } from '../models/image.js';
import { requireAdmin } from '../auth.js';
import { connectDb } from '../db.js';

export function createAdminWeddingsRouter(): Router {
  const router = Router();

  // All routes in this router require administrative privileges
  router.use(requireAdmin);

  // GET /api/admin/weddings - List weddings
  router.get('/', async (req: Request, res: Response) => {
    try {
      await connectDb();
      const weddings = await WeddingModel.find()
        .sort({ updatedAt: -1 })
        .lean({ virtuals: true });

      const list = weddings.map((w) => {
        // Find earliest event date if any
        let firstEventDate: string | null = null;
        if (w.events && w.events.length > 0) {
          const sorted = [...w.events].sort(
            (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
          );
          if (sorted[0]?.startsAt) {
            firstEventDate = formatPakistanDate(sorted[0].startsAt);
          }
        }

        return {
          id: String(w._id),
          displayTitle: `${w.groomName || ''} & ${w.brideName || ''}`.trim(),
          designSlug: w.designSlug,
          status: w.status,
          firstEventDate,
          updatedAt: w.updatedAt,
        };
      });

      res.status(200).json(list);
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve weddings' });
    }
  });

  // POST /api/admin/weddings - Create wedding
  router.post('/', async (req: Request, res: Response) => {
    try {
      // 1. Zod input validation
      const parseResult = WeddingZodSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        res.status(400).json({
          error: 'ValidationError',
          message: firstIssue?.message || 'Invalid wedding data provided',
          details: parseResult.error.issues,
        });
        return;
      }

      const data = parseResult.data;
      await connectDb();

      // 2. Compute expiresAt and status on server (never trust client)
      const { expiresAt, status } = computeWeddingMetadata(data);

      const ownerId = (req as any).admin?.email || 'admin@shaadilink.pk';

      // 3. Create record in MongoDB
      const created = await WeddingModel.create({
        groomName: data.groomName,
        groomFatherName: data.groomFatherName,
        brideName: data.brideName,
        brideFatherName: data.brideFatherName,
        language: data.language,
        designSlug: data.designSlug,
        events: data.events,
        expiresAt,
        status,
        ownerId,
      });

      const responseObj = created.toJSON();
      res.status(201).json(responseObj);
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to create wedding' });
    }
  });

  // GET /api/admin/weddings/:id - Read wedding
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      // Protect against NoSQL operator injection & invalid ID formats
      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'NotFound', message: 'Wedding not found' });
        return;
      }

      await connectDb();
      const wedding = await WeddingModel.findById(new mongoose.Types.ObjectId(id)).lean({ virtuals: true });
      if (!wedding) {
        res.status(404).json({ error: 'NotFound', message: 'Wedding not found' });
        return;
      }

      res.status(200).json(wedding);
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to retrieve wedding' });
    }
  });

  // PUT /api/admin/weddings/:id - Update wedding
  router.put('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'NotFound', message: 'Wedding not found' });
        return;
      }

      // 1. Zod input validation
      const parseResult = WeddingZodSchema.safeParse(req.body);
      if (!parseResult.success) {
        const firstIssue = parseResult.error.issues[0];
        res.status(400).json({
          error: 'ValidationError',
          message: firstIssue?.message || 'Invalid wedding data provided',
          details: parseResult.error.issues,
        });
        return;
      }

      const data = parseResult.data;
      await connectDb();

      const existing = await WeddingModel.findById(new mongoose.Types.ObjectId(id));
      if (!existing) {
        res.status(404).json({ error: 'NotFound', message: 'Wedding not found' });
        return;
      }

      // Clean up orphaned images if an event was removed or its image was updated
      const existingImageIds = (existing.events || [])
        .map((e) => String(e.venueImageId || ''))
        .filter(Boolean);
      const newImageIds = (data.events || [])
        .map((e) => String(e.venueImageId || ''))
        .filter(Boolean);

      const orphanedImageIds = existingImageIds.filter((imgId) => !newImageIds.includes(imgId));
      if (orphanedImageIds.length > 0) {
        await ImageModel.deleteMany({
          _id: { $in: orphanedImageIds.map((imgId) => new mongoose.Types.ObjectId(imgId)) },
        }).catch(() => {});
      }

      // 2. Recompute expiresAt and status
      const { expiresAt, status } = computeWeddingMetadata(data);

      existing.groomName = data.groomName;
      existing.groomFatherName = data.groomFatherName;
      existing.brideName = data.brideName;
      existing.brideFatherName = data.brideFatherName;
      existing.language = data.language;
      existing.designSlug = data.designSlug;
      existing.events = data.events as any;
      existing.expiresAt = expiresAt;
      existing.status = status;

      await existing.save();

      res.status(200).json(existing.toJSON());
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to update wedding' });
    }
  });

  // DELETE /api/admin/weddings/:id - Delete wedding (and its event images)
  router.delete('/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
        res.status(404).json({ error: 'NotFound', message: 'Wedding not found' });
        return;
      }

      await connectDb();
      const existing = await WeddingModel.findById(new mongoose.Types.ObjectId(id));
      if (!existing) {
        res.status(404).json({ error: 'NotFound', message: 'Wedding not found' });
        return;
      }

      // Delete associated venue images
      const imageIds = (existing.events || [])
        .map((e) => String(e.venueImageId || ''))
        .filter((imgId) => imgId && mongoose.Types.ObjectId.isValid(imgId));

      if (imageIds.length > 0) {
        await ImageModel.deleteMany({
          _id: { $in: imageIds.map((imgId) => new mongoose.Types.ObjectId(imgId)) },
        }).catch(() => {});
      }

      await WeddingModel.findByIdAndDelete(new mongoose.Types.ObjectId(id));

      res.status(200).json({ success: true, message: 'Wedding deleted successfully' });
    } catch (_error) {
      res.status(500).json({ error: 'InternalServerError', message: 'Failed to delete wedding' });
    }
  });

  return router;
}
