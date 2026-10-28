import React from 'react';
import { TemplateComponentProps } from '../types';
import { CountdownTimer } from '../common/CountdownTimer';
import { MapPin, Calendar, Clock, Moon, Sparkles, Star } from 'lucide-react';

export const ChandniRaatThumbnail: React.FC<{ className?: string }> = ({ className = 'w-full h-48' }) => {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-b from-[#0B0F19] via-[#191970]/80 to-[#121212] flex items-center justify-center p-4 border border-[#E8C46A]/50 ${className}`}>
      {/* Crescent Moon & Stars SVG */}
      <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none">
        {/* Crescent */}
        <path d="M50,15 A35,35 0 1 0 85,50 A26,26 0 1 1 50,15 Z" fill="#E8C46A" />
        {/* Twinkles */}
        <circle cx="75" cy="22" r="2" fill="#FFFFFF" opacity="0.9" />
        <circle cx="25" cy="30" r="1.5" fill="#E8C46A" opacity="0.8" />
        <circle cx="80" cy="70" r="2" fill="#E8C46A" opacity="0.7" />
        <circle cx="30" cy="75" r="1.5" fill="#FFFFFF" opacity="0.9" />
      </svg>
      <div className="absolute bottom-2 text-center">
        <span className="text-[10px] font-bold text-[#E8C46A] tracking-widest uppercase font-mono bg-[#121212]/90 px-2.5 py-0.5 rounded border border-[#E8C46A]/40">
          D04 • Chandni
        </span>
      </div>
    </div>
  );
};

export const ChandniRaatTemplate: React.FC<TemplateComponentProps> = ({
  data,
  language,
  guestName,
  isCommonLink,
}) => {
  const isUrdu = language === 'ur';

  const formattedGroom = isUrdu && data.coupleNames.groomUr ? data.coupleNames.groomUr : data.coupleNames.groom;
  const formattedBride = isUrdu && data.coupleNames.brideUr ? data.coupleNames.brideUr : data.coupleNames.bride;
  const greetingText = guestName ? guestName : isUrdu ? 'محترم مہمان' : 'Respected Guest';

  // Fixed light star positions for smooth performance on low-end Android
  const stars = [
    { top: '10%', left: '15%', size: 'w-1 h-1', delay: '0s' },
    { top: '14%', left: '80%', size: 'w-1.5 h-1.5', delay: '1s' },
    { top: '22%', left: '25%', size: 'w-1 h-1', delay: '2s' },
    { top: '35%', left: '90%', size: 'w-1 h-1', delay: '1.5s' },
    { top: '48%', left: '10%', size: 'w-1.5 h-1.5', delay: '0.5s' },
    { top: '65%', left: '85%', size: 'w-1 h-1', delay: '2.5s' },
    { top: '78%', left: '18%', size: 'w-1.5 h-1.5', delay: '1.2s' },
    { top: '90%', left: '75%', size: 'w-1 h-1', delay: '0.8s' },
  ];

  return (
    <div 
      className="min-h-screen py-10 sm:py-16 px-4 sm:px-6 relative overflow-hidden text-[#FCFBF7]"
      style={{
        backgroundColor: '#0A0E17',
        fontFamily: isUrdu ? '"Noto Naskh Arabic", sans-serif' : '"Open Sans", sans-serif',
      }}
    >
      {/* Background celestial starry sky (Pure CSS, GPU-friendly transforms) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s, i) => (
          <div
            key={i}
            className={`absolute ${s.size} bg-white rounded-full animate-pulse opacity-75`}
            style={{
              top: s.top,
              left: s.left,
              animationDelay: s.delay,
              animationDuration: '3s',
            }}
          />
        ))}

        {/* Ambient Moon Glow Gradient */}
        <div className="absolute top-10 right-1/2 translate-x-1/2 w-80 h-80 bg-[#191970]/30 rounded-full blur-3xl" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* Main Night Invitation Card */}
        <div className="bg-[#121824]/90 border border-[#E8C46A]/60 rounded-3xl shadow-2xl p-6 sm:p-10 backdrop-blur-md relative overflow-hidden">
          
          {/* Glowing Crescent Moon Header (Original SVG) */}
          <div className="text-center mb-6 relative">
            <div className="w-20 h-20 mx-auto flex items-center justify-center relative">
              <svg className="w-16 h-16 transform -rotate-12 drop-shadow-[0_0_15px_rgba(232,196,106,0.5)]" viewBox="0 0 100 100" fill="none">
                <path d="M50,15 A35,35 0 1 0 85,50 A26,26 0 1 1 50,15 Z" fill="#E8C46A" />
              </svg>
              <div className="absolute -top-1 -right-1">
                <Star className="w-4 h-4 text-[#E8C46A] fill-[#E8C46A] animate-spin" style={{ animationDuration: '8s' }} />
              </div>
            </div>

            <p className="text-xs uppercase tracking-widest text-[#E8C46A] font-semibold mt-2">
              {isUrdu ? 'دعوتِ عقدِ مسرت' : 'An Evening Under the Stars'}
            </p>
          </div>

          {/* Bismillah */}
          <div className="text-center pb-6 border-b border-[#E8C46A]/20">
            <p className="text-2xl sm:text-3xl text-[#E8C46A] tracking-wider mb-2 font-serif">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <span className="text-[11px] text-[#FCFBF7]/70 uppercase tracking-widest">
              {isUrdu ? 'شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے' : 'In the name of Allah, the Most Gracious, the Most Merciful'}
            </span>
          </div>

          {/* Guest Honor Greeting */}
          <div className="text-center pt-6 pb-2">
            <span className="inline-block px-3.5 py-1 rounded-full bg-[#191970]/50 text-[#E8C46A] text-xs font-semibold uppercase tracking-wider border border-[#E8C46A]/40 mb-3">
              {isUrdu ? 'معزز مہمان' : 'Most Honored Guest'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#FCFBF7]">
              {greetingText}
            </h2>
          </div>

          {/* Couple Announcement */}
          <div className="text-center my-6 py-6 px-4 bg-[#191970]/20 rounded-2xl border border-[#E8C46A]/30">
            <p className="text-xs uppercase tracking-widest text-[#E8C46A] font-semibold mb-2">
              {isUrdu ? 'رشتۂ ازدواج کا پرنور جشن' : 'Cordially invite you to celebrate the marriage of'}
            </p>
            <h1 
              className="text-4xl sm:text-5xl font-bold text-[#E8C46A] my-3 leading-tight"
              style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Great Vibes", cursive' }}
            >
              {formattedGroom} <br />
              <span className="text-lg sm:text-2xl font-light text-[#FCFBF7]">&</span> <br />
              {formattedBride}
            </h1>

            {data.parentsNames && (
              <div className="w-full max-w-md mx-auto pt-4 border-t border-[#E8C46A]/20 mt-4 text-xs text-[#FCFBF7]/80 leading-relaxed">
                <p>{isUrdu ? data.parentsNames.groomParentsUr || data.parentsNames.groomParents : `Son of ${data.parentsNames.groomParents}`}</p>
                <p className="mt-1">{isUrdu ? data.parentsNames.brideParentsUr || data.parentsNames.brideParents : `Daughter of ${data.parentsNames.brideParents}`}</p>
              </div>
            )}
          </div>

          {/* Countdown to the Moonlit Night */}
          <CountdownTimer
            targetDate={data.weddingDate}
            language={language}
            palette={{
              cardBg: 'rgba(25, 25, 112, 0.4)',
              border: '#E8C46A',
              numberColor: '#E8C46A',
              labelColor: '#FCFBF7',
            }}
          />

          {/* Events Schedule */}
          <div className="space-y-4 my-8">
            <h3 
              className="text-2xl font-bold text-center text-[#E8C46A] mb-4"
              style={{ fontFamily: isUrdu ? '"Noto Nastaliq Urdu", serif' : '"Playfair Display", serif' }}
            >
              {isUrdu ? 'شبِ تقریب' : 'Night Celebration'}
            </h3>

            {data.events.map((evt) => (
              <div 
                key={evt.id}
                className="bg-[#191970]/30 border border-[#E8C46A]/50 rounded-2xl p-6 shadow-lg hover:border-[#E8C46A] transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <h4 className="text-xl font-bold text-[#E8C46A]">
                    {isUrdu && evt.nameUr ? evt.nameUr : evt.name}
                  </h4>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#121212] text-[#E8C46A] border border-[#E8C46A]/40 w-fit">
                    {isUrdu && evt.cityUr ? evt.cityUr : evt.city}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#FCFBF7]/90 mb-5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#E8C46A] shrink-0" />
                    <span>{isUrdu && evt.dateUr ? evt.dateUr : evt.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#E8C46A] shrink-0" />
                    <span>{isUrdu && evt.timeUr ? evt.timeUr : evt.time}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-[#E8C46A] shrink-0" />
                    <span>{isUrdu && evt.venueAddressUr ? evt.venueAddressUr : `${evt.venueName}, ${evt.venueAddress}`}</span>
                  </div>
                  {evt.dressCode && (
                    <div className="sm:col-span-2 pt-2 border-t border-[#E8C46A]/20 text-[11px] text-[#E8C46A]/90 italic">
                      <span>{isUrdu ? 'ڈریس کوڈ:' : 'Dress Code:'} {isUrdu && evt.dressCodeUr ? evt.dressCodeUr : evt.dressCode}</span>
                    </div>
                  )}
                </div>

                {evt.googleMapsUrl && (
                  <a
                    href={evt.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#E8C46A] to-[#caa348] text-[#121212] text-xs font-bold uppercase tracking-wider transition-all w-full sm:w-auto shadow-md hover:brightness-110 active:scale-95"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{isUrdu ? 'گوگل میپس پر راستہ دیکھیں' : 'View Venue on Google Maps'}</span>
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Custom Message */}
          {data.customMessage && (
            <div className="text-center pt-4 border-t border-[#E8C46A]/20 text-xs text-[#FCFBF7]/70 italic">
              {isUrdu && data.customMessageUr ? data.customMessageUr : data.customMessage}
            </div>
          )}

          {/* Nocturnal Flying Sparrows SVG Animation across the starry horizon */}
          <div className="mt-8 pt-6 border-t border-[#E8C46A]/20 text-center relative overflow-hidden">
            <div className="flex items-center justify-center gap-6 opacity-60">
              <svg className="w-8 h-8 text-[#E8C46A] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2 C10,5 6,6 2,7 C6,9 9,11 10,14 C11,11 14,9 18,9 C15,8 13,5 12,2 Z" />
              </svg>
              <svg className="w-10 h-10 text-[#E8C46A] -mt-2 animate-bounce" style={{ animationDuration: '4s' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2 C10,5 6,6 2,7 C6,9 9,11 10,14 C11,11 14,9 18,9 C15,8 13,5 12,2 Z" />
              </svg>
              <svg className="w-7 h-7 text-[#E8C46A] animate-pulse" style={{ animationDuration: '3s' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12,2 C10,5 6,6 2,7 C6,9 9,11 10,14 C11,11 14,9 18,9 C15,8 13,5 12,2 Z" />
              </svg>
            </div>
            <p className="text-[11px] text-[#E8C46A]/80 tracking-widest mt-2 uppercase">
              {isUrdu ? 'دعاؤں اور تمناؤں کے ساتھ' : 'Blessings on the auspicious night'}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
