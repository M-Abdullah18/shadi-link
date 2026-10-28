import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

export const LanguageEntryModal: React.FC = () => {
  const { showEntryModal, setLanguage, language, setShowEntryModal, t } = useLanguage();

  if (!showEntryModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-content/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="max-w-lg w-full bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-modal text-center relative overflow-hidden"
        style={{ direction: 'ltr' }}
      >
        {/* Crest */}
        <div className="w-16 h-16 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Globe className="w-8 h-8 text-primary" />
        </div>

        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-content mb-1">
          Welcome to ShaadiLink
        </h2>
        <p className="font-urdu-heading text-xl text-primary font-bold mb-3">
          شادی لنک میں خوش آمدید
        </p>

        <p className="text-sm text-content-muted mb-6 max-w-sm mx-auto font-normal leading-relaxed">
          Please select your preferred language:
          <br />
          <span className="font-urdu-body text-sm block mt-1 text-content font-medium">
            شادی کے کارڈز دیکھنے کے لیے اپنی پسندیدہ زبان منتخب کیجیے
          </span>
        </p>

        {/* 2 Big Clear Buttons (Min height 48px) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Urdu Option */}
          <button
            onClick={() => setLanguage('ur')}
            className={`min-h-[72px] p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 text-center group active:scale-95 ${
              language === 'ur'
                ? 'bg-primary-subtle border-primary text-primary shadow-sm'
                : 'bg-surface hover:bg-canvas-subtle border-border text-content'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇵🇰</span>
              <span className="font-urdu-heading text-2xl font-bold">اردو</span>
            </div>
            <span className="font-urdu-body text-xs text-content-muted">
              پاکستانی انداز (RTL)
            </span>
          </button>

          {/* English Option */}
          <button
            onClick={() => setLanguage('en')}
            className={`min-h-[72px] p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1.5 text-center group active:scale-95 ${
              language === 'en'
                ? 'bg-primary-subtle border-primary text-primary shadow-sm'
                : 'bg-surface hover:bg-canvas-subtle border-border text-content'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <span className="font-serif text-2xl font-bold">English</span>
            </div>
            <span className="font-sans text-xs text-content-muted">
              Standard English layout
            </span>
          </button>
        </div>

        <button
          onClick={() => setShowEntryModal(false)}
          className="min-h-[44px] px-4 py-2 text-xs text-content-muted hover:text-content transition-colors underline underline-offset-4"
        >
          {t.continueBtn}
        </button>
      </div>
    </div>
  );
};
