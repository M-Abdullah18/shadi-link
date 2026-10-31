import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Save,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Image as ImageIcon,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  Info,
  Palette,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { checkAdminAuth } from '../api/auth';
import {
  getWedding,
  createWedding,
  updateWedding,
  getAdminDesigns,
  uploadAdminImage,
  deleteAdminImage,
  WeddingInput,
  WeddingEventInput,
  AdminDesign,
} from '../api/weddings';
import { isValidGoogleMapsUrl, formatEventTypeName } from '../utils/formatters';
import { resizeImageInBrowser } from '../utils/imageResize';

const ORDERED_EVENT_TYPES = [
  { key: 'mehndi', en: 'Mehndi', ur: 'مہندی' },
  { key: 'nikah', en: 'Nikah', ur: 'نکاح' },
  { key: 'barat', en: 'Barat', ur: 'بارات' },
  { key: 'shaadi', en: 'Shaadi (Nikah + Barat)', ur: 'شادی (نکاح و بارات)' },
  { key: 'walima', en: 'Walima', ur: 'ولیمہ' },
] as const;

export const WeddingFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const { isUrdu } = useLanguage();
  const navigate = useNavigate();

  // Page level state
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedWeddingId, setSavedWeddingId] = useState<string | null>(id || null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [designs, setDesigns] = useState<AdminDesign[]>([]);

  // Track unsaved dirty state for beforeunload warning
  const [isDirty, setIsDirty] = useState(false);

  // Collapsible section toggles (1, 2, 3)
  const [openSection1, setOpenSection1] = useState(true);
  const [openSection2, setOpenSection2] = useState(true);
  const [openSection3, setOpenSection3] = useState(true);

  // Section 1: Couple Names
  const [groomName, setGroomName] = useState('');
  const [groomFatherName, setGroomFatherName] = useState('');
  const [brideName, setBrideName] = useState('');
  const [brideFatherName, setBrideFatherName] = useState('');

  // Section 2: Functions State
  interface LocalEventItem {
    id: string; // client local id
    type: 'mehndi' | 'nikah' | 'barat' | 'shaadi' | 'walima';
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    venueName: string;
    venueImageId?: string | null;
    venueImagePreview?: string | null;
    mapUrl: string;
    isUploadingImage?: boolean;
    imageError?: string | null;
    isExpanded: boolean;
  }

  const [events, setEvents] = useState<LocalEventItem[]>([]);
  const [showAddFunctionPicker, setShowAddFunctionPicker] = useState(false);

  // Section 3: Design & Language
  const [designSlug, setDesignSlug] = useState<'emerald-royale' | 'sea-breeze' | 'shahi-darbar' | 'chandni-raat'>('emerald-royale');
  const [languageChoice, setLanguageChoice] = useState<'en' | 'ur'>('en');

  // Verify auth on mount
  useEffect(() => {
    checkAdminAuth().then((authenticated) => {
      if (!authenticated) {
        navigate('/admin', { replace: true });
      }
    });
  }, [navigate]);

  // Load designs catalog & existing wedding if editing
  useEffect(() => {
    let isMounted = true;

    async function loadInitial() {
      try {
        const fetchedDesigns = await getAdminDesigns();
        if (!isMounted) return;
        setDesigns(fetchedDesigns);

        if (isEditing && id) {
          const wedding = await getWedding(id);
          if (!isMounted) return;

          setGroomName(wedding.groomName || '');
          setGroomFatherName(wedding.groomFatherName || '');
          setBrideName(wedding.brideName || '');
          setBrideFatherName(wedding.brideFatherName || '');
          setDesignSlug(wedding.designSlug as any);
          setLanguageChoice(wedding.language || 'en');

          // Parse events
          const mappedEvents: LocalEventItem[] = (wedding.events || []).map((e, index) => {
            const startsAtDate = new Date(e.startsAt);
            // Format to YYYY-MM-DD and HH:mm in Pakistan time (UTC+5)
            const pkDateStr = startsAtDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }); // YYYY-MM-DD
            const pkTimeStr = startsAtDate.toLocaleTimeString('en-GB', {
              timeZone: 'Asia/Karachi',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            });

            return {
              id: `evt-${index}-${Date.now()}`,
              type: e.type,
              date: pkDateStr,
              time: pkTimeStr,
              venueName: e.venueName,
              venueImageId: e.venueImageId,
              venueImagePreview: e.venueImageId ? `/api/images/${e.venueImageId}` : null,
              mapUrl: e.mapUrl,
              isExpanded: false,
            };
          });

          setEvents(mappedEvents);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage(err.message || 'Failed to load data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [isEditing, id]);

  // Warn user before leaving if unsaved changes exist
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !saveSuccess) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, saveSuccess]);

  // Mark form as dirty on input
  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
    if (saveSuccess) setSaveSuccess(false);
  };

  // Check co-existence hint: Shaadi vs Nikah / Barat
  const hasShaadi = events.some((e) => e.type === 'shaadi');
  const hasNikahOrBarat = events.some((e) => e.type === 'nikah' || e.type === 'barat');
  const showShaadiCoexistenceHint = hasShaadi && hasNikahOrBarat;

  // Add an event function
  const handleAddFunction = (type: 'mehndi' | 'nikah' | 'barat' | 'shaadi' | 'walima') => {
    // If already added, do not add twice
    if (events.some((e) => e.type === type)) return;

    markDirty();
    setShowAddFunctionPicker(false);

    const newEvent: LocalEventItem = {
      id: `evt-${Date.now()}`,
      type,
      date: '',
      time: '20:00',
      venueName: '',
      mapUrl: '',
      venueImageId: null,
      venueImagePreview: null,
      isExpanded: true,
    };

    setEvents((prev) => [...prev, newEvent]);
  };

  // Remove an event function
  const handleRemoveFunction = (eventId: string) => {
    markDirty();
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Update a single event field
  const updateEventField = (eventId: string, updates: Partial<LocalEventItem>) => {
    markDirty();
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, ...updates } : e))
    );
  };

  // Image Upload Handler
  const handleImageUpload = async (eventId: string, file: File) => {
    markDirty();
    updateEventField(eventId, { isUploadingImage: true, imageError: null });

    try {
      // Resize in browser to max 1280px wide and ~300 KB before uploading
      const { blob, contentType } = await resizeImageInBrowser(file);
      const res = await uploadAdminImage(blob, contentType);

      updateEventField(eventId, {
        venueImageId: res.imageId,
        venueImagePreview: URL.createObjectURL(blob),
        isUploadingImage: false,
        imageError: null,
      });
    } catch (err: any) {
      updateEventField(eventId, {
        isUploadingImage: false,
        imageError: err.message || 'Image upload failed. Allowed formats: JPG, PNG, WebP (< 1 MB).',
      });
    }
  };

  // Remove image
  const handleRemoveImage = async (eventId: string, imageId?: string | null) => {
    markDirty();
    if (imageId) {
      deleteAdminImage(imageId).catch(() => {});
    }
    updateEventField(eventId, {
      venueImageId: null,
      venueImagePreview: null,
    });
  };

  // Sort events automatically by date & time for display
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    const timeA = `${a.date}T${a.time || '00:00'}`;
    const timeB = `${b.date}T${b.time || '00:00'}`;
    return timeA.localeCompare(timeB);
  });

  // Calculate visible progress
  const step1Complete = Boolean(groomName.trim() && groomFatherName.trim() && brideName.trim() && brideFatherName.trim());
  const step2Complete = events.length > 0 && events.every((e) => e.date && e.time && e.venueName.trim() && isValidGoogleMapsUrl(e.mapUrl));
  const step3Complete = Boolean(designSlug);

  // Validate form before save
  const validateForm = (): string | null => {
    if (!groomName.trim()) return isUrdu ? 'دولہا کا نام درج کیجیے' : "Please enter the groom's name";
    if (!groomFatherName.trim()) return isUrdu ? 'دولہا کے والد کا نام درج کیجیے' : "Please enter the groom's father's name";
    if (!brideName.trim()) return isUrdu ? 'دلہن کا نام درج کیجیے' : "Please enter the bride's name";
    if (!brideFatherName.trim()) return isUrdu ? 'دلہن کے والد کا نام درج کیجیے' : "Please enter the bride's father's name";

    for (let i = 0; i < events.length; i++) {
      const evt = events[i];
      const typeName = formatEventTypeName(evt.type, isUrdu ? 'ur' : 'en');
      if (!evt.date) return isUrdu ? `${typeName} کی تاریخ منتخب کیجیے` : `Please select a date for ${typeName}`;
      if (!evt.time) return isUrdu ? `${typeName} کا وقت منتخب کیجیے` : `Please select a time for ${typeName}`;
      if (!evt.venueName.trim()) return isUrdu ? `${typeName} کا وینیو / ہال کا نام درج کیجیے` : `Please enter the venue name for ${typeName}`;
      if (!isValidGoogleMapsUrl(evt.mapUrl)) {
        return isUrdu
          ? `${typeName} کے لیے درست گوگل میپس کا لنک درج کیجیے (maps.google.com یا goo.gl)`
          : `Please enter a valid Google Maps HTTPS link for ${typeName}`;
      }
    }

    return null;
  };

  // Submit Save
  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    const clientError = validateForm();
    if (clientError) {
      setErrorMessage(clientError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSaving(true);

    try {
      // Map local events to WeddingEventInput
      const payloadEvents: WeddingEventInput[] = events.map((e) => {
        // Construct ISO string with Pakistan time (+05:00)
        const startsAt = `${e.date}T${e.time}:00+05:00`;
        return {
          type: e.type,
          startsAt,
          venueName: e.venueName.trim(),
          venueImageId: e.venueImageId || null,
          mapUrl: e.mapUrl.trim(),
        };
      });

      const payload: WeddingInput = {
        groomName: groomName.trim(),
        groomFatherName: groomFatherName.trim(),
        brideName: brideName.trim(),
        brideFatherName: brideFatherName.trim(),
        language: languageChoice,
        designSlug,
        events: payloadEvents,
      };

      let resultRecord;
      if (isEditing && id) {
        resultRecord = await updateWedding(id, payload);
      } else {
        resultRecord = await createWedding(payload);
      }

      const newId = resultRecord.id || resultRecord._id;
      setSavedWeddingId(newId);
      setIsDirty(false);
      setSaveSuccess(true);

      // Scroll to top to see confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save wedding. Please check the values.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-content-muted text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className={isUrdu ? 'font-urdu-body' : ''}>
            {isUrdu ? 'معلومات لوڈ ہو رہی ہیں...' : 'Loading couple details...'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 bg-canvas">
      {/* STICKY TOP ACTION BAR WITH SAVE BUTTON (MIN 48PX HEIGHT, ALWAYS VISIBLE) */}
      <div className="sticky top-20 z-40 bg-surface/95 backdrop-blur-md border border-border rounded-2xl p-4 mb-8 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/dashboard"
            className="min-h-[44px] h-11 px-3.5 rounded-xl bg-canvas hover:bg-canvas-subtle border border-border text-content-muted hover:text-content text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'ڈیش بورڈ' : 'Dashboard'}</span>
          </Link>
          <div className="hidden sm:block">
            <h1 className={`text-base font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
              {isEditing ? (isUrdu ? 'جوڑے کی تفصیلات میں ترمیم' : 'Edit Couple') : (isUrdu ? 'نیا جوڑا شامل کریں' : 'Add New Couple')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedWeddingId && (
            <Link
              to={`/admin/weddings/${savedWeddingId}/preview`}
              className="min-h-[48px] h-12 px-5 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-primary text-xs font-semibold shadow-xs flex items-center gap-2 transition-all active:scale-95"
            >
              <Eye className="w-4 h-4 text-accent" />
              <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'پریویو' : 'Preview'}</span>
            </Link>
          )}

          {/* THE ALWAYS-VISIBLE SAVE BUTTON */}
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="min-h-[48px] h-12 px-6 rounded-xl bg-primary hover:bg-primary-hover text-primary-content text-sm font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-accent" />}
            <span className={isUrdu ? 'font-urdu-body text-base' : ''}>{isUrdu ? 'محفوظ کریں' : 'Save Couple'}</span>
          </button>
        </div>
      </div>

      {/* SUCCESS BANNER AFTER SAVING */}
      {saveSuccess && (
        <div className="mb-8 p-5 rounded-2xl bg-success/10 border border-success/30 text-success flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 shrink-0 text-success" />
            <div>
              <p className={`font-bold text-sm ${isUrdu ? 'font-urdu-heading' : ''}`}>
                {isUrdu ? 'معلومات کامیابی سے محفوظ ہو گئیں!' : 'Couple Details Saved Successfully!'}
              </p>
              <p className={`text-xs opacity-90 ${isUrdu ? 'font-urdu-body' : ''}`}>
                {isUrdu ? 'آپ کارڈ کا براہ راست پریویو دیکھ سکتے ہیں۔' : 'You can now preview how the wedding invitation looks.'}
              </p>
            </div>
          </div>
          {savedWeddingId && (
            <Link
              to={`/admin/weddings/${savedWeddingId}/preview`}
              className="min-h-[44px] h-11 px-5 rounded-xl bg-success text-white text-xs font-bold shadow-sm flex items-center gap-2 hover:bg-success/90 transition-all shrink-0"
            >
              <Eye className="w-4 h-4" />
              <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'پریویو دیکھیں' : 'View Preview'}</span>
            </Link>
          )}
        </div>
      )}

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-xl bg-error/10 border border-error/30 text-error flex items-center gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className={`text-sm font-medium ${isUrdu ? 'font-urdu-body' : ''}`}>{errorMessage}</span>
        </div>
      )}

      {/* VISIBLE PROGRESS INDICATOR (3 SECTIONS) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
        <div
          onClick={() => setOpenSection1(true)}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            step1Complete ? 'bg-primary-subtle/50 border-primary/40' : 'bg-surface border-border'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
              1
            </span>
            {step1Complete && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
          </div>
          <span className={`text-xs font-semibold text-content block ${isUrdu ? 'font-urdu-body' : ''}`}>
            {isUrdu ? 'دولہا اور دلہن' : 'Names'}
          </span>
        </div>

        <div
          onClick={() => setOpenSection2(true)}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            step2Complete ? 'bg-primary-subtle/50 border-primary/40' : 'bg-surface border-border'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
              2
            </span>
            {step2Complete && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
          </div>
          <span className={`text-xs font-semibold text-content block ${isUrdu ? 'font-urdu-body' : ''}`}>
            {isUrdu ? 'تقاریب' : 'Functions'} ({events.length})
          </span>
        </div>

        <div
          onClick={() => setOpenSection3(true)}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            step3Complete ? 'bg-primary-subtle/50 border-primary/40' : 'bg-surface border-border'
          }`}
        >
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-content text-[11px] font-bold flex items-center justify-center">
              3
            </span>
            {step3Complete && <CheckCircle2 className="w-3.5 h-3.5 text-success" />}
          </div>
          <span className={`text-xs font-semibold text-content block ${isUrdu ? 'font-urdu-body' : ''}`}>
            {isUrdu ? 'ڈیزائن' : 'Design'}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* SECTION 1: COUPLE NAMES (4 INPUTS IN EXACT SPECIFIED ORDER) */}
        <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenSection1(!openSection1)}
            className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-canvas-subtle/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                  {isUrdu ? 'دولہا اور دلہن کے نام' : 'Couple Names'}
                </h2>
                <p className="text-xs text-content-muted">
                  {isUrdu ? 'نام صرف ایک بار درج کریں، تمام ڈیزائن خود بخود فونٹ اسٹائل لگا لیں گے۔' : 'Enter names once. The design applies styling automatically.'}
                </p>
              </div>
            </div>
            {openSection1 ? <ChevronUp className="w-5 h-5 text-content-muted" /> : <ChevronDown className="w-5 h-5 text-content-muted" />}
          </button>

          {openSection1 && (
            <div className="p-5 sm:p-6 pt-0 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* a) Groom's name */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                  {isUrdu ? 'دولہا کا نام *' : "Groom's Name *"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={groomName}
                  onChange={(e) => {
                    setGroomName(e.target.value);
                    markDirty();
                  }}
                  placeholder={isUrdu ? 'مثلاً: حمزہ فاروق' : 'e.g. Hamza Farooq'}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-canvas border border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm text-content transition-all outline-hidden"
                />
              </div>

              {/* b) Groom's father's name */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                  {isUrdu ? 'دولہا کے والد کا نام *' : "Groom's Father's Name *"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={groomFatherName}
                  onChange={(e) => {
                    setGroomFatherName(e.target.value);
                    markDirty();
                  }}
                  placeholder={isUrdu ? 'مثلاً: فاروق احمد' : 'e.g. Farooq Ahmed'}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-canvas border border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm text-content transition-all outline-hidden"
                />
                <p className={`text-[11px] text-content-muted italic flex items-center gap-1 ${isUrdu ? 'font-urdu-body' : ''}`}>
                  <Info className="w-3 h-3 text-accent shrink-0" />
                  <span>
                    {isUrdu
                      ? `کارڈ پر "${groomFatherName.trim() ? `جناب و محترمہ ${groomFatherName.trim()}` : 'جناب و محترمہ [نام]'}" دکھایا جائے گا`
                      : `Will be shown as Mr. & Mrs. ${groomFatherName.trim() || '<name>'}`}
                  </span>
                </p>
              </div>

              {/* c) Bride's name */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                  {isUrdu ? 'دلہن کا نام *' : "Bride's Name *"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={brideName}
                  onChange={(e) => {
                    setBrideName(e.target.value);
                    markDirty();
                  }}
                  placeholder={isUrdu ? 'مثلاً: عائشہ طارق' : 'e.g. Ayesha Tariq'}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-canvas border border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm text-content transition-all outline-hidden"
                />
              </div>

              {/* d) Bride's father's name */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                  {isUrdu ? 'دلہن کے والد کا نام *' : "Bride's Father's Name *"}
                </label>
                <input
                  type="text"
                  required
                  maxLength={60}
                  value={brideFatherName}
                  onChange={(e) => {
                    setBrideFatherName(e.target.value);
                    markDirty();
                  }}
                  placeholder={isUrdu ? 'مثلاً: طارق ملک' : 'e.g. Tariq Malik'}
                  className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-canvas border border-border focus:border-primary focus:ring-1 focus:ring-primary text-sm text-content transition-all outline-hidden"
                />
                <p className={`text-[11px] text-content-muted italic flex items-center gap-1 ${isUrdu ? 'font-urdu-body' : ''}`}>
                  <Info className="w-3 h-3 text-accent shrink-0" />
                  <span>
                    {isUrdu
                      ? `کارڈ پر "${brideFatherName.trim() ? `جناب و محترمہ ${brideFatherName.trim()}` : 'جناب و محترمہ [نام]'}" دکھایا جائے گا`
                      : `Will be shown as Mr. & Mrs. ${brideFatherName.trim() || '<name>'}`}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: FUNCTIONS (ADD FUNCTION BUTTON REVEALS 5 BIG TAPPABLE CHOICES) */}
        <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenSection2(!openSection2)}
            className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-canvas-subtle/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                  {isUrdu ? 'شادی کی تقاریب' : 'Wedding Functions'}
                </h2>
                <p className="text-xs text-content-muted">
                  {isUrdu ? 'تاریخ، وقت، ہال کا نام، تصویر اور گوگل میپس کی لوکیشن درج کریں۔' : 'Add events with date, Pakistan time, venue, image & Google Maps.'}
                </p>
              </div>
            </div>
            {openSection2 ? <ChevronUp className="w-5 h-5 text-content-muted" /> : <ChevronDown className="w-5 h-5 text-content-muted" />}
          </button>

          {openSection2 && (
            <div className="p-5 sm:p-6 pt-0 border-t border-border space-y-6">
              {/* Soft Coexistence Hint if Shaadi and Nikah/Barat exist together */}
              {showShaadiCoexistenceHint && (
                <div className="p-3.5 rounded-xl bg-accent-subtle/50 border border-accent/40 text-xs text-content flex items-center gap-2.5">
                  <Info className="w-4 h-4 text-accent shrink-0" />
                  <span className={isUrdu ? 'font-urdu-body' : ''}>
                    {isUrdu
                      ? 'نوٹ: "شادی" میں نکاح اور بارات دونوں شامل ہیں۔ اگر ضرورت نہ ہو تو آپ اضافی تقریب کو ہٹا سکتے ہیں۔'
                      : 'Note: "Shaadi" already includes Nikah and Barat. You can remove extra ones if you do not need them.'}
                  </span>
                </div>
              )}

              {/* LIST OF ADDED FUNCTIONS (COLLAPSED SUMMARY CARDS WITH EDIT & REMOVE) */}
              <div className="space-y-4">
                {sortedEvents.map((evt) => {
                  const typeLabel = formatEventTypeName(evt.type, isUrdu ? 'ur' : 'en');

                  return (
                    <div
                      key={evt.id}
                      className="bg-canvas border border-border rounded-xl p-4 sm:p-5 shadow-xs transition-all"
                    >
                      {/* Event Summary Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                        <div className="flex items-center gap-2.5">
                          <span className="w-3 h-3 rounded-full bg-accent" />
                          <h3 className={`text-base font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                            {typeLabel}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateEventField(evt.id, { isExpanded: !evt.isExpanded })}
                            className="min-h-[38px] px-3 rounded-lg bg-surface border border-border hover:bg-canvas text-xs font-semibold text-content flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {evt.isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span>{evt.isExpanded ? (isUrdu ? 'بند کریں' : 'Collapse') : (isUrdu ? 'ترمیم کریں' : 'Edit')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRemoveFunction(evt.id)}
                            className="min-h-[38px] px-3 rounded-lg bg-surface border border-border hover:bg-error/10 hover:border-error/40 text-xs font-semibold text-content-muted hover:text-error flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{isUrdu ? 'ہٹائیں' : 'Remove'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Collapsed Brief View */}
                      {!evt.isExpanded && (
                        <div className="pt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-content-muted">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            <span>{evt.date || (isUrdu ? 'تاریخ درج نہیں' : 'No date set')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-accent" />
                            <span>{evt.time ? `${evt.time} PKT` : (isUrdu ? 'وقت درج نہیں' : 'No time set')}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-accent" />
                            <span className="truncate">{evt.venueName || (isUrdu ? 'وینیو کا نام درج نہیں' : 'No venue name')}</span>
                          </div>
                        </div>
                      )}

                      {/* Expanded View: EXACTLY 5 INPUTS */}
                      {evt.isExpanded && (
                        <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* 1. Date (date picker) */}
                          <div className="space-y-1">
                            <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                              {isUrdu ? '۱۔ تقریب کی تاریخ *' : '1. Date *'}
                            </label>
                            <input
                              type="date"
                              required
                              value={evt.date}
                              onChange={(e) => updateEventField(evt.id, { date: e.target.value })}
                              className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-surface border border-border focus:border-primary text-sm text-content outline-hidden"
                            />
                          </div>

                          {/* 2. Time (time picker, Pakistan time) */}
                          <div className="space-y-1">
                            <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                              {isUrdu ? '۲۔ وقت (پاکستان وقت) *' : '2. Time (Pakistan Time) *'}
                            </label>
                            <input
                              type="time"
                              required
                              value={evt.time}
                              onChange={(e) => updateEventField(evt.id, { time: e.target.value })}
                              className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-surface border border-border focus:border-primary text-sm text-content outline-hidden"
                            />
                          </div>

                          {/* 3. Venue name */}
                          <div className="space-y-1 sm:col-span-2">
                            <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                              {isUrdu ? '۳۔ وینیو / ہال کا نام *' : '3. Venue Name *'}
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={100}
                              value={evt.venueName}
                              onChange={(e) => updateEventField(evt.id, { venueName: e.target.value })}
                              placeholder={isUrdu ? 'مثلاً: رائل پام گرینڈ ہال، کینال روڈ لاہور' : 'e.g. Royal Palm Grand Ballroom, Canal Road, Lahore'}
                              className="w-full min-h-[48px] h-12 px-4 rounded-xl bg-surface border border-border focus:border-primary text-sm text-content outline-hidden"
                            />
                          </div>

                          {/* 4. Venue image (upload with preview, replace & remove; resized to 1280px & ~300KB) */}
                          <div className="space-y-2 sm:col-span-2">
                            <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                              {isUrdu ? '۴۔ وینیو کی تصویر (اختیاری)' : '4. Venue Image (Optional)'}
                            </label>

                            {evt.venueImagePreview ? (
                              <div className="relative w-full sm:w-64 h-36 rounded-xl overflow-hidden border border-border bg-black/5 group">
                                <img
                                  src={evt.venueImagePreview}
                                  alt="Venue preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                  <label className="p-2 rounded-lg bg-surface text-content text-xs font-semibold cursor-pointer shadow-sm hover:bg-canvas">
                                    <Upload className="w-4 h-4 inline mr-1" />
                                    <span>{isUrdu ? 'تبدیل کریں' : 'Replace'}</span>
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,image/webp"
                                      className="hidden"
                                      onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                          handleImageUpload(evt.id, e.target.files[0]);
                                        }
                                      }}
                                    />
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveImage(evt.id, evt.venueImageId)}
                                    className="p-2 rounded-lg bg-error text-white text-xs font-semibold shadow-sm hover:bg-error-hover"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <label className="border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface">
                                {evt.isUploadingImage ? (
                                  <div className="flex items-center gap-2 text-xs text-primary font-medium">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>{isUrdu ? 'تصویر کمپریس اور اپلوڈ ہو رہی ہے...' : 'Resizing and uploading image...'}</span>
                                  </div>
                                ) : (
                                  <>
                                    <ImageIcon className="w-6 h-6 text-accent mb-2" />
                                    <span className="text-xs font-semibold text-content mb-1">
                                      {isUrdu ? 'وینیو کی تصویر اپلوڈ کریں' : 'Click to upload venue photo'}
                                    </span>
                                    <span className="text-[11px] text-content-muted">
                                      {isUrdu ? 'JPG, PNG, WebP (براؤزر خود بخود ری سائز کر دے گا)' : 'JPG, PNG, WebP (auto-resized to max 1280px & ~300 KB)'}
                                    </span>
                                  </>
                                )}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  disabled={evt.isUploadingImage}
                                  onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                      handleImageUpload(evt.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            )}

                            {evt.imageError && (
                              <p className="text-xs text-error font-medium">{evt.imageError}</p>
                            )}
                          </div>

                          {/* 5. Location link (Google Maps link, with clear inline error) */}
                          <div className="space-y-1 sm:col-span-2">
                            <label className={`block text-xs font-bold text-content ${isUrdu ? 'font-urdu-body' : ''}`}>
                              {isUrdu ? '۵۔ گوگل میپس لوکیشن لنک *' : '5. Location Link (Google Maps) *'}
                            </label>
                            <input
                              type="url"
                              required
                              value={evt.mapUrl}
                              onChange={(e) => updateEventField(evt.id, { mapUrl: e.target.value })}
                              placeholder="https://maps.app.goo.gl/... or https://maps.google.com/?q=..."
                              className={`w-full min-h-[48px] h-12 px-4 rounded-xl bg-surface border text-sm text-content outline-hidden transition-colors ${
                                evt.mapUrl && !isValidGoogleMapsUrl(evt.mapUrl)
                                  ? 'border-error focus:border-error'
                                  : 'border-border focus:border-primary'
                              }`}
                            />
                            {evt.mapUrl && !isValidGoogleMapsUrl(evt.mapUrl) && (
                              <p className={`text-xs text-error font-medium flex items-center gap-1 mt-1 ${isUrdu ? 'font-urdu-body' : ''}`}>
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>
                                  {isUrdu
                                    ? 'براہ کرم ایک درست HTTPS گوگل میپس لنک درج کریں (maps.google.com یا maps.app.goo.gl)'
                                    : 'Please enter a valid HTTPS Google Maps link (maps.google.com, maps.app.goo.gl, or goo.gl/maps)'}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* BUTTON "ADD FUNCTION" REVEALS BIG TAPPABLE CHOICES */}
              <div className="pt-2">
                {!showAddFunctionPicker ? (
                  <button
                    type="button"
                    onClick={() => setShowAddFunctionPicker(true)}
                    className="min-h-[48px] h-12 px-6 rounded-xl bg-surface hover:bg-canvas-subtle border border-border text-primary text-sm font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95 w-full sm:w-auto cursor-pointer"
                  >
                    <Plus className="w-5 h-5 text-accent" />
                    <span className={isUrdu ? 'font-urdu-body text-sm' : ''}>
                      {isUrdu ? 'تقریب شامل کریں +' : 'Add Function +'}
                    </span>
                  </button>
                ) : (
                  <div className="p-5 rounded-2xl bg-canvas border border-border animate-in fade-in duration-200">
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-xs font-bold text-content uppercase tracking-wider ${isUrdu ? 'font-urdu-body' : ''}`}>
                        {isUrdu ? 'تقریب کا انتخاب کریں:' : 'Select Function to Add:'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddFunctionPicker(false)}
                        className="text-xs text-content-muted hover:text-content font-medium underline"
                      >
                        {isUrdu ? 'بند کریں' : 'Close'}
                      </button>
                    </div>

                    {/* BIG TAPPABLE CHOICES IN EXACT SPECIFIED ORDER */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {ORDERED_EVENT_TYPES.map((item) => {
                        const alreadyAdded = events.some((e) => e.type === item.key);

                        return (
                          <button
                            key={item.key}
                            type="button"
                            disabled={alreadyAdded}
                            onClick={() => handleAddFunction(item.key)}
                            className={`min-h-[56px] p-3 rounded-xl border text-center font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                              alreadyAdded
                                ? 'bg-canvas-subtle/40 border-border text-content-muted opacity-40 cursor-not-allowed'
                                : 'bg-surface hover:bg-primary-subtle border-border hover:border-primary text-content cursor-pointer shadow-xs active:scale-95'
                            }`}
                          >
                            <span className={isUrdu ? 'font-urdu-heading text-sm' : ''}>
                              {isUrdu ? item.ur : item.en}
                            </span>
                            {alreadyAdded && (
                              <span className="text-[10px] font-normal text-content-muted">
                                ({isUrdu ? 'شامل شدہ' : 'Added'})
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: DESIGN & LANGUAGE */}
        <div className="bg-surface border border-border rounded-2xl shadow-card overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenSection3(!openSection3)}
            className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-canvas-subtle/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-content font-bold text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h2 className={`text-lg sm:text-xl font-bold text-content ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                  {isUrdu ? 'ڈیزائن اور زبان کا انتخاب' : 'Design & Language'}
                </h2>
                <p className="text-xs text-content-muted">
                  {isUrdu ? 'کارڈ کے ڈیزائن اور بنیادی زبان کا انتخاب کیجیے۔' : 'Choose the visual wedding template and invitation language.'}
                </p>
              </div>
            </div>
            {openSection3 ? <ChevronUp className="w-5 h-5 text-content-muted" /> : <ChevronDown className="w-5 h-5 text-content-muted" />}
          </button>

          {openSection3 && (
            <div className="p-5 sm:p-6 pt-0 border-t border-border space-y-6">
              {/* Language Choice */}
              <div>
                <label className={`block text-xs font-bold text-content mb-2 ${isUrdu ? 'font-urdu-body' : ''}`}>
                  {isUrdu ? 'دعوت نامے کی بنیادی زبان:' : 'Invitation Default Language:'}
                </label>
                <div className="grid grid-cols-2 gap-3 max-w-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguageChoice('en');
                      markDirty();
                    }}
                    className={`min-h-[48px] h-12 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      languageChoice === 'en'
                        ? 'bg-primary text-primary-content border-primary shadow-sm'
                        : 'bg-canvas text-content border-border hover:bg-canvas-subtle'
                    }`}
                  >
                    <Globe className="w-4 h-4" />
                    <span>English</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguageChoice('ur');
                      markDirty();
                    }}
                    className={`min-h-[48px] h-12 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      languageChoice === 'ur'
                        ? 'bg-primary text-primary-content border-primary shadow-sm'
                        : 'bg-canvas text-content border-border hover:bg-canvas-subtle'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-accent" />
                    <span className="font-urdu-heading text-sm">اردو (Urdu)</span>
                  </button>
                </div>
              </div>

              {/* Design Cards Grid: One tap selects it */}
              <div>
                <label className={`block text-xs font-bold text-content mb-3 ${isUrdu ? 'font-urdu-body' : ''}`}>
                  {isUrdu ? 'کارڈ ڈیزائن کا انتخاب کریں:' : 'Select Wedding Invitation Design:'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {designs.map((d) => {
                    const isSelected = designSlug === d.slug;
                    const displayName = isUrdu ? d.nameUrdu : d.name;

                    return (
                      <div
                        key={d.slug}
                        onClick={() => {
                          setDesignSlug(d.slug as any);
                          markDirty();
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-primary bg-primary-subtle/30 shadow-card'
                            : 'border-border bg-canvas hover:border-primary/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-subtle text-primary border border-accent/30">
                            {d.code}
                          </span>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary">
                              <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                              <span>{isUrdu ? 'منتخب شدہ' : 'Selected'}</span>
                            </span>
                          )}
                        </div>

                        <h4 className={`text-base font-bold text-content mb-1 ${isUrdu ? 'font-urdu-heading' : 'font-serif'}`}>
                          {displayName}
                        </h4>

                        <p className="text-xs text-content-muted mb-3">
                          {isUrdu ? d.mood.ur : d.mood.en}
                        </p>

                        {/* Palette dots */}
                        <div className="flex items-center gap-1.5 mt-auto pt-2 border-t border-border/50">
                          {d.palette.previewColors.map((c, i) => (
                            <span
                              key={i}
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: c }}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Styling notice */}
              <div className="p-3.5 rounded-xl bg-canvas-subtle/50 border border-border text-xs text-content-muted flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent shrink-0" />
                <span className={isUrdu ? 'font-urdu-body' : ''}>
                  {isUrdu
                    ? 'رنگ، فونٹ، لے آؤٹ اور اینیمیشنز منتخب کردہ ڈیزائن کے مطابق خود بخود لاگو ہوں گی۔'
                    : 'Colours, fonts, layout and animations are applied automatically by the selected design.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <Link
            to="/admin/dashboard"
            className="min-h-[48px] h-12 px-6 rounded-xl bg-canvas hover:bg-canvas-subtle border border-border text-content text-sm font-semibold flex items-center justify-center transition-colors"
          >
            <span className={isUrdu ? 'font-urdu-body' : ''}>{isUrdu ? 'منسوخ کریں' : 'Cancel'}</span>
          </Link>

          <button
            type="submit"
            disabled={saving}
            className="min-h-[48px] h-12 px-8 rounded-xl bg-primary hover:bg-primary-hover text-primary-content text-sm font-bold shadow-md flex items-center gap-2 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-accent" />}
            <span className={isUrdu ? 'font-urdu-body text-base' : ''}>{isUrdu ? 'محفوظ کریں' : 'Save Couple'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
