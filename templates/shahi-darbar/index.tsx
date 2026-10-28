import React, { useState } from 'react';
import { TemplateComponentProps } from '../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { MapPin, Calendar, Clock, Crown, Sparkles, KeyRound } from 'lucide-react';

export const ShahiDarbarThumbnail: React.FC<{ className?: string }> = ({ className = 'w-full h-48' }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-[#800020] via-[#520015] to-[#2A000A] flex items-center justify-center p-4 border border-[#E6CA65]/60 ${className}`}>
      {/* Mughal Palace Arch SVG */}
      <svg className="w-36 h-36" viewBox="0 0 120 120" fill="none">
        <path d="M10,120 L10,60 Q10,20 60,10 Q110,20 110,60 L110,120 Z" stroke="#E6CA65" strokeWidth="2.5" fill="#800020" fillOpacity="0.8" />
        <path d="M20,120 L20,65 Q20,30 60,22 Q100,30 100,65 L100,120 Z" stroke="#E6CA65" strokeWidth="1" strokeDasharray="3 2" fill="none" />
        <line x1="60" y1="22" x2="60" y2="120" stroke="#E6CA65" strokeWidth="1.5" />
        <circle cx="60" cy="18" r="4" fill="#E6CA65" />
      </svg>
      <div className="absolute bottom-2 text-center">
        <span className="text-[10px] font-bold text-[#E6CA65] tracking-widest uppercase font-mono bg-[#800020]/90 px-2 py-0.5 rounded border border-[#E6CA65]/50">
          D03 • Shahi
        </span>
      </div>
    </div>
  );
};

export const ShahiDarbarTemplate: React.FC<TemplateComponentProps> = ({
  data,
  language,
  guestName,
  isCommonLink,
}) => {
  const isUrdu = language === 'ur';
  const [gatesOpen, setGatesOpen] = useState(false);

  const formattedGroom = isUrdu && data.coupleNames.groomUr ? data.coupleNames.groomUr : data.coupleNames.groom;
  const formattedBride = isUrdu && data.coupleNames.brideUr ? data.coupleNames.brideUr : data.coupleNames.bride;
  const greetingText = guestName ? guestName : isUrdu ? 'محترم مہمان' : 'Respected Guest';

  return (
    <div 
      className="min-h-screen py-8 sm:py-14 px-4 sm:px-6 relative overflow-hidden"
      style={{
        backgroundColor: '#FAF6EE',
        color: '#2A1215',
        fontFamily: isUrdu ? '"Noto Naskh Arabic", sans-serif' : 'Georgia, serif',
      }}
    >
      <div className="max-w-xl mx-auto">
        {/* PALACE GATE ENTRANCE SECTION */}
        {!gatesOpen ? (
          <div className="my-8 text-center animate-in fade-in duration-300">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#800020]/10 border border-[#E6CA65] text-[#800020] text-xs font-semibold uppercase tracking-wider mb-4">
              <Crown className="w-3.5 h-3.5 text-[#E6CA65]" />
              <span>{isUrdu ? 'شاہی دعوت نامہ' : 'Royal Wedding Decree'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-[#800020]" style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Cinzel", serif' }}>
              {isUrdu ? 'دربارِ شاہی میں خوش آمدید' : 'The Royal Mughal Gates'}
            </h2>

            <p className="text-xs text-[#2A1215]/80 mb-6 max-w-sm mx-auto">
              {isUrdu
                ? 'دروازہ کھولنے کے لیے بٹن دبائیں اور شاہی دعوت کا نظارہ کریں۔'
                : 'Tap to slide open the majestic palace gates and reveal the wedding ceremony.'}
            </p>

            {/* Interactive Gate Arch Box */}
            <div 
              onClick={() => setGatesOpen(true)}
              className="relative max-w-sm mx-auto h-96 rounded-3xl overflow-hidden border-4 border-[#E6CA65] shadow-2xl cursor-pointer group bg-[#800020]"
            >
              {/* Outer arch header */}
              <div className="absolute top-4 inset-x-0 z-20 text-center">
                <Crown className="w-8 h-8 text-[#E6CA65] mx-auto animate-bounce" />
                <span className="text-[11px] uppercase tracking-widest text-[#E6CA65] font-bold block mt-1">
                  {greetingText}
                </span>
              </div>

              {/* Left Door */}
              <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-[#800020] to-[#590016] border-r-2 border-[#E6CA65] flex items-center justify-end pr-2 transition-transform duration-700 group-hover:-translate-x-2">
                <div className="w-8 h-8 rounded-full border border-[#E6CA65] flex items-center justify-center bg-[#800020] shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E6CA65]" />
                </div>
              </div>

              {/* Right Door */}
              <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-[#800020] to-[#590016] border-l-2 border-[#E6CA65] flex items-center justify-start pl-2 transition-transform duration-700 group-hover:translate-x-2">
                <div className="w-8 h-8 rounded-full border border-[#E6CA65] flex items-center justify-center bg-[#800020] shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#E6CA65]" />
                </div>
              </div>

              {/* Center Open Trigger */}
              <div className="absolute bottom-6 inset-x-0 z-20 flex justify-center">
                <button
                  type="button"
                  className="min-h-[48px] px-6 py-2.5 rounded-full bg-[#E6CA65] hover:bg-[#d8bc59] text-[#800020] font-bold text-xs uppercase tracking-wider shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>{isUrdu ? 'شاہی دروازہ کھولیں' : 'Slide Open Gates'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* REVEALED ROYAL DARBAR INVITATION */
          <div className="bg-white border-2 border-[#E6CA65] rounded-3xl shadow-2xl p-6 sm:p-10 relative animate-in fade-in zoom-in-95 duration-700">
            {/* Mughal Arch SVG Top Banner */}
            <div className="w-full text-center mb-6">
              <svg className="w-24 h-12 mx-auto" viewBox="0 0 100 40" fill="none">
                <path d="M0,40 Q25,0 50,0 Q75,0 100,40" stroke="#E6CA65" strokeWidth="2.5" fill="none" />
                <circle cx="50" cy="5" r="3" fill="#800020" />
              </svg>
            </div>

            {/* Bismillah Header */}
            <div className="text-center pb-6 border-b border-[#E6CA65]/30">
              <p className="text-2xl sm:text-3xl text-[#800020] tracking-wider mb-2 font-serif">
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <span className="text-xs text-[#800020]/80 uppercase tracking-widest font-semibold">
                {isUrdu ? 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے' : 'In the name of Allah, the Most Beneficent, the Most Merciful'}
              </span>
            </div>

            {/* Guest Welcome */}
            <div className="text-center pt-6 pb-2">
              <span className="inline-block px-4 py-1 rounded-full bg-[#800020]/10 text-[#800020] text-xs font-bold uppercase tracking-widest border border-[#E6CA65]">
                {isUrdu ? 'باعزت و باوقار مہمان' : 'Royal Guest of Honor'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#800020] mt-3">
                {greetingText}
              </h2>
            </div>

            {/* Couple Decree */}
            <div className="text-center my-6 py-6 px-4 bg-gradient-to-b from-[#800020]/5 via-[#FAF6EE] to-[#800020]/5 rounded-2xl border border-[#E6CA65]/50">
              <p className="text-xs uppercase tracking-widest text-[#002366] font-bold mb-2">
                {isUrdu ? 'شاہی تقریبِ مسرت برائے' : 'The Royal Wedding Celebration of'}
              </p>
              <h1 
                className="text-3xl sm:text-5xl font-bold text-[#800020] my-3 leading-tight"
                style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Cinzel", serif' }}
              >
                {formattedGroom} <br />
                <span className="text-lg sm:text-2xl font-light text-[#E6CA65]">&</span> <br />
                {formattedBride}
              </h1>

              {data.parentsNames && (
                <div className="w-full max-w-md mx-auto pt-4 border-t border-[#E6CA65]/30 mt-4 text-xs text-[#2A1215]/80 leading-relaxed font-serif">
                  <p>{isUrdu ? data.parentsNames.groomParentsUr || data.parentsNames.groomParents : `Son of ${data.parentsNames.groomParents}`}</p>
                  <p className="mt-1">{isUrdu ? data.parentsNames.brideParentsUr || data.parentsNames.brideParents : `Daughter of ${data.parentsNames.brideParents}`}</p>
                </div>
              )}
            </div>

            {/* Countdown */}
            <CountdownTimer
              targetDate={data.weddingDate}
              language={language}
              palette={{
                cardBg: '#FAF6EE',
                border: '#E6CA65',
                numberColor: '#800020',
                labelColor: '#002366',
              }}
            />

            {/* Events Timelines (Barat & Walima) */}
            <div className="space-y-5 my-8">
              <h3 
                className="text-2xl font-bold text-center text-[#800020] mb-4"
                style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Cinzel", serif' }}
              >
                {isUrdu ? 'تقاریبِ دربار' : 'Ceremony Itinerary'}
              </h3>

              {data.events.map((evt) => (
                <div 
                  key={evt.id}
                  className="bg-[#FAF6EE] border-2 border-[#E6CA65]/70 rounded-2xl p-6 shadow-md hover:border-[#800020] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h4 className="text-xl font-bold text-[#800020]">
                      {isUrdu && evt.nameUr ? evt.nameUr : evt.name}
                    </h4>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#800020] text-[#E6CA65] w-fit">
                      {isUrdu && evt.cityUr ? evt.cityUr : evt.city}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#2A1215] mb-5">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#800020] shrink-0" />
                      <span>{isUrdu && evt.dateUr ? evt.dateUr : evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#800020] shrink-0" />
                      <span>{isUrdu && evt.timeUr ? evt.timeUr : evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-4 h-4 text-[#800020] shrink-0" />
                      <span>{isUrdu && evt.venueAddressUr ? evt.venueAddressUr : `${evt.venueName}, ${evt.venueAddress}`}</span>
                    </div>
                    {evt.dressCode && (
                      <div className="sm:col-span-2 pt-2 border-t border-[#E6CA65]/30 text-[11px] text-[#002366] italic">
                        <span>{isUrdu ? 'لباس:' : 'Dress Code:'} {isUrdu && evt.dressCodeUr ? evt.dressCodeUr : evt.dressCode}</span>
                      </div>
                    )}
                  </div>

                  {evt.googleMapsUrl && (
                    <a
                      href={evt.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#800020] hover:bg-[#5e0017] text-[#E6CA65] text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto shadow-sm"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isUrdu ? 'شاہی مقام کی لوکیشن' : 'Navigate to Palace Venue'}</span>
                    </a>
                  )}
                </div>
              ))}
            </div>

            {/* Custom note */}
            {data.customMessage && (
              <div className="text-center pt-5 border-t border-[#E6CA65]/30 text-xs text-[#2A1215]/80 italic">
                {isUrdu && data.customMessageUr ? data.customMessageUr : data.customMessage}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
