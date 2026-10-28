import React from 'react';
import { HeartHandshake, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { buildWhatsAppInquiryUrl } from '../../config';

export const Footer: React.FC = () => {
  const { isUrdu, t, language } = useLanguage();

  const generalWhatsAppUrl = buildWhatsAppInquiryUrl({
    designName: isUrdu ? 'عام رابطہ' : 'General Contact',
    designCode: 'SL-FOOTER',
    language,
    demoUrl: window.location.origin,
  });

  return (
    <footer className="bg-canvas-subtle text-content border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-primary-subtle border border-accent/30 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5 text-primary" />
              </div>
              <span className={`text-2xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-xl' : 'font-serif'}`}>
                {t.appName}
              </span>
            </div>
            <p className={`text-xs text-content-muted leading-relaxed ${isUrdu ? 'font-urdu-body' : ''}`}>
              {t.footerAbout}
            </p>
            <div className="flex items-center gap-2 text-xs text-accent-hover font-medium">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{isUrdu ? 'لاہور • کراچی • اسلام آباد • پاکستان بھر میں' : 'Lahore • Karachi • Islamabad • Worldwide'}</span>
            </div>
          </div>

          {/* Direct WhatsApp Ordering */}
          <div className="space-y-3">
            <h4 className={`text-primary font-semibold text-sm uppercase tracking-wider ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
              {t.contactWhatsApp}
            </h4>
            <p className={`text-xs text-content-muted leading-relaxed ${isUrdu ? 'font-urdu-body' : ''}`}>
              {t.quickWhatsAppDesc}
            </p>
            <a
              href={generalWhatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="min-h-[48px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-xs shadow-sm transition-all active:scale-95"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isUrdu ? '0324-6540244 پر رابطہ کریں' : 'WhatsApp +92 324 6540244'}</span>
            </a>
          </div>

          {/* Privacy Note */}
          <div className="bg-surface p-5 rounded-2xl border border-border space-y-2 shadow-card">
            <div className="flex items-center gap-2 text-xs text-primary font-semibold">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span className={isUrdu ? 'font-urdu-heading' : ''}>
                {isUrdu ? 'مکمل رازداری اور محفوظ ٹوکنز' : 'Secure & Private Invitations'}
              </span>
            </div>
            <p className={`text-xs text-content-muted leading-relaxed ${isUrdu ? 'font-urdu-body' : ''}`}>
              {isUrdu
                ? 'مہمانوں کے فون نمبرز اور نجی ڈیٹا مکمل محفوظ رہتے ہیں۔ ہر مہمان کو صرف ان کے مخصوص کارڈ کا محفوظ لنک ملتا ہے۔'
                : 'All invitation links use high-entropy random hashes. Private guest details and contact numbers are never exposed.'}
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-content-muted gap-3">
          <p className={isUrdu ? 'font-urdu-body' : ''}>
            © {new Date().getFullYear()} {t.appName}. {t.allRightsReserved}
          </p>
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-primary transition-colors">
              {t.home}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
