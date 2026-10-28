import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MessageCircle, 
  ArrowRight, 
  Globe, 
  Eye,
  Palette
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { buildWhatsAppInquiryUrl } from '../config';
import { getAllTemplates } from '../../templates';

export const HomePage: React.FC = () => {
  const { isUrdu, language, setLanguage, t } = useLanguage();
  const templates = getAllTemplates();

  return (
    <div className="relative overflow-hidden bg-canvas">
      {/* Subtle Top Ambient Tint */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[360px] bg-canvas-subtle/70 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 text-center">
        {/* Language Quick Switcher Badge */}
        <div className="inline-flex items-center gap-2.5 p-1 px-3.5 rounded-full bg-surface border border-border shadow-card mb-8">
          <Globe className="w-4 h-4 text-accent" />
          <span className="text-xs text-content-muted font-medium">
            {isUrdu ? 'زبان تبدیل کریں:' : 'Switch Language:'}
          </span>
          <button
            onClick={() => setLanguage('ur')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              isUrdu
                ? 'bg-primary text-primary-content shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            اردو
          </button>
          <span className="text-xs text-border">|</span>
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              !isUrdu
                ? 'bg-primary text-primary-content shadow-sm'
                : 'text-content-muted hover:text-content'
            }`}
          >
            English
          </button>
        </div>

        {/* Hero Title */}
        <h1 className={`text-3xl sm:text-5xl lg:text-6xl font-bold text-content leading-tight mb-6 ${
          isUrdu ? 'font-urdu-heading text-4xl sm:text-5xl lg:text-6xl text-primary' : 'font-serif tracking-tight'
        }`}>
          {isUrdu ? (
            <>
              شادی کے شاندار ڈیجیٹل کارڈز <br />
              <span className="text-accent-hover font-bold">
                اب واٹس ایپ پر ایک کلک میں بھیجیں
              </span>
            </>
          ) : (
            <>
              Grandeur in Every Invite, <br />
              <span className="text-primary italic font-normal">
                One-Click WhatsApp Sharing for Pakistan
              </span>
            </>
          )}
        </h1>

        {/* Hero Subtitle */}
        <p className={`max-w-2xl mx-auto text-base sm:text-lg text-content-muted font-normal leading-relaxed mb-10 ${
          isUrdu ? 'font-urdu-body text-base' : 'font-sans'
        }`}>
          {isUrdu
            ? 'شادی لنک پر اپنی پسند کا شادی کارڈ منتخب کریں، واٹس ایپ پر تفصیلات بھیجیں، اور اپنے مہمانوں کو باوقار انداز میں ان کے نام کے ساتھ مدعو کیجیے۔'
            : 'Choose your wedding invitation design below, view its live demo, and tap WhatsApp to order in seconds.'}
        </p>
      </section>

      {/* INVITATION DESIGNS GALLERY SECTION (Auto-generated from Template Registry) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-subtle border border-accent/30 text-xs text-accent-hover font-semibold mb-3">
            <Palette className="w-3.5 h-3.5 text-accent" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>
              {isUrdu ? 'شادی کے خصوصی ڈیزائنز' : 'Curated Wedding Collection'}
            </span>
          </div>
          <h2 className={`text-2xl sm:text-4xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
            {isUrdu ? 'دعوتی کارڈز کی گیلری' : 'Invitation Designs Gallery'}
          </h2>
          <p className={`text-xs sm:text-sm text-content-muted mt-2 max-w-xl mx-auto ${isUrdu ? 'font-urdu-body' : ''}`}>
            {isUrdu
              ? 'ہر کارڈ کا اپنا انوکھا انداز اور اینیمیشن ہے۔ لائیو ڈیمو دیکھیں یا براہِ راست واٹس ایپ پر آرڈر کریں۔'
              : 'Each design offers unique interactive animations and cultural styling. Tap to preview or order directly on WhatsApp.'}
          </p>
          <div className="w-16 h-0.5 bg-accent mx-auto mt-4" />
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
          {templates.map((tpl) => {
            const displayName = isUrdu ? tpl.nameUrdu : tpl.name;
            const displayMood = isUrdu ? tpl.mood.ur : tpl.mood.en;
            const displayDesc = isUrdu ? tpl.description.ur : tpl.description.en;
            const Thumbnail = tpl.thumbnail;
            const demoUrl = `${window.location.origin}/demo/${tpl.slug}`;
            const whatsappUrl = buildWhatsAppInquiryUrl({
              designName: displayName,
              designCode: tpl.code,
              language,
              demoUrl,
            });

            return (
              <div
                key={tpl.slug}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all flex flex-col group"
              >
                {/* Card Thumbnail */}
                <div className="p-4 bg-canvas-subtle/50 border-b border-border">
                  <Thumbnail className="w-full h-52 sm:h-56" />
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Header Row: Code & Mood */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-subtle text-primary border border-accent/30 font-mono">
                        {tpl.code}
                      </span>
                      <span className={`text-xs text-content-muted ${isUrdu ? 'font-urdu-body' : 'font-medium'}`}>
                        {displayMood}
                      </span>
                    </div>

                    {/* Design Name */}
                    <h3 className={`text-2xl font-bold text-content mb-2 group-hover:text-primary transition-colors ${
                      isUrdu ? 'font-urdu-heading text-xl' : 'font-serif'
                    }`}>
                      {displayName}
                    </h3>

                    {/* Color Palette Dots */}
                    <div className="flex items-center gap-1.5 mb-4">
                      {tpl.palette.previewColors.map((color, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    {/* Description */}
                    <p className={`text-xs sm:text-sm text-content-muted leading-relaxed mb-6 font-normal ${
                      isUrdu ? 'font-urdu-body' : 'font-sans'
                    }`}>
                      {displayDesc}
                    </p>
                  </div>

                  {/* Actions: View Demo & Order on WhatsApp */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border">
                    <Link
                      to={`/demo/${tpl.slug}`}
                      className="min-h-[48px] h-12 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-content text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <Eye className="w-4 h-4 text-accent" />
                      <span className={isUrdu ? 'font-urdu-body' : ''}>{t.viewDemo}</span>
                    </Link>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[48px] h-12 rounded-xl bg-primary hover:bg-primary-hover text-primary-content text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className={isUrdu ? 'font-urdu-body' : ''}>{t.orderOnWhatsApp}</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Step-by-Step Flow Explanation (Simple for Non-Technical Clients) */}
        <div className="max-w-4xl mx-auto my-16">
          <div className="text-center mb-10">
            <h2 className={`text-2xl sm:text-3xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
              {t.simpleThreeSteps}
            </h2>
            <div className="w-16 h-0.5 bg-accent mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface border border-border rounded-2xl p-7 text-center shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-5 text-primary font-bold text-lg font-serif">
                1
              </div>
              <h3 className={`text-lg font-bold text-content mb-2 ${isUrdu ? 'font-urdu-heading text-base' : 'font-serif'}`}>
                {t.step1Title}
              </h3>
              <p className={`text-xs sm:text-sm text-content-muted leading-relaxed font-normal ${isUrdu ? 'font-urdu-body' : ''}`}>
                {t.step1Desc}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 text-center shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-full bg-accent-subtle border border-accent/40 flex items-center justify-center mx-auto mb-5 text-accent font-bold text-lg">
                <MessageCircle className="w-6 h-6 text-accent-hover" />
              </div>
              <h3 className={`text-lg font-bold text-content mb-2 ${isUrdu ? 'font-urdu-heading text-base' : 'font-serif'}`}>
                {t.step2Title}
              </h3>
              <p className={`text-xs sm:text-sm text-content-muted leading-relaxed font-normal ${isUrdu ? 'font-urdu-body' : ''}`}>
                {t.step2Desc}
              </p>
            </div>

            <div className="bg-surface border border-border rounded-2xl p-7 text-center shadow-card hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-5 text-primary font-bold text-lg font-serif">
                3
              </div>
              <h3 className={`text-lg font-bold text-content mb-2 ${isUrdu ? 'font-urdu-heading text-base' : 'font-serif'}`}>
                {t.step3Title}
              </h3>
              <p className={`text-xs sm:text-sm text-content-muted leading-relaxed font-normal ${isUrdu ? 'font-urdu-body' : ''}`}>
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
