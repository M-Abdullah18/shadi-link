import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Eye, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { buildWhatsAppInquiryUrl } from '../config';
import { getTemplate } from '../../templates';
import { NotFoundPage } from './NotFoundPage';

export const DesignDemoPage: React.FC = () => {
  const { designSlug } = useParams<{ designSlug: string }>();
  const { isUrdu, language, t } = useLanguage();

  const template = getTemplate(designSlug || '');

  // If slug is not in template registry, render 404 page
  if (!template) {
    return <NotFoundPage />;
  }

  const TemplateComponent = template.component;
  const displayName = isUrdu ? template.nameUrdu : template.name;

  const whatsappUrl = buildWhatsAppInquiryUrl({
    designName: displayName,
    designCode: template.code,
    language,
    demoUrl: window.location.href,
  });

  return (
    <div className="relative min-h-screen bg-canvas">
      {/* Sticky Demo Bar */}
      <div className="sticky top-20 z-30 bg-surface/95 backdrop-blur-md border-b border-border py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'گیلری' : 'Gallery'}</span>
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-subtle text-primary border border-accent/30 font-mono">
                {template.code}
              </span>
              <span className={`text-sm font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                {displayName}
              </span>
              <span className="text-xs text-content-muted hidden md:inline">
                ({isUrdu ? template.mood.ur : template.mood.en})
              </span>
            </div>
          </div>

          {/* Large WhatsApp Inquiry Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] h-11 w-full sm:w-auto px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-xs shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>{t.orderOnWhatsApp}</span>
          </a>
        </div>
      </div>

      {/* Render Template with Sample Data */}
      <div className="w-full">
        <TemplateComponent
          data={template.sampleData}
          language={language}
          guestName={isUrdu ? 'جناب طارق عزیز اور فیملی' : 'Mr. Tariq Aziz & Family'}
          isCommonLink={false}
        />
      </div>

      {/* Floating Bottom WhatsApp Bar for Easy Mobile Access */}
      <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-40 sm:hidden">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="min-h-[48px] h-12 w-full rounded-2xl bg-primary hover:bg-primary-hover text-primary-content font-bold text-sm shadow-modal flex items-center justify-center gap-2.5 transition-transform active:scale-95 border border-primary-content/20"
        >
          <MessageCircle className="w-5 h-5" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>{t.orderOnWhatsApp}</span>
        </a>
      </div>
    </div>
  );
};
