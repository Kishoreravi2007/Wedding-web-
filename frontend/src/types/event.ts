export interface Event {
  id: string;
  title: string;
  description: string;
  startDateTime: Date;
  endDateTime?: Date;
  timezone: string;
  venue: string;
  locationUrl: string;
  mapLink: string;
  dresscode?: string;
  image: string;
  category: 'ceremony' | 'celebration' | 'reception' | 'ritual' | 'other';
  status: 'upcoming' | 'past' | 'cancelled';
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  lastModified: Date;
  created: Date;
}

export interface RecurringPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // Every N days/weeks/months/years
  endDate?: Date;
  daysOfWeek?: number[]; // 0-6 (Sunday-Saturday) for weekly patterns
  dayOfMonth?: number; // For monthly patterns
  occurrences?: number; // Maximum number of occurrences
}

export interface EventSchedule {
  date: string;
  events: Event[];
}

export interface CategorizedEvents {
  upcoming: Event[];
  past: Event[];
}

export interface EventFilters {
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  status?: 'upcoming' | 'past' | 'all';
}

export interface EventDisplayProps {
  events: Event[];
  showFilters?: boolean;
  showCategories?: boolean;
  maxEvents?: number;
  sortOrder?: 'chronological' | 'reverse-chronological';
}
