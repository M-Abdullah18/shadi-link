import { TemplateWeddingData, TemplateEvent } from '../types';

export interface MainEventInfo {
  date: Date;
  targetTimestamp: number;
  day: string; // 2 digits: "01", "25"
  monthEn: string; // "D E C E M B E R"
  monthUr: string; // "دسمبر"
  year: string; // "2026"
  weekdayEn: string; // "FRIDAY"
  weekdayUr: string; // "جمعہ"
  timeEn: string; // "6:00 PM"
  timeUr: string; // "6:00 PM"
  dateTimeLineEn: string; // "FRIDAY · 6:00 PM"
  dateTimeLineUr: string; // "جمعہ · 6:00 PM"
  isPast: boolean;
}

/**
 * Parses an event or string into a UTC Date in Pakistan timezone (Asia/Karachi)
 */
function parseEventTimestamp(event?: TemplateEvent, fallbackWeddingDate?: string): Date {
  if (event?.startsAt) {
    const d = new Date(event.startsAt);
    if (!isNaN(d.getTime())) return d;
  }

  if (event?.date) {
    // Check if ISO or standard date
    const d = new Date(event.date);
    if (!isNaN(d.getTime())) return d;

    // Check for YYYY-MM-DD
    const ymdMatch = event.date.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (ymdMatch) {
      const timeMatch = event.time?.match(/(\d{1,2}):(\d{2})/);
      const hours = timeMatch ? timeMatch[1].padStart(2, '0') : '18';
      const minutes = timeMatch ? timeMatch[2] : '00';
      return new Date(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}T${hours}:${minutes}:00+05:00`);
    }
  }

  if (fallbackWeddingDate) {
    const d = new Date(fallbackWeddingDate);
    if (!isNaN(d.getTime())) return d;
  }

  // Fallback to sample date (30 days from now)
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

/**
 * Computes the MAIN event:
 * "the earliest upcoming event (if all events are in the past, the last one)"
 * Formats all components in the Asia/Karachi time zone with Western digits.
 */
export function getMainEventInfo(data: TemplateWeddingData): MainEventInfo {
  const now = Date.now();

  let chosenDate: Date;

  if (data.events && data.events.length > 0) {
    const eventsWithDates = data.events.map((evt) => {
      const dateObj = parseEventTimestamp(evt, data.weddingDate);
      return {
        evt,
        date: dateObj,
        timestamp: dateObj.getTime(),
      };
    });

    const upcoming = eventsWithDates.filter((e) => e.timestamp >= now);

    if (upcoming.length > 0) {
      // Earliest upcoming event
      upcoming.sort((a, b) => a.timestamp - b.timestamp);
      chosenDate = upcoming[0].date;
    } else {
      // All events are in the past: select the last one
      eventsWithDates.sort((a, b) => a.timestamp - b.timestamp);
      chosenDate = eventsWithDates[eventsWithDates.length - 1].date;
    }
  } else {
    chosenDate = parseEventTimestamp(undefined, data.weddingDate);
  }

  const targetTimestamp = chosenDate.getTime();
  const isPast = now >= targetTimestamp;

  // Format strictly in Asia/Karachi timezone
  // Day: two digits ("01", "25")
  const day = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    day: '2-digit',
  }).format(chosenDate);

  // Year: "2026"
  const year = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
  }).format(chosenDate);

  // Month in English: uppercase with spaced letters ("D E C E M B E R")
  const rawMonthEn = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    month: 'long',
  }).format(chosenDate);
  const monthEn = rawMonthEn.toUpperCase().split('').join(' ');

  // Month in Urdu: "دسمبر", "نومبر", etc.
  const monthUr = new Intl.DateTimeFormat('ur-PK', {
    timeZone: 'Asia/Karachi',
    month: 'long',
  }).format(chosenDate);

  // Weekday in English: "SUNDAY", "FRIDAY", etc.
  const weekdayEn = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    weekday: 'long',
  }).format(chosenDate).toUpperCase();

  // Weekday in Urdu: "اتوار", "جمعہ", etc.
  const weekdayUr = new Intl.DateTimeFormat('ur-PK', {
    timeZone: 'Asia/Karachi',
    weekday: 'long',
  }).format(chosenDate);

  // Time in English: "5:00 PM"
  const timeEn = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(chosenDate);

  // Time in Urdu (using Western digits as requested)
  const timeUr = timeEn;

  const dateTimeLineEn = `${weekdayEn} · ${timeEn}`;
  const dateTimeLineUr = `${weekdayUr} · ${timeUr}`;

  return {
    date: chosenDate,
    targetTimestamp,
    day,
    monthEn,
    monthUr,
    year,
    weekdayEn,
    weekdayUr,
    timeEn,
    timeUr,
    dateTimeLineEn,
    dateTimeLineUr,
    isPast,
  };
}
