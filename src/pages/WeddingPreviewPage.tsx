import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Globe, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { checkAdminAuth } from '../api/auth';
import { getWedding, WeddingRecord } from '../api/weddings';
import { getTemplate } from '../../templates';
import { TemplateWeddingData, TemplateEvent } from '../../templates/types';
import { formatParentNames, formatEventTypeName } from '../utils/formatters';

export const WeddingPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isUrdu, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [wedding, setWedding] = useState<WeddingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Allow preview-specific language switching
  const [previewLang, setPreviewLang] = useState<'en' | 'ur'>(language);

  useEffect(() => {
    let isMounted = true;
    checkAdminAuth().then((authenticated) => {
      if (!isMounted) return;
      if (!authenticated) {
        navigate('/admin', { replace: true });
        return;
      }

      if (id) {
        getWedding(id)
          .then((w) => {
            if (!isMounted) return;
            setWedding(w);
            setPreviewLang(w.language || language);
          })
          .catch((err) => {
            if (!isMounted) return;
            setError(err.message || 'Failed to load wedding for preview');
          })
          .finally(() => {
            if (!isMounted) return;
            setLoading(false);
          });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id, navigate, language]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-content-muted text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'پریویو تیار ہو رہا ہے...' : 'Generating invitation preview...'}
          </span>
        </div>
      </div>
    );
  }

  if (error || !wedding) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-content mb-2">{error || 'Wedding not found'}</h2>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-content text-xs font-semibold mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const template = getTemplate(wedding.designSlug) || getTemplate('emerald-royale');
  if (!template) {
    return (
      <div className="p-8 text-center">
        <p>Template not found for slug: {wedding.designSlug}</p>
        <Link to="/admin/dashboard" className="text-primary underline">Return to Dashboard</Link>
      </div>
    );
  }

  const TemplateComponent = template.component;

  // Format Urdu and English dates and times in Pakistan time
  const mappedEvents: TemplateEvent[] = (wedding.events || []).map((e, index) => {
    const startsAtDate = new Date(e.startsAt);

    // English formatting in Asia/Karachi
    const dateEn = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(startsAtDate);

    const timeEn = new Intl.DateTimeFormat('en-PK', {
      timeZone: 'Asia/Karachi',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(startsAtDate) + ' PKT';

    // Urdu formatting in Asia/Karachi
    const dateUr = new Intl.DateTimeFormat('ur-PK', {
      timeZone: 'Asia/Karachi',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(startsAtDate);

    const timeUr = new Intl.DateTimeFormat('ur-PK', {
      timeZone: 'Asia/Karachi',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(startsAtDate);

    return {
      id: `evt-${index}`,
      name: formatEventTypeName(e.type, 'en'),
      nameUr: formatEventTypeName(e.type, 'ur'),
      date: dateEn,
      dateUr: dateUr,
      time: timeEn,
      timeUr: timeUr,
      venueName: e.venueName,
      venueNameUr: e.venueName,
      venueAddress: e.venueName,
      venueAddressUr: e.venueName,
      city: 'Pakistan',
      cityUr: 'پاکستان',
      googleMapsUrl: e.mapUrl,
      startsAt: e.startsAt,
    };
  });

  // Target countdown date = first event date or wedding expiresAt
  const countdownTarget =
    wedding.events && wedding.events.length > 0 && wedding.events[0]?.startsAt
      ? wedding.events[0].startsAt
      : wedding.expiresAt;

  // Transform to TemplateWeddingData using the shared parent names helper
  const templateData: TemplateWeddingData = {
    id: wedding.id || (wedding as any)._id,
    designCode: template.code,
    designSlug: wedding.designSlug,
    coupleNames: {
      groom: wedding.groomName,
      groomUr: wedding.groomName,
      bride: wedding.brideName,
      brideUr: wedding.brideName,
    },
    parentsNames: {
      groomParents: formatParentNames(wedding.groomFatherName, 'en'),
      groomParentsUr: formatParentNames(wedding.groomFatherName, 'ur'),
      brideParents: formatParentNames(wedding.brideFatherName, 'en'),
      brideParentsUr: formatParentNames(wedding.brideFatherName, 'ur'),
    },
    weddingDate: countdownTarget,
    events: mappedEvents,
    customMessage: 'Together with their families, request the honor of your presence.',
    customMessageUr: 'ہم اپنے اہل خانہ کے ہمراہ آپ کو شادی کی پرمسرت تقریب میں شرکت کی دلی دعوت دیتے ہیں۔',
  };

  return (
    <div className="relative min-h-screen bg-canvas">
      {/* Top Preview Admin Navigation Bar */}
      <div className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md border-b border-border py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-content-muted hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
            </Link>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-primary-subtle text-primary border border-accent/30 font-mono">
                {template.code}
              </span>
              <span className="text-xs font-bold text-content font-serif">
                {wedding.displayTitle}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-accent-subtle text-accent-hover hidden sm:inline">
                Admin Live Preview
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher for Preview Testing */}
            <div className="inline-flex items-center gap-1 p-0.5 rounded-lg bg-canvas border border-border">
              <button
                type="button"
                onClick={() => setPreviewLang('en')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  previewLang === 'en'
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setPreviewLang('ur')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  previewLang === 'ur'
                    ? 'bg-primary text-primary-content shadow-xs'
                    : 'text-content-muted hover:text-content'
                }`}
              >
                اردو
              </button>
            </div>

            {/* Edit Button */}
            <Link
              to={`/admin/weddings/${wedding.id || (wedding as any)._id}/edit`}
              className="min-h-[38px] px-3.5 rounded-xl bg-surface hover:bg-canvas border border-border text-xs font-semibold text-content flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-accent" />
              <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'ترمیم کریں' : 'Edit Couple'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Render Chosen Template with Real Data */}
      <div className="w-full">
        <TemplateComponent
          data={templateData}
          language={previewLang}
          guestName={previewLang === 'ur' ? 'محترم و مکرم مہمان' : 'Respected Guest'}
          isCommonLink={false}
        />
      </div>
    </div>
  );
};
