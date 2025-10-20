import { Event, CategorizedEvents, RecurringPattern } from '../types/event';

export class EventService {
  private static instance: EventService;
  private events: Event[] = [];
  private updateInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.startAutoUpdate();
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  /**
   * Add or update an event
   */
  public addEvent(event: Event): void {
    const existingIndex = this.events.findIndex(e => e.id === event.id);
    
    if (existingIndex >= 0) {
      this.events[existingIndex] = { ...event, lastModified: new Date() };
    } else {
      this.events.push({ ...event, created: new Date(), lastModified: new Date() });
    }
    
    this.categorizeEvents();
  }

  /**
   * Remove an event
   */
  public removeEvent(eventId: string): void {
    this.events = this.events.filter(e => e.id !== eventId);
  }

  /**
   * Clear all events
   */
  public clearAllEvents(): void {
    this.events = [];
  }

  /**
   * Get events by schedule type
   */
  public getEventsBySchedule(scheduleType: 'parvathy' | 'sreedevi'): Event[] {
    return this.events.filter(event => {
      // Check if event ID contains schedule identifier
      return scheduleType === 'parvathy' 
        ? event.id.includes('-a') || event.id.includes('parvathy')
        : event.id.includes('-b') || event.id.includes('sreedevi');
    });
  }

  /**
   * Get categorized events by schedule type
   */
  public getCategorizedEventsBySchedule(scheduleType: 'parvathy' | 'sreedevi'): CategorizedEvents {
    const scheduleEvents = this.getEventsBySchedule(scheduleType);
    const now = new Date();
    
    const upcoming = scheduleEvents
      .filter(event => this.isEventUpcoming(event, now))
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    
    const past = scheduleEvents
      .filter(event => !this.isEventUpcoming(event, now))
      .sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());

    return { upcoming, past };
  }

  /**
   * Get all events
   */
  public getAllEvents(): Event[] {
    return [...this.events];
  }

  /**
   * Get categorized events (upcoming vs past)
   */
  public getCategorizedEvents(): CategorizedEvents {
    const now = new Date();
    
    const upcoming = this.events
      .filter(event => this.isEventUpcoming(event, now))
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
    
    const past = this.events
      .filter(event => !this.isEventUpcoming(event, now))
      .sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());

    return { upcoming, past };
  }

  /**
   * Get upcoming events only
   */
  public getUpcomingEvents(): Event[] {
    const now = new Date();
    return this.events
      .filter(event => this.isEventUpcoming(event, now))
      .sort((a, b) => a.startDateTime.getTime() - b.startDateTime.getTime());
  }

  /**
   * Get past events only
   */
  public getPastEvents(): Event[] {
    const now = new Date();
    return this.events
      .filter(event => !this.isEventUpcoming(event, now))
      .sort((a, b) => b.startDateTime.getTime() - a.startDateTime.getTime());
  }

  /**
   * Check if an event is upcoming
   */
  private isEventUpcoming(event: Event, now: Date): boolean {
    // Handle recurring events
    if (event.isRecurring && event.recurringPattern) {
      return this.isRecurringEventUpcoming(event, now);
    }
    
    // Handle single events - compare with current time
    const isUpcoming = event.startDateTime > now;
    
    // Debug logging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`Event "${event.title}":`, {
        startDateTime: event.startDateTime.toISOString(),
        now: now.toISOString(),
        isUpcoming,
        timeDiff: event.startDateTime.getTime() - now.getTime()
      });
    }
    
    return isUpcoming;
  }

  /**
   * Check if a recurring event has upcoming occurrences
   */
  private isRecurringEventUpcoming(event: Event, now: Date): boolean {
    if (!event.recurringPattern) return false;

    const pattern = event.recurringPattern;
    const nextOccurrence = this.getNextRecurringOccurrence(event, now);
    
    if (!nextOccurrence) return false;
    
    // Check if the next occurrence is within the end date limit
    if (pattern.endDate && nextOccurrence > pattern.endDate) {
      return false;
    }
    
    // Check if we've exceeded the maximum occurrences
    if (pattern.occurrences) {
      const totalOccurrences = this.getTotalOccurrences(event, now);
      if (totalOccurrences >= pattern.occurrences) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get the next occurrence of a recurring event
   */
  private getNextRecurringOccurrence(event: Event, fromDate: Date): Date | null {
    if (!event.recurringPattern) return null;

    const pattern = event.recurringPattern;
    let nextDate = new Date(event.startDateTime);

    switch (pattern.type) {
      case 'daily':
        while (nextDate <= fromDate) {
          nextDate.setDate(nextDate.getDate() + pattern.interval);
        }
        break;
      
      case 'weekly':
        while (nextDate <= fromDate) {
          nextDate.setDate(nextDate.getDate() + (7 * pattern.interval));
        }
        break;
      
      case 'monthly':
        while (nextDate <= fromDate) {
          nextDate.setMonth(nextDate.getMonth() + pattern.interval);
        }
        break;
      
      case 'yearly':
        while (nextDate <= fromDate) {
          nextDate.setFullYear(nextDate.getFullYear() + pattern.interval);
        }
        break;
    }

    return nextDate;
  }

  /**
   * Get total occurrences of a recurring event up to a given date
   */
  private getTotalOccurrences(event: Event, upToDate: Date): number {
    if (!event.recurringPattern) return 0;

    let count = 0;
    let currentDate = new Date(event.startDateTime);
    const pattern = event.recurringPattern;

    while (currentDate <= upToDate) {
      count++;
      
      switch (pattern.type) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + pattern.interval);
          break;
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + (7 * pattern.interval));
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + pattern.interval);
          break;
        case 'yearly':
          currentDate.setFullYear(currentDate.getFullYear() + pattern.interval);
          break;
      }
    }

    return count;
  }

  /**
   * Categorize all events and update their status
   */
  private categorizeEvents(): void {
    const now = new Date();
    
    this.events.forEach(event => {
      if (this.isEventUpcoming(event, now)) {
        event.status = 'upcoming';
      } else {
        event.status = 'past';
      }
    });
  }

  /**
   * Start automatic event categorization
   */
  private startAutoUpdate(): void {
    // Update every minute to ensure accurate categorization
    this.updateInterval = setInterval(() => {
      this.categorizeEvents();
    }, 60000); // 1 minute
  }

  /**
   * Stop automatic updates
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  /**
   * Convert timezone-aware date string to Date object
   */
  public static parseEventDateTime(dateString: string, timeString: string, timezone: string): Date {
    // Create a date string in ISO format with timezone
    const dateTimeString = `${dateString}T${timeString}`;
    
    // Use Intl.DateTimeFormat to handle timezone conversion
    const date = new Date(dateTimeString);
    
    // If the date is invalid, try parsing with timezone offset
    if (isNaN(date.getTime())) {
      // Fallback: assume the timezone is UTC offset
      const utcDate = new Date(dateTimeString + 'Z');
      return utcDate;
    }
    
    return date;
  }

  /**
   * Format event date for display
   */
  public static formatEventDate(event: Event, locale: string = 'en-US'): string {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: event.timezone
    };
    
    return event.startDateTime.toLocaleDateString(locale, options);
  }

  /**
   * Get time until event
   */
  public static getTimeUntilEvent(event: Event): string {
    const now = new Date();
    const timeDiff = event.startDateTime.getTime() - now.getTime();
    
    if (timeDiff <= 0) {
      return 'Event has passed';
    }
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    } else {
      return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    }
  }
}
