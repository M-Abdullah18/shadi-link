export interface WeddingEventInput {
  type: 'mehndi' | 'nikah' | 'barat' | 'shaadi' | 'walima';
  startsAt: string; // ISO string or YYYY-MM-DDTHH:mm:00
  venueName: string;
  venueImageId?: string | null;
  mapUrl: string;
}

export interface WeddingInput {
  groomName: string;
  groomFatherName: string;
  brideName: string;
  brideFatherName: string;
  language: 'en' | 'ur';
  designSlug: 'emerald-royale' | 'sea-breeze' | 'shahi-darbar' | 'chandni-raat';
  events: WeddingEventInput[];
}

export interface WeddingSummary {
  id: string;
  displayTitle: string;
  designSlug: string;
  status: 'draft' | 'ready';
  firstEventDate: string | null;
  updatedAt: string;
}

export interface WeddingRecord extends WeddingInput {
  _id: string;
  id: string;
  expiresAt: string;
  status: 'draft' | 'ready';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  displayTitle: string;
}

export interface AdminDesign {
  slug: string;
  code: string;
  name: string;
  nameUrdu: string;
  thumbnail: string;
  supportedLanguages: string[];
  mood: { en: string; ur: string };
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    previewColors: string[];
  };
}

/**
 * Fetch all weddings for admin dashboard
 */
export async function listWeddings(): Promise<WeddingSummary[]> {
  const response = await fetch('/api/admin/weddings', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load weddings list');
  }
  return response.json();
}

/**
 * Fetch a single wedding by ID
 */
export async function getWedding(id: string): Promise<WeddingRecord> {
  const response = await fetch(`/api/admin/weddings/${encodeURIComponent(id)}`, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Wedding not found');
    }
    throw new Error('Failed to load wedding details');
  }
  return response.json();
}

/**
 * Create a new wedding
 */
export async function createWedding(data: WeddingInput): Promise<WeddingRecord> {
  const response = await fetch('/api/admin/weddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resJson.message || 'Failed to create wedding');
  }
  return resJson;
}

/**
 * Update an existing wedding
 */
export async function updateWedding(id: string, data: WeddingInput): Promise<WeddingRecord> {
  const response = await fetch(`/api/admin/weddings/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resJson.message || 'Failed to update wedding');
  }
  return resJson;
}

/**
 * Delete a wedding
 */
export async function deleteWedding(id: string): Promise<void> {
  const response = await fetch(`/api/admin/weddings/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to delete wedding');
  }
}

/**
 * Fetch designs registered in the admin catalog
 */
export async function getAdminDesigns(): Promise<AdminDesign[]> {
  const response = await fetch('/api/admin/designs', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load design templates');
  }
  return response.json();
}

/**
 * Upload an image (raw binary body)
 */
export async function uploadAdminImage(blob: Blob, contentType: string): Promise<{ imageId: string }> {
  const arrayBuffer = await blob.arrayBuffer();
  const response = await fetch('/api/admin/images', {
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      Accept: 'application/json',
    },
    body: arrayBuffer,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to upload image');
  }
  return data;
}

/**
 * Delete an uploaded image
 */
export async function deleteAdminImage(id: string): Promise<void> {
  await fetch(`/api/admin/images/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  }).catch(() => {});
}
