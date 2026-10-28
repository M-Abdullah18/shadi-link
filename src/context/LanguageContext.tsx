import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { SupportedLanguage } from '../config';

export interface Translations {
  appName: string;
  tagline: string;
  selectLanguage: string;
  english: string;
  urdu: string;
  browseDesigns: string;
  home: string;
  designs: string;
  adminLogin: string;
  apiHealth: string;
  contactWhatsApp: string;
  viewDemo: string;
  demoBadge: string;
  orderOnWhatsApp: string;
  simpleThreeSteps: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  respectedGuest: string;
  switchLangPrompt: string;
  languageChangedNotice: string;
  close: string;
  chooseYourLanguage: string;
  welcomeModalSub: string;
  continueBtn: string;
  quickWhatsAppDesc: string;
  footerAbout: string;
  allRightsReserved: string;
}

const translationsMap: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'ShaadiLink',
    tagline: 'Premium Digital Wedding Invitations for Pakistan',
    selectLanguage: 'Language',
    english: 'English',
    urdu: 'اردو',
    browseDesigns: 'Browse Invitation Designs',
    home: 'Home',
    designs: 'Designs Gallery',
    adminLogin: 'Admin Panel',
    apiHealth: 'System Health',
    contactWhatsApp: 'Contact us on WhatsApp',
    viewDemo: 'View Live Demo',
    demoBadge: 'Live Demo',
    orderOnWhatsApp: 'Order This Design on WhatsApp',
    simpleThreeSteps: 'How ShaadiLink Works in 3 Simple Steps',
    step1Title: '1. Choose a Design',
    step1Desc: 'Pick your favorite Pakistani wedding invitation template from our gallery.',
    step2Title: '2. Tap WhatsApp to Order',
    step2Desc: 'Send us the pre-filled message with your wedding details on WhatsApp.',
    step3Title: '3. Receive Your Host Link',
    step3Desc: 'Get a private link to send personalized cards to your guests with 1 tap.',
    respectedGuest: 'Respected Guest',
    switchLangPrompt: 'Switch Language',
    languageChangedNotice: 'Language changed to English',
    close: 'Close',
    chooseYourLanguage: 'Choose Your Preferred Language',
    welcomeModalSub: 'Please select English or Urdu to browse ShaadiLink wedding cards comfortably.',
    continueBtn: 'Continue to Website',
    quickWhatsAppDesc: 'Our team in Pakistan is available to design and personalize your wedding cards.',
    footerAbout: 'ShaadiLink creates bespoke digital invitations for Mehndi, Barat, Walima and Nikkah celebrations across Pakistan and overseas.',
    allRightsReserved: 'All rights reserved.',
  },
  ur: {
    appName: 'شادی لنک',
    tagline: 'پاکستان کی سب سے خوبصورت ڈیجیٹل شادی دعوتی ویب سائٹ',
    selectLanguage: 'زبان منتخب کریں',
    english: 'English',
    urdu: 'اردو',
    browseDesigns: 'شادی کے کارڈز دیکھیں',
    home: 'مرکزی صفحہ',
    designs: 'ڈیزائن گیلری',
    adminLogin: 'ایڈمن پینل',
    apiHealth: 'سسٹم کیفیت',
    contactWhatsApp: 'واٹس ایپ پر رابطہ کریں',
    viewDemo: 'کارڈ کا ڈیمو دیکھیں',
    demoBadge: 'لائیو ڈیمو',
    orderOnWhatsApp: 'یہ کارڈ واٹس ایپ پر آرڈر کریں',
    simpleThreeSteps: 'شادی لنک استعمال کرنے کے 3 آسان ترین مراحل',
    step1Title: '۱۔ اپنی پسند کا ڈیزائن منتخب کریں',
    step1Desc: 'ہماری گیلری سے اپنی پسند کا کارڈ اور تقریب کا رنگ منتخب کریں۔',
    step2Title: '۲۔ واٹس ایپ پر ہم سے رابطہ کریں',
    step2Desc: 'بٹن دبا کر واٹس ایپ پر ہمیں شادی کی تاریخ، دولہا دلہن اور مقام کی تفصیل بھیجیں۔',
    step3Title: '۳۔ اپنا نجی لنک حاصل کریں',
    step3Desc: 'ہم آپ کو نجی ہوسٹ لنک دیں گے، جس سے آپ تمام مہمانوں کو ایک بٹن دبا کر واٹس ایپ پر کارڈ بھیج سکیں گے۔',
    respectedGuest: 'محترم مہمان',
    switchLangPrompt: 'زبان بدلیں',
    languageChangedNotice: 'زبان اردو میں تبدیل ہو گئی ہے',
    close: 'بند کریں',
    chooseYourLanguage: 'اپنی پسندیدہ زبان کا انتخاب کریں',
    welcomeModalSub: 'شادی لنک دیکھنے کے لیے اردو یا انگریزی زبان منتخب کیجیے۔',
    continueBtn: 'ویب سائٹ پر جائیں',
    quickWhatsAppDesc: 'ہماری ٹیم پاکستان میں آپ کے شادی کے کارڈز کو شاندار بنانے کے لیے ہر وقت دستیاب ہے۔',
    footerAbout: 'شادی لنک مہندی، بارات، ولیمہ اور نکاح کی تقاریب کے لیے خوبصورت ڈیجیٹل دعوت نامے تیار کرتا ہے۔',
    allRightsReserved: 'تمام جملہ حقوق محفوظ ہیں۔',
  },
};

interface LanguageContextType {
  language: SupportedLanguage;
  isUrdu: boolean;
  dir: 'rtl' | 'ltr';
  setLanguage: (lang: SupportedLanguage) => void;
  toggleLanguage: () => void;
  t: Translations;
  showEntryModal: boolean;
  setShowEntryModal: (show: boolean) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'shaadilink_preferred_language';
const HAS_SEEN_KEY = 'shaadilink_has_chosen_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ur') return saved;
    return 'ur'; // Default to Urdu for Pakistani context
  });

  const [showEntryModal, setShowEntryModal] = useState<boolean>(() => {
    return !localStorage.getItem(HAS_SEEN_KEY);
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    localStorage.setItem(HAS_SEEN_KEY, 'true');
    setShowEntryModal(false);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ur' : 'en');
  };

  // Synchronize document dir and lang attributes
  useEffect(() => {
    const dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    document.documentElement.dir = dir;

    if (language === 'ur') {
      document.documentElement.classList.add('font-urdu');
    } else {
      document.documentElement.classList.remove('font-urdu');
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      isUrdu: language === 'ur',
      dir: language === 'ur' ? ('rtl' as const) : ('ltr' as const),
      setLanguage,
      toggleLanguage,
      t: translationsMap[language],
      showEntryModal,
      setShowEntryModal,
    }),
    [language, showEntryModal]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
