/**
 * Central configuration for ShaadiLink.
 * All public contacts, environment defaults, and external links live here.
 */

export const APP_CONFIG = {
  appName: 'ShaadiLink',
  appNameUrdu: 'شادی لنک',
  taglineEn: 'Premium Digital Wedding Invitations for Pakistan',
  taglineUr: 'پاکستان کی سب سے خوبصورت ڈیجیٹل شادی دعوتی ویب سائٹ',
  // Central WhatsApp contact for client inquiries and orders
  whatsappNumber: (import.meta.env.VITE_WHATSAPP_NUMBER as string) || '923246540244',
  supportedLanguages: ['en', 'ur'] as const,
  defaultLanguage: 'ur' as const, // Urdu default for authentic Pakistani audience
};

export type SupportedLanguage = (typeof APP_CONFIG.supportedLanguages)[number];

export interface WhatsAppInquiryParams {
  designName: string;
  designCode: string;
  language: SupportedLanguage;
  demoUrl?: string;
}

/**
 * Builds a friendly, pre-filled WhatsApp click-to-chat URL.
 * Non-technical clients can read and verify the message easily before sending.
 */
export function buildWhatsAppInquiryUrl(params: WhatsAppInquiryParams): string {
  const { designName, designCode, language, demoUrl } = params;
  const baseUrl = `https://wa.me/${APP_CONFIG.whatsappNumber}`;
  const fullDemoUrl = demoUrl || window.location.href;

  let message = '';
  if (language === 'ur') {
    message = `السلام علیکم! میں شادی لنک (ShaadiLink) پر یہ دعوت نامہ بنوانا چاہتا/چاہتی ہوں۔

کارڈ کا نام: ${designName}
ڈیزائن کوڈ: ${designCode}
زبان: اردو
ڈیمو لنک: ${fullDemoUrl}

براہ کرم مجھے اس کی تفصیلات اور آرڈر کا طریقہ بتائیں۔ شکریہ!`;
  } else {
    message = `Salam! I would like to order this digital wedding invitation on ShaadiLink:

Design Name: ${designName}
Design Code: ${designCode}
Language: English
Demo Link: ${fullDemoUrl}

Please share the pricing and details to get started. Thank you!`;
  }

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
