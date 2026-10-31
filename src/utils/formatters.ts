/**
 * Shared formatting and validation utilities for ShaadiLink
 */

export function formatParentNames(fatherName: string | undefined | null, language: 'en' | 'ur'): string {
  if (!fatherName) return '';
  const trimmed = fatherName.trim();
  if (!trimmed) return '';
  if (language === 'ur') {
    return `جناب و محترمہ ${trimmed}`;
  }
  return `Mr. & Mrs. ${trimmed}`;
}

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

export function formatEventTypeName(type: string, language: 'en' | 'ur'): string {
  const map: Record<string, { en: string; ur: string }> = {
    mehndi: { en: 'Mehndi', ur: 'مہندی' },
    nikah: { en: 'Nikah', ur: 'نکاح' },
    barat: { en: 'Barat', ur: 'بارات' },
    shaadi: { en: 'Shaadi (Nikah + Barat)', ur: 'شادی (نکاح و بارات)' },
    walima: { en: 'Walima', ur: 'ولیمہ' },
  };
  return map[type]?.[language] || type;
}
