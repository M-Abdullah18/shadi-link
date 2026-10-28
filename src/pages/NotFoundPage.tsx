import React from 'react';
import { Link } from 'react-router-dom';
import { HeartCrack, Home } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NotFoundPage: React.FC = () => {
  const { isUrdu } = useLanguage();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center bg-canvas">
      <div className="max-w-md bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-card">
        <div className="w-16 h-16 rounded-full bg-error-subtle border border-error/20 flex items-center justify-center mx-auto mb-5 text-error">
          <HeartCrack className="w-8 h-8" />
        </div>
        <span className="text-xs uppercase tracking-wider text-accent-hover font-semibold">
          404 - Page Not Found
        </span>
        <h1 className={`text-2xl sm:text-3xl font-bold text-content mt-2 mb-3 ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
          {isUrdu ? 'صفحہ دستیاب نہیں ہے' : 'Page Not Found'}
        </h1>
        <p className={`text-xs sm:text-sm text-content-muted mb-8 font-normal leading-relaxed ${isUrdu ? 'font-urdu-body' : 'font-sans'}`}>
          {isUrdu
            ? 'مطلوبہ صفحہ یا شادی کا لنک تبدیل یا ختم ہو چکا ہے۔'
            : 'The page or wedding link you are looking for does not exist or may have expired.'}
        </p>
        <Link
          to="/"
          className="min-h-[48px] h-12 inline-flex items-center justify-center gap-2 px-7 rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-sm shadow-sm transition-all active:scale-95 w-full sm:w-auto"
        >
          <Home className="w-4 h-4" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'مرکزی صفحہ پر جائیں' : 'Return to ShaadiLink Home'}
          </span>
        </Link>
      </div>
    </div>
  );
};
