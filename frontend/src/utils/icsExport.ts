import { CalendarEvent } from '@/types/chat';

const TIMEZONE = 'Europe/Paris';

/**
 * Formats a date for ICS with TZID (local time)
 */
function formatDateLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

/**
 * Formats a date as UTC with Z suffix for DTSTAMP
 */
function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Converts calendar events to ICS format for download (RFC 5545 compliant)
 */
export function generateICSContent(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Bob Planning//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:Bob Planning`,
    `X-WR-TIMEZONE:${TIMEZONE}`,
  ];

  // Get the current week's Monday as reference
  const today = new Date();
  const currentDay = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
  monday.setHours(0, 0, 0, 0);

  const dayOffsets: Record<string, number> = {
    'Lun': 0,
    'Mar': 1,
    'Mer': 2,
    'Jeu': 3,
    'Ven': 4,
    'Sam': 5,
    'Dim': 6,
  };

  const now = formatDateUTC(new Date());

  events.forEach((event, index) => {
    const dayOffset = dayOffsets[event.day] ?? 0;
    const eventDate = new Date(monday);
    eventDate.setDate(monday.getDate() + dayOffset);

    // Set start time
    const startHour = Math.floor(event.startHour);
    const startMinute = Math.round((event.startHour % 1) * 60);
    const startDate = new Date(eventDate);
    startDate.setHours(startHour, startMinute, 0, 0);

    // Set end time (duration is in minutes)
    const endDate = new Date(startDate);
    endDate.setMinutes(startDate.getMinutes() + event.duration);

    const uid = `event-${index}-${Date.now()}@bob-planning`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;TZID=${TIMEZONE}:${formatDateLocal(startDate)}`);
    lines.push(`DTEND;TZID=${TIMEZONE}:${formatDateLocal(endDate)}`);
    lines.push(`SUMMARY:${escapeICSText(event.title)}`);
    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
    }
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Escapes special characters for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Downloads the ICS file
 */
export function downloadICS(events: CalendarEvent[], filename = 'planning-bob.ics'): void {
  const content = generateICSContent(events);
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}
