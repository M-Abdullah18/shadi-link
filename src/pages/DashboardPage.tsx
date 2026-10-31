import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  UserPlus,
  LogOut,
  Loader2,
  ShieldCheck,
  Edit,
  Eye,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { checkAdminAuth, logoutAdmin } from '../api/auth';
import { listWeddings, deleteWedding, WeddingSummary } from '../api/weddings';

export const DashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [weddings, setWeddings] = useState<WeddingSummary[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Deletion modal state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { isUrdu } = useLanguage();
  const navigate = useNavigate();

  // Route protection & data fetching
  useEffect(() => {
    let isMounted = true;
    checkAdminAuth().then((isAuthenticated) => {
      if (!isMounted) return;
      if (!isAuthenticated) {
        navigate('/admin', { replace: true });
        return;
      }
      loadWeddings();
    });

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const loadWeddings = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const data = await listWeddings();
      setWeddings(data);
    } catch (_err) {
      setFetchError(
        isUrdu
          ? 'جوڑوں کی فہرست لوڈ کرنے میں دشواری پیش آئی۔ برائے مہربانی صفحہ ریفریش کریں۔'
          : 'Could not load the list of couples. Please try refreshing.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutAdmin();
    navigate('/admin', { replace: true });
  };

  const confirmDelete = (w: WeddingSummary) => {
    setDeletingId(w.id);
    setDeletingName(w.displayTitle);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteWedding(deletingId);
      setWeddings((prev) => prev.filter((w) => w.id !== deletingId));
      setDeletingId(null);
    } catch (_err) {
      setDeleteError(
        isUrdu
          ? 'حذف کرنے میں خرابی ہوئی۔ دوبارہ کوشش کیجیے۔'
          : 'Failed to delete wedding. Please try again.'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const getDesignDisplayName = (slug: string) => {
    const map: Record<string, { en: string; ur: string }> = {
      'emerald-royale': { en: 'Emerald Royale (D01)', ur: 'زمرد و طلائی شاہی (D01)' },
      'sea-breeze': { en: 'Sea Breeze (D02)', ur: 'نسیمِ سحر (D02)' },
      'shahi-darbar': { en: 'Shahi Darbar (D03)', ur: 'شاہی دربار (D03)' },
      'chandni-raat': { en: 'Chandni Raat (D04)', ur: 'چاندنی رات (D04)' },
    };
    return map[slug]?.[isUrdu ? 'ur' : 'en'] || slug;
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-content-muted text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'ڈیش بورڈ لوڈ ہو رہا ہے...' : 'Loading dashboard...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-canvas">
      {/* Top Banner with Authorized Badge & Logout Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-5 border-b border-border">
        <div className="text-center sm:text-start">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-accent-hover uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-accent" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>
              {isUrdu ? 'سائٹ انتظامیہ (محفوظ پورٹل)' : 'Site Administration (Authorized)'}
            </span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
            {isUrdu ? 'ایڈمن ڈیش بورڈ' : 'Admin Dashboard'}
          </h1>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="min-h-[48px] h-12 px-5 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-content hover:text-error text-sm font-medium shadow-card transition-all active:scale-95 flex items-center gap-2"
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

      {/* 1. THE FIRST AND BIGGEST ELEMENT: ADD COUPLE BUTTON */}
      <div className="mb-10">
        <Link
          to="/admin/weddings/new"
          className="min-h-[64px] py-4 px-8 w-full rounded-2xl bg-primary hover:bg-primary-hover text-primary-content text-lg sm:text-xl font-bold shadow-lg flex items-center justify-center gap-3 transition-all transform hover:-translate-y-0.5 active:scale-[0.99] border border-primary-content/20"
        >
          <UserPlus className="w-7 h-7 shrink-0 text-accent" />
          <span className={isUrdu ? 'font-urdu-heading text-xl' : 'font-serif tracking-wide'}>
            {isUrdu ? 'اضافہ جوڑا' : 'Add Couple'}
          </span>
        </Link>
      </div>

      {/* Fetch Error Display */}
      {fetchError && (
        <div className="mb-8 p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className={`text-sm ${isUrdu ? 'font-urdu-body' : ''}`}>{fetchError}</span>
          <button
            onClick={loadWeddings}
            className="ml-auto underline text-xs font-semibold cursor-pointer"
          >
            {isUrdu ? 'دوبارہ کوشش' : 'Retry'}
          </button>
        </div>
      )}

      {/* 2. LIST OF COUPLES (CARDS) OR FRIENDLY EMPTY STATE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <h2 className={`text-lg font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
            {isUrdu ? 'شادی کے دعوتی کارڈز' : 'Wedding Invitations'}
          </h2>
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-surface border border-border text-content-muted">
            {weddings.length} {isUrdu ? 'جوڑے' : 'Couples'}
          </span>
        </div>

        {weddings.length === 0 ? (
          /* Friendly Empty State pointing to Add Couple */
          <div className="bg-surface border-2 border-dashed border-border rounded-2xl p-10 sm:p-14 text-center shadow-card">
            <div className="w-16 h-16 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-4 text-primary">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className={`text-xl font-bold text-content mb-2 ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
              {isUrdu ? 'ابھی تک کوئی جوڑا شامل نہیں کیا گیا' : 'No Couples Added Yet'}
            </h3>
            <p className={`text-sm text-content-muted max-w-md mx-auto mb-6 ${isUrdu ? 'font-urdu-body' : ''}`}>
              {isUrdu
                ? 'شروع کرنے کے لیے اوپر موجود "اضافہ جوڑا" کے بڑے بٹن پر کلک کریں اور شادی کی تفصیلات درج کیجیے۔'
                : 'Click the big "Add Couple" button above to create your first client wedding invitation.'}
            </p>
            <Link
              to="/admin/weddings/new"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-content text-sm font-semibold shadow-sm hover:bg-primary-hover transition-colors"
            >
              <UserPlus className="w-4 h-4 text-accent" />
              <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'پہلا جوڑا بنائیں' : 'Create First Couple'}</span>
            </Link>
          </div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 gap-4">
            {weddings.map((w) => {
              const isReady = w.status === 'ready';

              return (
                <div
                  key={w.id}
                  className="bg-surface border border-border rounded-2xl p-5 sm:p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  {/* Left: Names & Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className={`text-xl font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                        {w.displayTitle || (isUrdu ? 'بے نام جوڑا' : 'Untitled Couple')}
                      </h3>
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                          isReady
                            ? 'bg-success/10 text-success border-success/30'
                            : 'bg-content-muted/10 text-content-muted border-border'
                        }`}
                      >
                        {isReady ? (
                          <CheckCircle2 className="w-3 h-3 text-success" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-content-muted" />
                        )}
                        <span className={isUrdu ? 'font-urdu-body' : ''}>
                          {isReady ? (isUrdu ? 'تیار' : 'Ready') : isUrdu ? 'مسودہ' : 'Draft'}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-content-muted">
                      <div>
                        <span className="font-semibold text-content">{isUrdu ? 'ڈیزائن: ' : 'Design: '}</span>
                        <span>{getDesignDisplayName(w.designSlug)}</span>
                      </div>
                      {w.firstEventDate && (
                        <div className="flex items-center gap-1 text-primary">
                          <Calendar className="w-3.5 h-3.5 text-accent" />
                          <span>{w.firstEventDate}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions (Edit, Preview, Delete) */}
                  <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-border">
                    {/* Preview Button */}
                    <Link
                      to={`/admin/weddings/${w.id}/preview`}
                      className="min-h-[44px] h-11 px-4 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-primary text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                      title={isUrdu ? 'ڈیمو دیکھیں' : 'Preview'}
                    >
                      <Eye className="w-4 h-4 text-accent" />
                      <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'پریویو' : 'Preview'}</span>
                    </Link>

                    {/* Edit Button */}
                    <Link
                      to={`/admin/weddings/${w.id}/edit`}
                      className="min-h-[44px] h-11 px-4 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-content text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
                      title={isUrdu ? 'ترمیم کریں' : 'Edit'}
                    >
                      <Edit className="w-4 h-4 text-accent" />
                      <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'ترمیم' : 'Edit'}</span>
                    </Link>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => confirmDelete(w)}
                      className="min-h-[44px] h-11 px-3 rounded-xl bg-surface hover:bg-error/10 border border-border hover:border-error/40 text-content-muted hover:text-error text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                      title={isUrdu ? 'حذف کریں' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-border rounded-2xl max-w-md w-full p-6 shadow-modal">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 text-error flex items-center justify-center">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setDeletingId(null)}
                className="text-content-muted hover:text-content p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className={`text-lg font-bold text-content mb-2 ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
              {isUrdu ? 'کیا آپ واقعی یہ کارڈ حذف کرنا چاہتے ہیں؟' : 'Delete Wedding Invitation?'}
            </h3>

            <p className={`text-sm text-content-muted mb-6 leading-relaxed ${isUrdu ? 'font-urdu-body' : ''}`}>
              {isUrdu
                ? `کیا آپ واقعی "${deletingName}" کا دعوت نامہ حذف کرنا چاہتے ہیں؟ یہ عمل واپس نہیں کیا جا سکتا۔`
                : `Are you sure you want to permanently delete the wedding record for "${deletingName}"? This action cannot be undone.`}
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-canvas hover:bg-canvas-subtle border border-border text-xs font-semibold text-content transition-colors"
              >
                {isUrdu ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="min-h-[44px] px-5 py-2 rounded-xl bg-error hover:bg-error-hover text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isUrdu ? 'ہاں، حذف کریں' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
