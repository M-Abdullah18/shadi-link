import React, { useState, useRef, useEffect } from 'react';
import { TemplateComponentProps } from '../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { MapPin, Calendar, Clock, Sparkles, Mail, Heart, Eye } from 'lucide-react';

export const SeaBreezeThumbnail: React.FC<{ className?: string }> = ({ className = 'w-full h-48' }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-[#87CEEB]/30 via-[#E0F2F1] to-[#FFFFFF] flex items-center justify-center p-4 border border-[#87CEEB]/40 ${className}`}>
      {/* Background coastal waves */}
      <svg className="absolute bottom-0 left-0 w-full h-16 opacity-60 pointer-events-none" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0,40 C100,70 200,10 300,50 C350,70 400,30 400,30 L400,80 L0,80 Z" fill="#87CEEB" fillOpacity="0.4" />
        <path d="M0,50 C120,20 220,70 320,30 C360,10 400,40 400,40 L400,80 L0,80 Z" fill="#48A9A6" fillOpacity="0.3" />
      </svg>
      {/* Little envelope */}
      <div className="w-28 h-20 bg-white rounded-lg border border-[#87CEEB] shadow-md flex flex-col items-center justify-center relative z-10">
        <div className="w-7 h-7 rounded-full bg-[#E0F2F1] border border-[#87CEEB] flex items-center justify-center text-[#1F3A44] mb-1">
          <Heart className="w-3.5 h-3.5 text-[#48A9A6] fill-[#48A9A6]" />
        </div>
        <span className="text-[10px] font-semibold text-[#1F3A44] tracking-wider uppercase font-mono">D02 • Breeze</span>
      </div>
    </div>
  );
};

export const SeaBreezeTemplate: React.FC<TemplateComponentProps> = ({
  data,
  language,
  guestName,
  isCommonLink,
}) => {
  const isUrdu = language === 'ur';
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [isDateRevealed, setIsDateRevealed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScratching = useRef(false);

  // Scratch card canvas setup
  useEffect(() => {
    if (!envelopeOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with pleasant seafoam scratch coating
    ctx.fillStyle = '#A0D2DB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add pattern text on top of scratch surface
    ctx.fillStyle = '#1F3A44';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(isUrdu ? 'کھرچ کر تاریخ دیکھیں' : 'Scratch to Reveal Date', canvas.width / 2, canvas.height / 2 + 4);
  }, [envelopeOpen, isUrdu]);

  const handleScratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isDateRevealed) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 18, 0, Math.PI * 2, false);
    ctx.fill();

    // After scratching, consider it revealed
    setIsDateRevealed(true);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      handleScratch(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isScratching.current) {
      handleScratch(e.clientX, e.clientY);
    }
  };

  const formattedGroom = isUrdu && data.coupleNames.groomUr ? data.coupleNames.groomUr : data.coupleNames.groom;
  const formattedBride = isUrdu && data.coupleNames.brideUr ? data.coupleNames.brideUr : data.coupleNames.bride;
  const greetingText = guestName
    ? guestName
    : isUrdu
    ? 'محترم مہمان'
    : 'Respected Guest';

  return (
    <div 
      className="min-h-screen py-8 sm:py-14 px-4 sm:px-6 relative overflow-hidden"
      style={{
        backgroundColor: '#F0F9F8',
        color: '#1F3A44',
        fontFamily: isUrdu ? '"Noto Naskh Arabic", sans-serif' : '"Assistant", sans-serif',
      }}
    >
      {/* Floating clouds inline SVG */}
      <div className="absolute top-6 left-4 opacity-40 pointer-events-none animate-pulse">
        <svg width="120" height="40" viewBox="0 0 120 40">
          <path d="M20,30 Q30,10 50,15 Q65,0 85,15 Q105,10 110,30 Z" fill="#87CEEB" />
        </svg>
      </div>
      <div className="absolute top-16 right-6 opacity-30 pointer-events-none">
        <svg width="140" height="45" viewBox="0 0 140 45">
          <path d="M15,35 Q30,10 55,20 Q75,5 95,20 Q120,15 130,35 Z" fill="#87CEEB" />
        </svg>
      </div>

      <div className="max-w-xl mx-auto">
        {/* ENVELOPE OPENING STAGE */}
        {!envelopeOpen ? (
          <div className="my-10 text-center animate-in fade-in duration-300">
            <p className="text-xs uppercase tracking-widest text-[#48A9A6] font-semibold mb-3">
              {isUrdu ? 'خصوصی دعوت نامہ' : 'Exclusive Wedding Invitation'}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Great Vibes", cursive' }}>
              {isUrdu ? 'دعوت برائے' : 'You are Invited'}
            </h2>

            {/* Interactive Envelope Card */}
            <div 
              onClick={() => setEnvelopeOpen(true)}
              className="bg-white border-2 border-[#87CEEB] rounded-2xl p-8 sm:p-12 shadow-xl hover:shadow-2xl transition-all cursor-pointer group text-center relative max-w-md mx-auto transform hover:-translate-y-1"
            >
              <div className="w-16 h-16 rounded-full bg-[#E0F2F1] border border-[#87CEEB] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-[#48A9A6]" />
              </div>
              <p className="text-xs uppercase tracking-widest text-[#48A9A6] font-semibold mb-1">
                {isUrdu ? 'دعوت برائے مسرت' : 'Special Delivery for'}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-[#1F3A44] mb-3">
                {greetingText}
              </h3>
              <div className="w-16 h-0.5 bg-[#87CEEB] mx-auto my-4" />
              <button 
                type="button"
                className="min-h-[48px] px-6 py-2.5 rounded-full bg-[#87CEEB] hover:bg-[#72bcd8] text-[#1F3A44] font-semibold text-sm shadow-sm transition-all"
              >
                {isUrdu ? 'لفافہ کھولیں ✉️' : 'Tap to Open Envelope ✉️'}
              </button>
            </div>
          </div>
        ) : (
          /* REVEALED INVITATION CARD */
          <div className="bg-white border border-[#87CEEB] rounded-3xl shadow-2xl p-6 sm:p-10 relative animate-in fade-in zoom-in-95 duration-500">
            {/* Soft top wave border */}
            <svg className="w-full h-8 opacity-70 mb-4" viewBox="0 0 400 30" preserveAspectRatio="none">
              <path d="M0,15 C100,30 200,0 300,20 C350,30 400,10 400,10 L400,0 L0,0 Z" fill="#E0F2F1" />
            </svg>

            {/* Bismillah Header */}
            <div className="text-center pb-6 border-b border-[#E0F2F1]">
              <p className="text-xl sm:text-2xl text-[#48A9A6] tracking-wider mb-2 font-serif">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <span className="text-[11px] text-[#48A9A6] uppercase tracking-widest">
                {isUrdu ? 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
              </span>
            </div>

            {/* Guest Greeting */}
            <div className="text-center pt-6 pb-4">
              <span className="inline-block px-3.5 py-1 rounded-full bg-[#E0F2F1] text-[#1F3A44] text-xs font-semibold mb-3 border border-[#87CEEB]/30">
                {isUrdu ? 'محترم و مکرم' : 'Cordially Invited'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F3A44]">
                {greetingText}
              </h2>
            </div>

            {/* Couple Announcement */}
            <div className="text-center my-6 py-4 bg-[#F0F9F8] rounded-2xl border border-[#E0F2F1]">
              <p className="text-xs uppercase tracking-widest text-[#48A9A6] font-semibold mb-2">
                {isUrdu ? 'شادی کا پرمسرت بندھن' : 'Together with their families'}
              </p>
              <h1 
                className="text-4xl sm:text-5xl font-bold text-[#1F3A44] my-2"
                style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Great Vibes", cursive' }}
              >
                {formattedGroom} <span className="text-[#87CEEB]">&</span> {formattedBride}
              </h1>
              {data.parentsNames && (
                <p className="text-xs text-[#1F3A44]/75 mt-3 max-w-sm mx-auto leading-relaxed">
                  {isUrdu
                    ? `${data.parentsNames.groomParentsUr || data.parentsNames.groomParents} اور ${data.parentsNames.brideParentsUr || data.parentsNames.brideParents}`
                    : `Son of ${data.parentsNames.groomParents} & Daughter of ${data.parentsNames.brideParents}`}
                </p>
              )}
            </div>

            {/* SCRATCH TO REVEAL DATE SECTION */}
            <div className="my-8 p-6 bg-[#E0F2F1]/50 border border-[#87CEEB]/50 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#48A9A6] mb-3">
                <Sparkles className="w-4 h-4 text-[#48A9A6]" />
                <span>{isUrdu ? 'شادی کی تاریخ دریافت کریں' : 'Interactive Wedding Date'}</span>
              </div>

              {/* Reveal Canvas Container */}
              <div className="relative w-64 h-24 mx-auto rounded-xl overflow-hidden border border-[#87CEEB] shadow-inner bg-white flex items-center justify-center">
                {/* Hidden date content underneath */}
                <div className="p-3 text-center">
                  <p className="text-xs uppercase tracking-wider text-[#48A9A6] font-bold">
                    {isUrdu ? 'تقریب کی تاریخ' : 'Official Date'}
                  </p>
                  <p className="text-lg font-bold text-[#1F3A44]">
                    {isUrdu ? '۱۸ دسمبر ۲۰۲۶' : 'Friday, 18 Dec 2026'}
                  </p>
                  <p className="text-xs text-[#48A9A6]">
                    {isUrdu ? 'شام ۵:۳۰ بجے' : '05:30 PM PKT'}
                  </p>
                </div>

                {/* Scratch canvas overlay */}
                <canvas
                  ref={canvasRef}
                  width={256}
                  height={96}
                  onMouseDown={() => (isScratching.current = true)}
                  onMouseUp={() => (isScratching.current = false)}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="absolute inset-0 cursor-crosshair touch-none"
                  style={{ display: isDateRevealed ? 'none' : 'block' }}
                />
              </div>

              {/* Accessibility fallback button */}
              {!isDateRevealed && (
                <button
                  type="button"
                  onClick={() => setIsDateRevealed(true)}
                  className="mt-3 text-xs text-[#1F3A44] underline hover:text-[#48A9A6] inline-flex items-center gap-1 font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isUrdu ? 'کھرچے بغیر تاریخ دیکھیں' : 'Tap to reveal without scratching'}</span>
                </button>
              )}
            </div>

            {/* Countdown Timer */}
            <CountdownTimer
              targetDate={data.weddingDate}
              language={language}
              palette={{
                cardBg: '#FFFFFF',
                border: '#87CEEB',
                numberColor: '#1F3A44',
                labelColor: '#48A9A6',
              }}
            />

            {/* Events List */}
            <div className="space-y-4 my-8">
              <h3 className="text-xl font-bold text-center text-[#1F3A44] mb-4">
                {isUrdu ? 'تقاریب کا شیڈول' : 'Wedding Schedule'}
              </h3>

              {data.events.map((evt) => (
                <div 
                  key={evt.id}
                  className="bg-white border border-[#87CEEB] rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h4 className="text-lg font-bold text-[#1F3A44]">
                      {isUrdu && evt.nameUr ? evt.nameUr : evt.name}
                    </h4>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#E0F2F1] text-[#1F3A44] border border-[#87CEEB]/40 w-fit">
                      {isUrdu && evt.cityUr ? evt.cityUr : evt.city}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#1F3A44]/80 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#48A9A6] shrink-0" />
                      <span>{isUrdu && evt.dateUr ? evt.dateUr : evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#48A9A6] shrink-0" />
                      <span>{isUrdu && evt.timeUr ? evt.timeUr : evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#48A9A6] shrink-0" />
                      <span>{isUrdu && evt.venueAddressUr ? evt.venueAddressUr : `${evt.venueName}, ${evt.venueAddress}`}</span>
                    </div>
                  </div>

                  {evt.googleMapsUrl && (
                    <a
                      href={evt.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#87CEEB] hover:bg-[#72bcd8] text-[#1F3A44] text-xs font-semibold transition-all w-full sm:w-auto"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'گوگل میپس پر مقام دیکھیں' : 'View Venue on Google Maps'}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Custom note */}
            {data.customMessage && (
              <div className="text-center pt-4 border-t border-[#E0F2F1] text-xs text-[#1F3A44]/70 italic">
                {isUrdu && data.customMessageUr ? data.customMessageUr : data.customMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
