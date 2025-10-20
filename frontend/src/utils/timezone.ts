/**
 * Timezone utilities for event management
 */

export interface TimezoneInfo {
  name: string;
  offset: string;
  abbreviation: string;
}

export const COMMON_TIMEZONES: TimezoneInfo[] = [
  { name: 'UTC', offset: '+00:00', abbreviation: 'UTC' },
  { name: 'America/New_York', offset: '-05:00', abbreviation: 'EST' },
  { name: 'America/Los_Angeles', offset: '-08:00', abbreviation: 'PST' },
  { name: 'Europe/London', offset: '+00:00', abbreviation: 'GMT' },
  { name: 'Europe/Paris', offset: '+01:00', abbreviation: 'CET' },
  { name: 'Asia/Tokyo', offset: '+09:00', abbreviation: 'JST' },
  { name: 'Asia/Kolkata', offset: '+05:30', abbreviation: 'IST' },
  { name: 'Asia/Dubai', offset: '+04:00', abbreviation: 'GST' },
  { name: 'Australia/Sydney', offset: '+10:00', abbreviation: 'AEST' },
  { name: 'Pacific/Auckland', offset: '+12:00', abbreviation: 'NZST' },
];

export class TimezoneUtils {
  /**
   * Get user's timezone
   */
  public static getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  /**
   * Convert date to specific timezone
   */
  public static convertToTimezone(date: Date, timezone: string): Date {
    const utcDate = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));
    return new Date(utcDate.toLocaleString('en-US', { timeZone: timezone }));
  }

  /**
   * Get timezone offset in minutes
   */
  public static getTimezoneOffset(timezone: string): number {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
    return (targetTime.getTime() - utc.getTime()) / 60000;
  }

  /**
   * Check if two dates are in the same timezone
   */
  public static isSameTimezone(date1: Date, date2: Date): boolean {
    return date1.getTimezoneOffset() === date2.getTimezoneOffset();
  }

  /**
   * Format date with timezone information
   */
  public static formatWithTimezone(date: Date, timezone: string, locale: string = 'en-US'): string {
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    };
    
    return date.toLocaleDateString(locale, options);
  }

  /**
   * Get timezone abbreviation
   */
  public static getTimezoneAbbreviation(timezone: string): string {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    
    return formatter.formatToParts(date)
      .find(part => part.type === 'timeZoneName')?.value || timezone;
  }

  /**
   * Check if a timezone is valid
   */
  public static isValidTimezone(timezone: string): boolean {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get all available timezones
   */
  public static getAvailableTimezones(): string[] {
    return Intl.supportedValuesOf('timeZone');
  }

  /**
   * Compare dates across timezones
   */
  public static compareDates(date1: Date, date2: Date, timezone1?: string, timezone2?: string): number {
    let d1 = date1;
    let d2 = date2;

    if (timezone1) {
      d1 = this.convertToTimezone(date1, timezone1);
    }
    
    if (timezone2) {
      d2 = this.convertToTimezone(date2, timezone2);
    }

    return d1.getTime() - d2.getTime();
  }

  /**
   * Get time difference between two dates in a specific timezone
   */
  public static getTimeDifference(date1: Date, date2: Date, timezone: string): {
    days: number;
    hours: number;
    minutes: number;
    total: number;
  } {
    const d1 = this.convertToTimezone(date1, timezone);
    const d2 = this.convertToTimezone(date2, timezone);
    const diff = Math.abs(d2.getTime() - d1.getTime());

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return {
      days,
      hours,
      minutes,
      total: diff
    };
  }
}
