import { Router, Request, Response } from 'express';
import { requireAdmin } from '../auth.js';

export interface DesignRegistryItem {
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

export const REGISTERED_DESIGNS: DesignRegistryItem[] = [
  {
    slug: 'emerald-royale',
    code: 'D01',
    name: 'Emerald Royale',
    nameUrdu: 'زمرد و طلائی شاہی',
    thumbnail: '/designs/emerald-royale.svg',
    supportedLanguages: ['en', 'ur'],
    mood: {
      en: 'Regal, emerald, heritage Pakistani elegance',
      ur: 'پروقار زمردی، سنہری اور روایتی خوبصورتی',
    },
    palette: {
      primary: '#064E3B',
      secondary: '#022419',
      accent: '#D4AF37',
      background: '#042A1F',
      text: '#FCFBF7',
      previewColors: ['#064E3B', '#D4AF37', '#FCFBF7', '#022419'],
    },
  },
  {
    slug: 'sea-breeze',
    code: 'D02',
    name: 'Sea Breeze',
    nameUrdu: 'نسیمِ سحر',
    thumbnail: '/designs/sea-breeze.svg',
    supportedLanguages: ['en', 'ur'],
    mood: {
      en: 'Airy, coastal, serene beach celebration',
      ur: 'ہوادار، ساحلی، پرسکون اور دلکش انداز',
    },
    palette: {
      primary: '#87CEEB',
      secondary: '#E0F2F1',
      accent: '#48A9A6',
      background: '#F0F9F8',
      text: '#1F3A44',
      previewColors: ['#87CEEB', '#FFFFFF', '#E0F2F1', '#1F3A44'],
    },
  },
  {
    slug: 'shahi-darbar',
    code: 'D03',
    name: 'Shahi Darbar',
    nameUrdu: 'شاہی دربار',
    thumbnail: '/designs/shahi-darbar.svg',
    supportedLanguages: ['en', 'ur'],
    mood: {
      en: 'Royal, traditional, majestic Mughal heritage',
      ur: 'شاہانہ، روایتی، مغلیہ دربار اور پروقار انداز',
    },
    palette: {
      primary: '#800020',
      secondary: '#002366',
      accent: '#E6CA65',
      background: '#FAF6EE',
      text: '#2A1215',
      previewColors: ['#800020', '#002366', '#E6CA65', '#FAF6EE'],
    },
  },
  {
    slug: 'chandni-raat',
    code: 'D04',
    name: 'Chandni Raat',
    nameUrdu: 'چاندنی رات',
    thumbnail: '/designs/chandni-raat.svg',
    supportedLanguages: ['en', 'ur'],
    mood: {
      en: 'Romantic, moonlit night, starry elegance',
      ur: 'رومانوی، چاندنی رات، ستاروں کی چمک اور دلفریب حسن',
    },
    palette: {
      primary: '#191970',
      secondary: '#121212',
      accent: '#E8C46A',
      background: '#0D1117',
      text: '#FCFBF7',
      previewColors: ['#191970', '#121212', '#E8C46A', '#FCFBF7'],
    },
  },
];

export function createAdminDesignsRouter(): Router {
  const router = Router();

  // GET /api/admin/designs
  router.get('/', requireAdmin, (_req: Request, res: Response) => {
    res.status(200).json(REGISTERED_DESIGNS);
  });

  return router;
}
