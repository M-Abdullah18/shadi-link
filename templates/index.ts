import { TemplateManifest } from './types';
import { emeraldRoyaleManifest } from './emerald-royale/manifest';
import { seaBreezeManifest } from './sea-breeze/manifest';
import { shahiDarbarManifest } from './shahi-darbar/manifest';
import { chandniRaatManifest } from './chandni-raat/manifest';

export * from './types';

/**
 * Master Template Registry for ShaadiLink.
 * Adding a new design to the platform = adding a folder under /templates/<slug>/ and registering it here.
 * The Home Gallery, Live Demos, and Admin Forms auto-generate from this registry.
 */
export const TEMPLATES: TemplateManifest[] = [
  emeraldRoyaleManifest,
  seaBreezeManifest,
  shahiDarbarManifest,
  chandniRaatManifest,
];

/**
 * Retrieves a template manifest by its unique slug
 */
export function getTemplate(slug: string): TemplateManifest | undefined {
  if (!slug) return undefined;
  return TEMPLATES.find((t) => t.slug.toLowerCase() === slug.toLowerCase());
}

/**
 * Returns all available template manifests
 */
export function getAllTemplates(): TemplateManifest[] {
  return TEMPLATES;
}
