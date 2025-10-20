/**
 * Date utilities for event management
 */

export class DateUtils {
  /**
   * Parse date string with timezone support
   */
  public static parseDate(dateString: string, timeString: string, timezone: string): Date {
    // Handle various date formats
    let parsedDate: Date;
    
    // Try ISO format first
    if (dateString.includes('T') || dateString.includes('Z')) {
      parsedDate = new Date(dateString);
    } else {
      // Handle common formats like "October 19, 2025" or "2025-10-19"
      const dateTimeString = `${dateString}T${timeString}`;
      parsedDate = new Date(dateTimeString);
    }

    // If parsing failed, try alternative formats
    if (isNaN(parsedDate.getTime())) {
      // Try parsing with timezone
      const dateTimeString = `${dateString} ${timeString}`;
      parsedDate = new Date(dateTimeString);
    }

    // If still invalid, create a new date
    if (isNaN(parsedDate.getTime())) {
      console.warn(`Failed to parse date: ${dateString} ${timeString}`);
      parsedDate = new Date();
    }

    return parsedDate;
  }

  /**
   * Format date for display
   */
  public static formatDate(date: Date, format: 'short' | 'long' | 'time' | 'datetime' = 'long', locale: string = 'en-US'): string {
    const options: Intl.DateTimeFormatOptions = {};

    switch (format) {
      case 'short':
        options.month = 'short';
        options.day = 'numeric';
        options.year = 'numeric';
        break;
      case 'long':
        options.weekday = 'long';
        options.year = 'numeric';
        options.month = 'long';
        options.day = 'numeric';
        break;
      case 'time':
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
        break;
      case 'datetime':
        options.weekday = 'short';
        options.year = 'numeric';
        options.month = 'short';
        options.day = 'numeric';
        options.hour = '2-digit';
        options.minute = '2-digit';
        options.hour12 = true;
        break;
    }

    return date.toLocaleDateString(locale, options);
  }

  /**
   * Check if date is today
   */
  public static isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  /**
   * Check if date is tomorrow
   */
  public static isTomorrow(date: Date): boolean {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  }

  /**
   * Check if date is yesterday
   */
  public static isYesterday(date: Date): boolean {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  public static getRelativeTime(date: Date, locale: string = 'en-US'): string {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const absDiff = Math.abs(diff);
    
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    
    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
      return rtf.format(diff > 0 ? years : -years, 'year');
    } else if (months > 0) {
      return rtf.format(diff > 0 ? months : -months, 'month');
    } else if (weeks > 0) {
      return rtf.format(diff > 0 ? weeks : -weeks, 'week');
    } else if (days > 0) {
      return rtf.format(diff > 0 ? days : -days, 'day');
    } else if (hours > 0) {
      return rtf.format(diff > 0 ? hours : -hours, 'hour');
    } else if (minutes > 0) {
      return rtf.format(diff > 0 ? minutes : -minutes, 'minute');
    } else {
      return rtf.format(diff > 0 ? seconds : -seconds, 'second');
    }
  }

  /**
   * Check if date is in the past
   */
  public static isPast(date: Date): boolean {
    return date < new Date();
  }

  /**
   * Check if date is in the future
   */
  public static isFuture(date: Date): boolean {
    return date > new Date();
  }

  /**
   * Get start of day
   */
  public static getStartOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  /**
   * Get end of day
   */
  public static getEndOfDay(date: Date): Date {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  }

  /**
   * Add days to date
   */
  public static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add hours to date
   */
  public static addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  /**
   * Get days between two dates
   */
  public static getDaysBetween(date1: Date, date2: Date): number {
    const diff = Math.abs(date2.getTime() - date1.getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if two dates are on the same day
   */
  public static isSameDay(date1: Date, date2: Date): boolean {
    return date1.toDateString() === date2.toDateString();
  }

  /**
   * Get week number of year
   */
  public static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  /**
   * Get month name
   */
  public static getMonthName(date: Date, locale: string = 'en-US'): string {
    return date.toLocaleDateString(locale, { month: 'long' });
  }

  /**
   * Get day name
   */
  public static getDayName(date: Date, locale: string = 'en-US'): string {
    return date.toLocaleDateString(locale, { weekday: 'long' });
  }
}
