import React from 'react';
import { TemplateComponentProps } from '../types';
import { SaveTheDateCountdown } from '../_shared/SaveTheDateCountdown';
import { MapPin, Calendar, Clock, Sparkles } from 'lucide-react';

export const EmeraldRoyaleThumbnail: React.FC<{ className?: string }> = ({ className = 'w-full h-48' }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-[#064E3B] via-[#043324] to-[#022419] flex items-center justify-center p-4 border border-[#D4AF37]/60 ${className}`}>
      {/* Mughal Gold Border Ornament */}
      <svg className="w-28 h-28" viewBox="0 0 100 100" fill="none">
        <rect x="10" y="10" width="80" height="80" rx="8" stroke="#D4AF37" strokeWidth="1.5" />
        <rect x="15" y="15" width="70" height="70" rx="4" stroke="#D4AF37" strokeWidth="0.75" strokeDasharray="2 2" />
        <circle cx="50" cy="50" r="14" fill="#064E3B" stroke="#D4AF37" strokeWidth="1" />
        <circle cx="50" cy="50" r="6" fill="#D4AF37" />
      </svg>
      <div className="absolute bottom-2 text-center">
        <span className="text-[10px] font-bold text-[#D4AF37] tracking-widest uppercase font-mono bg-[#022419]/90 px-2.5 py-0.5 rounded border border-[#D4AF37]/50">
          D01 • Emerald
        </span>
      </div>
    </div>
  );
};

export const EmeraldRoyaleTemplate: React.FC<TemplateComponentProps> = ({
  data,
  language,
  guestName,
  isCommonLink,
}) => {
  const isUrdu = language === 'ur';

  const formattedGroom = isUrdu && data.coupleNames.groomUr ? data.coupleNames.groomUr : data.coupleNames.groom;
  const formattedBride = isUrdu && data.coupleNames.brideUr ? data.coupleNames.brideUr : data.coupleNames.bride;
  const greetingText = guestName ? guestName : isUrdu ? 'محترم مہمان' : 'Respected Guest';

  return (
    <div 
      className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 relative overflow-hidden text-[#FCFBF7]"
      style={{
        backgroundColor: '#032318',
        fontFamily: isUrdu ? '"Noto Naskh Arabic", sans-serif' : 'Georgia, serif',
      }}
    >
      <div className="max-w-xl mx-auto">
        <div className="bg-[#042E20] border-2 border-[#D4AF37] rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden">
          
          {/* Corner gold ornaments */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#D4AF37] rounded-tl-lg pointer-events-none" />
          <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#D4AF37] rounded-tr-lg pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#D4AF37] rounded-bl-lg pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#D4AF37] rounded-br-lg pointer-events-none" />

          {/* Bismillah Header */}
          <div className="text-center pb-6 border-b border-[#D4AF37]/30">
            <p className="text-2xl sm:text-3xl text-[#D4AF37] tracking-wider mb-2 font-serif">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <span className="text-[11px] text-[#FCFBF7]/70 uppercase tracking-widest font-semibold">
              {isUrdu ? 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
            </span>
          </div>

          {/* Guest Greeting */}
          <div className="text-center pt-6 pb-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#022419] text-[#D4AF37] text-xs font-semibold uppercase tracking-wider border border-[#D4AF37]/40 mb-3">
              {isUrdu ? 'گرامی قدر مہمان' : 'Honored Guest'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FCFBF7]">
              {greetingText}
            </h2>
          </div>

          {/* Couple Announcement */}
          <div className="text-center my-6 py-6 px-4 bg-[#022419]/60 rounded-2xl border border-[#D4AF37]/40">
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-2">
              {isUrdu ? 'شادی کا پرمسرت دعوت نامہ' : 'Wedding Celebration of'}
            </p>
            <h1 
              className="text-3xl sm:text-5xl font-bold text-[#FCFBF7] my-3 leading-tight"
              style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Playfair Display", serif' }}
            >
              {formattedGroom} <br />
              <span className="text-xl sm:text-2xl font-light text-[#D4AF37]">&</span> <br />
              {formattedBride}
            </h1>

            {data.parentsNames && (
              <div className="w-full max-w-md mx-auto pt-4 border-t border-[#D4AF37]/20 mt-4 text-xs text-[#FCFBF7]/80 leading-relaxed font-serif">
                <p>{isUrdu ? data.parentsNames.groomParentsUr || data.parentsNames.groomParents : `Son of ${data.parentsNames.groomParents}`}</p>
                <p className="mt-1">{isUrdu ? data.parentsNames.brideParentsUr || data.parentsNames.brideParents : `Daughter of ${data.parentsNames.brideParents}`}</p>
              </div>
            )}
          </div>

          {/* Save the Date & Live Countdown */}
          <SaveTheDateCountdown
            data={data}
            language={language}
            fontFamilyHeading='"Playfair Display", serif'
            palette={{
              cardBg: '#022419',
              border: '#D4AF37',
              accent: '#D4AF37',
              primaryText: '#FCFBF7',
              secondaryText: '#D4AF37',
              divider: '#D4AF37',
              countdownCardBg: '#022419',
              countdownBorder: '#D4AF37',
              countdownNumberColor: '#D4AF37',
              countdownLabelColor: '#FCFBF7',
            }}
          />

          {/* Events Schedule */}
          <div className="space-y-4 my-8">
            <h3 
              className="text-2xl font-bold text-center text-[#D4AF37] mb-4"
              style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Playfair Display", serif' }}
            >
              {isUrdu ? 'تقاریبِ شادی' : 'Wedding Functions'}
            </h3>

            {data.events.map((evt) => (
              <div 
                key={evt.id}
                className="bg-[#022419]/70 border border-[#D4AF37]/40 rounded-2xl p-5 shadow-md hover:border-[#D4AF37] transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xl font-bold text-[#D4AF37]">
                    {isUrdu && evt.nameUr ? evt.nameUr : evt.name}
                  </h4>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#064E3B] text-[#D4AF37] border border-[#D4AF37]/40 w-fit">
                    {isUrdu && evt.cityUr ? evt.cityUr : evt.city}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#FCFBF7]/85 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{isUrdu && evt.dateUr ? evt.dateUr : evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{isUrdu && evt.timeUr ? evt.timeUr : evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    <span>{isUrdu && evt.venueAddressUr ? evt.venueAddressUr : `${evt.venueName}, ${evt.venueAddress}`}</span>
                  </div>
                  {evt.dressCode && (
                    <div className="sm:col-span-2 pt-2 border-t border-[#D4AF37]/20 text-[11px] text-[#D4AF37] italic">
                      <span>{isUrdu ? 'لباس:' : 'Dress Code:'} {isUrdu && evt.dressCodeUr ? evt.dressCodeUr : evt.dressCode}</span>
                    </div>
                  )}
                </div>

                {evt.googleMapsUrl && (
                  <a
                    href={evt.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#bfa035] text-[#022419] text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto shadow-sm"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'گوگل میپس پر راستہ دیکھیں' : 'View Venue on Google Maps'}</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Custom message */}
          {data.customMessage && (
            <div className="text-center pt-4 border-t border-[#D4AF37]/20 text-xs text-[#FCFBF7]/70 italic">
              {isUrdu && data.customMessageUr ? data.customMessageUr : data.customMessage}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
