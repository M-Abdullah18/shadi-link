import mongoose, { Schema, Document, Types } from 'mongoose';
import { z } from 'zod';

export const ALLOWED_EVENT_TYPES = ['mehndi', 'nikah', 'barat', 'shaadi', 'walima'] as const;
export type EventType = (typeof ALLOWED_EVENT_TYPES)[number];

export const VALID_DESIGN_SLUGS = [
  'emerald-royale',
  'sea-breeze',
  'shahi-darbar',
  'chandni-raat',
] as const;
export type ValidDesignSlug = (typeof VALID_DESIGN_SLUGS)[number];

/**
 * Validates Google Maps URLs according to strict security rules:
 * - Must be https:
 * - Host must only be maps.google.com, maps.app.goo.gl, google.com/maps, or goo.gl/maps
 * - Rejects javascript:, data:, and any other scheme or host
 */
export function isValidGoogleMapsUrl(urlString: string): boolean {
  if (!urlString || typeof urlString !== 'string') return false;
  try {
    const trimmed = urlString.trim();
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:')) {
      return false;
    }
    const url = new URL(trimmed);
    if (url.protocol !== 'https:') return false;

    const hostname = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    if (hostname === 'maps.google.com') return true;
    if (hostname === 'maps.app.goo.gl') return true;
    if ((hostname === 'google.com' || hostname === 'www.google.com') && pathname.startsWith('/maps')) {
      return true;
    }
    if (hostname === 'goo.gl' && pathname.startsWith('/maps')) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

/**
 * Parses and converts a date & time entered in Pakistan Time (Asia/Karachi, UTC+5)
 * into a standard JavaScript UTC Date.
 */
export function parsePakistanDate(dateInput: string | Date, timeInput?: string): Date {
  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    return dateInput;
  }

  const str = String(dateInput).trim();

  // If timeInput is provided (e.g. date: "2026-12-25", time: "20:00")
  if (timeInput) {
    const timeMatch = timeInput.trim().match(/^(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      const hours = timeMatch[1].padStart(2, '0');
      const minutes = timeMatch[2];
      const ymdMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
      if (ymdMatch) {
        return new Date(`${ymdMatch[1]}T${hours}:${minutes}:00+05:00`);
      }
    }
  }

  // If it's already an ISO string with explicit timezone offset (+05:00 or Z)
  if (/[zZ]|([+-]\d{2}:\d{2})$/.test(str)) {
    const parsed = new Date(str);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // If it's a date-time without timezone (e.g. "2026-12-25T20:00" or "2026-12-25 20:00")
  const match = str.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{1,2}):(\d{2})(?::(\d{2}))?/);
  if (match) {
    const [, ymd, h, m, s] = match;
    const hours = h.padStart(2, '0');
    const seconds = s || '00';
    return new Date(`${ymd}T${hours}:${m}:${seconds}+05:00`);
  }

  // Fallback if given a YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return new Date(`${str}T12:00:00+05:00`);
  }

  const parsed = new Date(str);
  if (isNaN(parsed.getTime())) {
    throw new Error('Invalid event date/time format');
  }
  return parsed;
}

/**
 * Formats a Date in Pakistan Standard Time (Asia/Karachi)
 */
export function formatPakistanDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(d);
}

// Zod Schema for Wedding Event Input
export const WeddingEventZodSchema = z.object({
  type: z.enum(['mehndi', 'nikah', 'barat', 'shaadi', 'walima']),
  startsAt: z.union([z.string(), z.date()]).transform((val) => {
    try {
      return parsePakistanDate(val);
    } catch {
      throw new Error('Invalid event start date/time');
    }
  }),
  venueName: z.string().trim().min(1, 'Venue name is required').max(100, 'Venue name cannot exceed 100 characters'),
  venueImageId: z.string().trim().optional().nullable(),
  mapUrl: z
    .string()
    .trim()
    .refine(isValidGoogleMapsUrl, {
      message: 'mapUrl must be an HTTPS Google Maps URL (google.com/maps, maps.google.com, maps.app.goo.gl, or goo.gl/maps)',
    }),
});

// Zod Schema for Wedding Creation / Update Input
export const WeddingZodSchema = z
  .object({
    groomName: z.string().trim().min(1, 'Groom name is required').max(60, 'Groom name cannot exceed 60 characters'),
    groomFatherName: z.string().trim().min(1, "Groom's father name is required").max(60, "Groom's father name cannot exceed 60 characters"),
    brideName: z.string().trim().min(1, 'Bride name is required').max(60, 'Bride name cannot exceed 60 characters'),
    brideFatherName: z.string().trim().min(1, "Bride's father name is required").max(60, "Bride's father name cannot exceed 60 characters"),
    language: z.enum(['en', 'ur']).default('en'),
    designSlug: z.enum(['emerald-royale', 'sea-breeze', 'shahi-darbar', 'chandni-raat']),
    events: z
      .array(WeddingEventZodSchema)
      .max(5, 'A wedding cannot have more than 5 events')
      .default([]),
  })
  .refine(
    (data) => {
      if (!data.events || data.events.length <= 1) return true;
      const types = data.events.map((e) => e.type);
      return new Set(types).size === types.length;
    },
    {
      message: 'Each event type can appear at most ONCE per wedding',
      path: ['events'],
    }
  );

export interface IWeddingEvent {
  type: EventType;
  startsAt: Date;
  venueName: string;
  venueImageId?: string | null;
  mapUrl: string;
}

export interface IWedding extends Document {
  groomName: string;
  groomFatherName: string;
  brideName: string;
  brideFatherName: string;
  language: 'en' | 'ur';
  designSlug: ValidDesignSlug;
  events: IWeddingEvent[];
  expiresAt: Date;
  status: 'draft' | 'ready';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  displayTitle: string;
}

const WeddingEventSchema = new Schema<IWeddingEvent>(
  {
    type: {
      type: String,
      required: true,
      enum: ALLOWED_EVENT_TYPES,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    venueName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    venueImageId: {
      type: Schema.Types.ObjectId,
      ref: 'Image',
      default: null,
    },
    mapUrl: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isValidGoogleMapsUrl,
        message: 'mapUrl must be an HTTPS Google Maps URL',
      },
    },
  },
  { _id: true }
);

const WeddingSchema = new Schema<IWedding>(
  {
    groomName: { type: String, required: true, trim: true, maxlength: 60 },
    groomFatherName: { type: String, required: true, trim: true, maxlength: 60 },
    brideName: { type: String, required: true, trim: true, maxlength: 60 },
    brideFatherName: { type: String, required: true, trim: true, maxlength: 60 },
    language: { type: String, enum: ['en', 'ur'], default: 'en' },
    designSlug: {
      type: String,
      required: true,
      enum: VALID_DESIGN_SLUGS,
    },
    events: {
      type: [WeddingEventSchema],
      validate: [
        {
          validator: (val: IWeddingEvent[]) => Array.isArray(val) && val.length <= 5,
          message: 'Maximum 5 events allowed per wedding',
        },
        {
          validator: (val: IWeddingEvent[]) => {
            if (!val || val.length <= 1) return true;
            const types = val.map((e) => e.type);
            return new Set(types).size === types.length;
          },
          message: 'Each event type can appear at most ONCE per wedding',
        },
      ],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'ready'],
      default: 'draft',
    },
    ownerId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual displayTitle = "<groom> & <bride>"
WeddingSchema.virtual('displayTitle').get(function (this: IWedding) {
  return `${this.groomName || ''} & ${this.brideName || ''}`.trim();
});

// Helper function to recompute expiresAt and status
export function computeWeddingMetadata(wedding: {
  groomName?: string;
  groomFatherName?: string;
  brideName?: string;
  brideFatherName?: string;
  designSlug?: string;
  events?: { startsAt: Date }[];
}): { expiresAt: Date; status: 'draft' | 'ready' } {
  let expiresAt: Date;
  if (wedding.events && wedding.events.length > 0) {
    const timestamps = wedding.events.map((e) => new Date(e.startsAt).getTime()).filter((t) => !isNaN(t));
    const latest = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
    expiresAt = new Date(latest + 24 * 60 * 60 * 1000);
  } else {
    // Default 30 days if no events yet
    expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  }

  const isReady = Boolean(
    wedding.groomName?.trim() &&
      wedding.groomFatherName?.trim() &&
      wedding.brideName?.trim() &&
      wedding.brideFatherName?.trim() &&
      wedding.designSlug &&
      wedding.events &&
      wedding.events.length > 0
  );

  return {
    expiresAt,
    status: isReady ? 'ready' : 'draft',
  };
}

export const WeddingModel =
  (mongoose.models.Wedding as mongoose.Model<IWedding>) ||
  mongoose.model<IWedding>('Wedding', WeddingSchema);
