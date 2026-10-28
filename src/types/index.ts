import { z } from 'zod';

// Health Check Response Schema
export const HealthCheckResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.string(),
  version: z.string(),
  timestamp: z.string(),
  uptimeSeconds: z.number(),
  environment: z.string(),
  supportedLanguages: z.array(z.string()).optional(),
  database: z.object({
    configured: z.boolean(),
    type: z.string(),
    status: z.string()
  })
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;

// User & Auth Types (Ready for Feature 2)
export const UserRoleSchema = z.enum(['admin', 'planner', 'client']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  createdAt: string;
}

// Wedding & Event Types (Ready for subsequent features)
export interface WeddingEvent {
  id: string;
  name: string; // e.g. Mehndi, Barat, Walima, Nikkah
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  city: string;
  googleMapsUrl?: string;
  dressCode?: string;
}

export interface WeddingData {
  id: string;
  slug: string;
  coupleNames: {
    groom: string;
    bride: string;
  };
  parentsNames?: {
    groomParents?: string;
    brideParents?: string;
  };
  events: WeddingEvent[];
  theme: 'emerald_gold' | 'royal_ruby' | 'ivory_classic';
  coverPhotoUrl?: string;
  customMessage?: string;
  active: boolean;
}
