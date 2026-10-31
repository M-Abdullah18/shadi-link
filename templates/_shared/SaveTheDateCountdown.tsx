import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Sparkles } from 'lucide-react';
import { TemplateWeddingData } from '../types';
import { SupportedLanguage } from '../../src/config';
import { getMainEventInfo } from './mainEventUtils';

export interface SaveTheDatePalette {
  cardBg: string;
  border: string;
  accent: string;
  primaryText: string;
  secondaryText: string;
  divider: string;
  countdownCardBg: string;
  countdownBorder: string;
  countdownNumberColor: string;
  countdownLabelColor: string;
}

export interface SaveTheDateCountdownProps {
  data: TemplateWeddingData;
  language: SupportedLanguage;
  palette: SaveTheDatePalette;
  fontFamilyHeading?: string; // e.g. "Cinzel", "Playfair Display", "Great Vibes"
  fontFamilyBody?: string;
  containerClassName?: string;
  cardClassName?: string;
}

export const SaveTheDateCountdown: React.FC<SaveTheDateCountdownProps> = ({
  data,
  language,
  palette,
  fontFamilyHeading,
  fontFamilyBody,
  containerClassName = '',
  cardClassName = '',
}) => {
  const isUrdu = language === 'ur';
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Compute main event information in Asia/Karachi time zone
  const eventInfo = getMainEventInfo(data);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    hasStarted: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    hasStarted: eventInfo.isPast,
  });

  // Track visibility with IntersectionObserver so interval only runs when section is visible
  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Update countdown once per second only while visible
  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const difference = eventInfo.targetTimestamp - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
          hasStarted: false,
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          hasStarted: true,
        });
      }
    };

    calculateTime();

    if (!isVisible) return;

    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventInfo.targetTimestamp, isVisible]);

  // Two-digit Western digits in both English and Urdu as instructed
  const formatDigits = (num: number) => String(num).padStart(2, '0');

  const countdownUnits = [
    { label: isUrdu ? 'دن' : 'Days', value: formatDigits(timeLeft.days) },
    { label: isUrdu ? 'گھنٹے' : 'Hours', value: formatDigits(timeLeft.hours) },
    { label: isUrdu ? 'منٹ' : 'Minutes', value: formatDigits(timeLeft.minutes) },
    { label: isUrdu ? 'سیکنڈ' : 'Seconds', value: formatDigits(timeLeft.seconds) },
  ];

  return (
    <div
      ref={containerRef}
      dir={isUrdu ? 'rtl' : 'ltr'}
      className={`w-full max-w-md mx-auto my-8 ${containerClassName}`}
    >
      {/* 1. SAVE THE DATE CARD */}
      <div
        className={`rounded-2xl p-6 sm:p-8 text-center border shadow-lg transition-transform motion-reduce:transition-none motion-reduce:transform-none ${cardClassName}`}
        style={{
          backgroundColor: palette.cardBg,
          borderColor: palette.border,
        }}
      >
        {/* Top: Small "SAVE THE DATE" label and calendar icon between thin lines */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="flex-1 h-px opacity-60"
            style={{ backgroundColor: palette.divider }}
          />
          <div
            className="flex items-center gap-1.5 px-2 py-0.5"
            style={{ color: palette.accent }}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span
              className={`text-[11px] font-bold tracking-widest uppercase ${
                isUrdu ? 'font-urdu-body tracking-normal text-xs' : ''
              }`}
              style={{
                fontFamily: isUrdu
                  ? '"Noto Naskh Arabic", serif'
                  : fontFamilyBody || 'inherit',
              }}
            >
              {isUrdu ? 'تاریخ یاد رکھیں' : 'SAVE THE DATE'}
            </span>
          </div>
          <div
            className="flex-1 h-px opacity-60"
            style={{ backgroundColor: palette.divider }}
          />
        </div>

        {/* Very large two-digit day number (e.g. "01", "25") */}
        <div
          className="text-6xl sm:text-7xl font-bold tracking-tight my-1 select-none"
          style={{
            color: palette.primaryText,
            fontFamily: isUrdu
              ? '"Noto Nastaliq Urdu", serif'
              : fontFamilyHeading || 'serif',
          }}
        >
          {eventInfo.day}
        </div>

        {/* Month name in spaced capital letters / Urdu Nastaliq */}
        <div
          className={`text-sm sm:text-base font-bold tracking-widest mt-1 ${
            isUrdu ? 'font-urdu-heading text-lg tracking-normal' : 'uppercase'
          }`}
          style={{
            color: palette.secondaryText,
            fontFamily: isUrdu
              ? '"Noto Nastaliq Urdu", serif'
              : fontFamilyHeading || 'serif',
          }}
        >
          {isUrdu ? eventInfo.monthUr : eventInfo.monthEn}
        </div>

        {/* Year in smaller gold text */}
        <div
          className="text-xs sm:text-sm font-semibold tracking-wider mt-0.5"
          style={{
            color: palette.accent,
            fontFamily: isUrdu
              ? '"Noto Naskh Arabic", serif'
              : fontFamilyBody || 'inherit',
          }}
        >
          {eventInfo.year}
        </div>

        {/* Thin divider */}
        <div
          className="w-24 h-px mx-auto my-3.5 opacity-60"
          style={{ backgroundColor: palette.divider }}
        />

        {/* Small line: "SUNDAY · 5:00 PM" */}
        <div
          className={`text-xs font-semibold tracking-wider ${
            isUrdu ? 'font-urdu-body tracking-normal' : 'uppercase'
          }`}
          style={{
            color: palette.secondaryText,
            fontFamily: isUrdu
              ? '"Noto Naskh Arabic", serif'
              : fontFamilyBody || 'inherit',
          }}
        >
          {isUrdu ? eventInfo.dateTimeLineUr : eventInfo.dateTimeLineEn}
        </div>
      </div>

      {/* 2. COUNTDOWN DIRECTLY BELOW SAVE THE DATE SECTION */}
      <div className="mt-6">
        {timeLeft.hasStarted ? (
          /* When the event has started, replace countdown with friendly message */
          <div
            className="p-4 rounded-xl border text-center backdrop-blur-sm animate-in fade-in duration-300"
            style={{
              backgroundColor: palette.countdownCardBg,
              borderColor: palette.countdownBorder,
            }}
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-4 h-4" style={{ color: palette.accent }} />
              <p
                className={`text-sm sm:text-base font-bold ${
                  isUrdu ? 'font-urdu-heading' : ''
                }`}
                style={{
                  color: palette.countdownNumberColor,
                  fontFamily: isUrdu
                    ? '"Noto Nastaliq Urdu", serif'
                    : fontFamilyHeading || 'serif',
                }}
              >
                {isUrdu ? 'جشن کا آغاز ہو چکا ہے' : 'The celebrations have begun'}
              </p>
            </div>
            <p
              className={`text-xs ${isUrdu ? 'font-urdu-body' : ''}`}
              style={{ color: palette.countdownLabelColor }}
            >
              {isUrdu
                ? 'شادی کی پرمسرت تقریبات جاری ہیں'
                : 'The joyous festivities are currently underway'}
            </p>
          </div>
        ) : (
          /* Active Countdown */
          <div>
            <p
              className={`text-center text-[11px] font-semibold uppercase tracking-widest mb-2.5 ${
                isUrdu ? 'font-urdu-body tracking-normal text-xs' : ''
              }`}
              style={{
                color: palette.countdownLabelColor,
                fontFamily: isUrdu
                  ? '"Noto Naskh Arabic", serif'
                  : fontFamilyBody || 'inherit',
              }}
            >
              {isUrdu ? 'شادی میں باقی وقت' : 'Countdown to the Celebration'}
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
              {countdownUnits.map((unit, idx) => (
                <div
                  key={idx}
                  className="p-2.5 sm:p-3 rounded-xl border backdrop-blur-sm transition-transform motion-reduce:transition-none"
                  style={{
                    backgroundColor: palette.countdownCardBg,
                    borderColor: palette.countdownBorder,
                  }}
                >
                  <span
                    className="block text-xl sm:text-2xl font-bold font-mono tracking-tight"
                    style={{ color: palette.countdownNumberColor }}
                  >
                    {unit.value}
                  </span>
                  <span
                    className={`block text-[10px] sm:text-xs mt-0.5 ${
                      isUrdu ? 'font-urdu-body' : 'uppercase tracking-wider'
                    }`}
                    style={{
                      color: palette.countdownLabelColor,
                      fontFamily: isUrdu
                        ? '"Noto Naskh Arabic", serif'
                        : fontFamilyBody || 'inherit',
                    }}
                  >
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
