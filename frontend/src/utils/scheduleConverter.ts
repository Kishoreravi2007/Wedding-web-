import { Event } from '../types/event';
import { parvathySchedule, sreedeviSchedule } from '../data/schedules';
import { DateUtils } from './dateUtils';

/**
 * Convert existing schedule data to new Event format
 */
export class ScheduleConverter {
  /**
   * Convert parvathy schedule to Event format
   */
  public static convertParvathySchedule(): Event[] {
    const events: Event[] = [];
    
    parvathySchedule.forEach(day => {
      day.events.forEach(event => {
        const startDateTime = this.parseEventDateTime(day.date, event.time, 'Asia/Kolkata');
        const endDateTime = this.parseEndDateTime(day.date, event.time, 'Asia/Kolkata');
        
        const newEvent: Event = {
          id: event.id,
          title: event.title,
          description: event.description,
          startDateTime,
          endDateTime,
          timezone: 'Asia/Kolkata',
          venue: event.venue,
          locationUrl: event.locationUrl || '',
          mapLink: event.mapLink || event.locationUrl || '',
          dresscode: event.dresscode,
          image: event.image,
          category: this.mapCategory(event.title),
          status: 'upcoming', // Will be automatically updated by EventService
          isRecurring: false,
          lastModified: new Date(),
          created: new Date()
        };
        
        events.push(newEvent);
      });
    });
    
    return events;
  }

  /**
   * Convert sreedevi schedule to Event format
   */
  public static convertSreedeviSchedule(): Event[] {
    const events: Event[] = [];
    
    sreedeviSchedule.forEach(day => {
      day.events.forEach(event => {
        const startDateTime = this.parseEventDateTime(day.date, event.time, 'Asia/Kolkata');
        const endDateTime = this.parseEndDateTime(day.date, event.time, 'Asia/Kolkata');
        
        const newEvent: Event = {
          id: event.id,
          title: event.title,
          description: event.description,
          startDateTime,
          endDateTime,
          timezone: 'Asia/Kolkata',
          venue: event.venue,
          locationUrl: event.locationUrl || '',
          mapLink: event.mapLink || event.locationUrl || '',
          dresscode: event.dresscode,
          image: event.image,
          category: this.mapCategory(event.title),
          status: 'upcoming', // Will be automatically updated by EventService
          isRecurring: false,
          lastModified: new Date(),
          created: new Date()
        };
        
        events.push(newEvent);
      });
    });
    
    return events;
  }

  /**
   * Parse event date and time to create a Date object
   */
  private static parseEventDateTime(dateString: string, timeString: string, timezone: string): Date {
    // Handle different date formats
    let parsedDate: Date;
    
    if (dateString.includes(',')) {
      // Format: "October 19, 2025"
      parsedDate = new Date(dateString);
    } else {
      // Format: "January 3, 2026"
      parsedDate = new Date(dateString);
    }

    // Parse time string
    let startTimeStr = timeString;
    if (timeString.includes('to')) {
      startTimeStr = timeString.split('to')[0].trim();
    }

    // Extract time and AM/PM
    let time = startTimeStr;
    let ampm = '';

    if (time.toLowerCase().includes('pm')) {
      ampm = 'PM';
      time = time.toLowerCase().replace('pm', '');
    } else if (time.toLowerCase().includes('am')) {
      ampm = 'AM';
      time = time.toLowerCase().replace('am', '');
    } else {
      const timeParts = startTimeStr.split(' ');
      if (timeParts.length > 1) {
        time = timeParts[0];
        ampm = timeParts[1];
      }
    }

    // Normalize ampm
    if (ampm) {
      ampm = ampm.toUpperCase();
    }

    // Parse hours and minutes
    const [hours, minutes] = time.split(':').map(Number);
    let finalHours = hours;
    let finalMinutes = isNaN(minutes) ? 0 : minutes;

    // Convert to 24-hour format
    if (ampm === 'PM' && finalHours < 12) {
      finalHours += 12;
    }
    if (ampm === 'AM' && finalHours === 12) {
      finalHours = 0;
    }

    // Create final date
    const eventDate = new Date(parsedDate);
    eventDate.setHours(finalHours, finalMinutes, 0, 0);

    return eventDate;
  }

  /**
   * Parse end date time for events with duration
   */
  private static parseEndDateTime(dateString: string, timeString: string, timezone: string): Date | undefined {
    if (!timeString.includes('to')) {
      return undefined; // No end time specified
    }

    const endTimeStr = timeString.split('to')[1].trim();
    const startDateTime = this.parseEventDateTime(dateString, timeString, timezone);
    
    // Parse end time
    let time = endTimeStr;
    let ampm = '';

    if (time.toLowerCase().includes('pm')) {
      ampm = 'PM';
      time = time.toLowerCase().replace('pm', '');
    } else if (time.toLowerCase().includes('am')) {
      ampm = 'AM';
      time = time.toLowerCase().replace('am', '');
    } else {
      const timeParts = endTimeStr.split(' ');
      if (timeParts.length > 1) {
        time = timeParts[0];
        ampm = timeParts[1];
      }
    }

    if (ampm) {
      ampm = ampm.toUpperCase();
    }

    const [hours, minutes] = time.split(':').map(Number);
    let finalHours = hours;
    let finalMinutes = isNaN(minutes) ? 0 : minutes;

    if (ampm === 'PM' && finalHours < 12) {
      finalHours += 12;
    }
    if (ampm === 'AM' && finalHours === 12) {
      finalHours = 0;
    }

    const endDate = new Date(startDateTime);
    endDate.setHours(finalHours, finalMinutes, 0, 0);

    return endDate;
  }

  /**
   * Map event title to category
   */
  private static mapCategory(title: string): 'ceremony' | 'celebration' | 'reception' | 'ritual' | 'other' {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('wedding') || titleLower.includes('engagement')) {
      return 'ceremony';
    } else if (titleLower.includes('reception')) {
      return 'reception';
    } else if (titleLower.includes('sangeet') || titleLower.includes('celebration')) {
      return 'celebration';
    } else if (titleLower.includes('ganapathy') || titleLower.includes('ritual') || titleLower.includes('kaikottikali') || titleLower.includes('thirittirikkal')) {
      return 'ritual';
    } else {
      return 'other';
    }
  }
}
