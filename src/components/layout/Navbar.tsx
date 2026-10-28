import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartHandshake, Menu, X, MessageCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { buildWhatsAppInquiryUrl } from '../../config';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { language, setLanguage, isUrdu, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const generalWhatsAppUrl = buildWhatsAppInquiryUrl({
    designName: isUrdu ? 'عام معلومات' : 'General Inquiry',
    designCode: 'SL-MAIN',
    language,
    demoUrl: window.location.origin,
  });

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-border text-content shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-200">
              <HeartHandshake className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className={`text-2xl font-bold tracking-tight text-content flex items-center gap-1.5 ${
                isUrdu ? 'font-urdu-heading text-xl' : 'font-serif'
              }`}>
                {t.appName}
                <span className="text-[10px] font-sans font-semibold uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent-subtle text-accent-hover border border-accent/30">
                  PK
                </span>
              </span>
              <span className={`text-xs text-content-muted ${isUrdu ? 'font-urdu-body -mt-1' : 'tracking-wide -mt-0.5'}`}>
                {t.tagline}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links: ONLY Home / Designs */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-primary font-semibold'
                  : 'text-content-muted hover:text-primary'
              }`}
            >
              {t.home}
            </Link>
          </nav>

          {/* Right Actions: Language Switcher + Large WhatsApp Button */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Switcher Buttons */}
            <div className="flex items-center bg-canvas-subtle p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setLanguage('ur')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  language === 'ur'
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-content-muted hover:text-content'
                }`}
                title="اردو"
              >
                <span>🇵🇰</span>
                <span className="font-urdu-body">اردو</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  language === 'en'
                    ? 'bg-primary text-primary-content shadow-sm'
                    : 'text-content-muted hover:text-content'
                }`}
                title="English"
              >
                <span>🌐</span>
                <span className="font-sans">English</span>
              </button>
            </div>

            {/* WhatsApp Contact Button (Min Height 48px, High Contrast) */}
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-sm shadow-sm transition-all active:scale-95 flex items-center gap-2.5"
              title="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.contactWhatsApp}</span>
            </a>
          </div>

          {/* Mobile Actions: Language Toggle & Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'ur' ? 'en' : 'ur')}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-canvas-subtle border border-border text-xs font-semibold text-primary flex items-center gap-1.5"
            >
              <span>{language === 'ur' ? 'English' : 'اردو'}</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-h-[44px] min-w-[44px] p-2 rounded-xl text-content-muted hover:text-content hover:bg-canvas-subtle flex items-center justify-center focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer: Clean and minimal */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 pt-3 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2.5 rounded-lg text-base font-medium text-content hover:bg-canvas-subtle"
          >
            {t.home}
          </Link>

          <div className="pt-2">
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-sm shadow-sm"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t.contactWhatsApp}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
