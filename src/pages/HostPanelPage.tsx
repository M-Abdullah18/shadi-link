import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const HostPanelPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { isUrdu } = useLanguage();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-canvas">
      <div className="max-w-lg w-full bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-card text-center">
        <div className="w-14 h-14 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-4 text-primary shadow-sm">
          <Users className="w-7 h-7" />
        </div>
        <span className="text-xs font-semibold px-3.5 py-1 rounded-full bg-accent-subtle text-accent-hover border border-accent/30 inline-block mb-3">
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'مرحلہ ۵ پریویو' : 'Step 5 Preview'}
          </span>
        </span>
        <h1 className={`text-2xl font-bold text-content mt-2 mb-2 ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
          {isUrdu ? 'میزبان کا نجی پینل' : 'Host Invitation Dispatch Panel'}
        </h1>
        <p className={`text-xs sm:text-sm text-content-muted mb-6 font-normal leading-relaxed ${isUrdu ? 'font-urdu-body' : 'font-sans'}`}>
          {isUrdu
            ? 'مہمان کا نام، فون نمبر، تقاریب کا انتخاب اور ایک کلک میں واٹس ایپ پر ذاتی لنک بھیجنے کا پینل مرحلہ ۵ میں فعال ہوگا۔'
            : 'Personal invites with guest names, phone normalization (03XX -> 923XX), and one-tap WhatsApp dispatch will be wired in Step 5.'}
        </p>
        <div className="p-3 rounded-xl bg-canvas-subtle border border-border font-mono text-xs text-primary mb-6 break-all">
          Host Token: {token || 'host-sample-token'}
        </div>
        <Link
          to="/"
          className="min-h-[48px] h-12 inline-flex items-center justify-center gap-2 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'مرکزی صفحہ پر جائیں' : 'Back to Home'}</span>
        </Link>
      </div>
    </div>
  );
};
