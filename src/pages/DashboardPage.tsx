import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CalendarPlus, Sparkles, LogOut, Loader2, ShieldCheck, Palette, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { checkAdminAuth, logoutAdmin } from '../api/auth';
import { getAllTemplates } from '../../templates';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();
  const templates = getAllTemplates();

  // Route protection: verify session against /api/admin/me
  useEffect(() => {
    let isMounted = true;
    checkAdminAuth().then((isAuthenticated) => {
      if (isMounted) {
        if (!isAuthenticated) {
          navigate('/admin', { replace: true });
        } else {
          setLoading(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAdmin();
    navigate('/admin', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-content-muted text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'ڈیش بورڈ لوڈ ہو رہا ہے...' : 'Verifying admin authorization...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 bg-canvas">
      {/* Top Banner with Logout Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-border">
        <div className="text-center sm:text-start">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-accent-hover uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>
              {isUrdu ? 'سائٹ انتظامیہ (محفوظ پورٹل)' : 'Site Administration (Authorized)'}
            </span>
          </div>
          <h1 className={`text-3xl sm:text-4xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
            {isUrdu ? 'ایڈمن ڈیش بورڈ' : 'Admin Dashboard'}
          </h1>
        </div>

        {/* Logout Button (Min 48px height) */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="min-h-[48px] h-12 px-6 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-content hover:text-error text-sm font-medium shadow-card transition-all active:scale-95 flex items-center gap-2"
        >
          {loggingOut ? (
            <Loader2 className="w-4 h-4 animate-spin text-content-muted" />
          ) : (
            <LogOut className="w-4 h-4 text-accent" />
          )}
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'لاگ آؤٹ کریں' : 'Log Out'}
          </span>
        </button>
      </div>

      {/* Clean Friendly Empty State */}
      <div className="bg-surface border border-border rounded-2xl p-8 sm:p-12 text-center shadow-card mb-8">
        <div className="w-16 h-16 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-5 text-primary shadow-sm">
          <CalendarPlus className="w-8 h-8" />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-subtle border border-accent/30 text-xs text-accent-hover font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'مرحلہ ۳ میں دستیاب ہوگا' : 'Coming in Step 3'}
          </span>
        </div>

        <h2 className={`text-2xl font-bold text-content mb-2 ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
          {isUrdu ? 'شادی کے کارڈز کی تخلیق اور انتظام' : 'Wedding Creation & Management'}
        </h2>

        <p className={`max-w-md mx-auto text-sm text-content-muted font-normal leading-relaxed mb-6 ${isUrdu ? 'font-urdu-body text-base' : 'font-sans'}`}>
          {isUrdu
            ? 'نئے شادی کے کارڈز اور تقاریب یہاں سے بنائی اور منظم کی جائیں گی۔'
            : 'Weddings and their events will be created and managed from this panel.'}
        </p>
      </div>

      {/* Auto-populated Registered Template Designs */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8 shadow-card">
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-border">
          <Palette className="w-5 h-5 text-accent" />
          <h3 className={`text-lg font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
            {isUrdu ? 'رجسٹرڈ دعوتی ٹیمپلیٹس' : 'Active Template Registry'}
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-canvas-subtle text-content-muted">
            {templates.length} Designs
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {templates.map((tpl) => (
            <div
              key={tpl.slug}
              className="p-4 rounded-xl border border-border bg-canvas-subtle/50 flex items-center justify-between gap-3 hover:border-primary/50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-subtle text-primary border border-accent/30">
                    {tpl.code}
                  </span>
                  <span className={`text-sm font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                    {isUrdu ? tpl.nameUrdu : tpl.name}
                  </span>
                </div>
                <p className="text-xs text-content-muted">
                  {isUrdu ? tpl.mood.ur : tpl.mood.en}
                </p>
              </div>

              <Link
                to={`/demo/${tpl.slug}`}
                target="_blank"
                className="min-h-[36px] px-3 py-1.5 rounded-lg bg-surface hover:bg-canvas border border-border text-xs font-medium text-primary flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isUrdu ? 'ڈیمو' : 'Demo'}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
