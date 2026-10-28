import React, { useState, useEffect } from 'react';
import { SupportedLanguage } from '../../src/config';

interface CountdownTimerProps {
  targetDate: string;
  language: SupportedLanguage;
  palette?: {
    cardBg: string;
    border: string;
    numberColor: string;
    labelColor: string;
  };
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  language,
  palette = {
    cardBg: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(0, 0, 0, 0.1)',
    numberColor: '#1a1a1a',
    labelColor: '#666666',
  },
}) => {
  const isUrdu = language === 'ur';

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Convert numbers to Urdu numerals if Urdu is active
  const toUrduDigits = (num: number): string => {
    if (!isUrdu) return String(num).padStart(2, '0');
    const urduNums = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(num)
      .padStart(2, '0')
      .split('')
      .map((d) => urduNums[parseInt(d, 10)] ?? d)
      .join('');
  };

  const units = [
    { label: isUrdu ? 'دن' : 'Days', value: toUrduDigits(timeLeft.days) },
    { label: isUrdu ? 'گھنٹے' : 'Hours', value: toUrduDigits(timeLeft.hours) },
    { label: isUrdu ? 'منٹ' : 'Minutes', value: toUrduDigits(timeLeft.minutes) },
    { label: isUrdu ? 'سیکنڈ' : 'Seconds', value: toUrduDigits(timeLeft.seconds) },
  ];

  return (
    <div className="w-full max-w-md mx-auto my-6">
      <p 
        className="text-center text-xs uppercase tracking-widest font-semibold mb-3"
        style={{ color: palette.labelColor }}
      >
        {isUrdu ? 'شادی میں باقی وقت' : 'Countdown to the Celebration'}
      </p>
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        {units.map((unit, idx) => (
          <div
            key={idx}
            className="p-2 sm:p-3 rounded-xl border backdrop-blur-sm transition-transform"
            style={{
              backgroundColor: palette.cardBg,
              borderColor: palette.border,
            }}
          >
            <span
              className="block text-xl sm:text-2xl font-bold font-mono tracking-tight"
              style={{ color: palette.numberColor }}
            >
              {unit.value}
            </span>
            <span
              className={`block text-[10px] sm:text-xs mt-0.5 ${isUrdu ? 'font-urdu-body' : 'uppercase tracking-wider'}`}
              style={{ color: palette.labelColor }}
            >
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
