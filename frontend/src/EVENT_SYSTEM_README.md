# Automatic Event Categorization System

A comprehensive system that automatically categorizes and displays events on a webpage or application. The system features two distinct sections: "Upcoming Events" and "Past Events." When an event's scheduled date and time have passed, the system automatically moves the event listing from the "Upcoming Events" section to the "Past Events" section, maintaining chronological order within each section.

## Features

### 🎯 Core Functionality
- **Automatic Categorization**: Events automatically move between "Upcoming" and "Past" sections based on their scheduled time
- **Real-time Updates**: System updates every minute to ensure accurate categorization
- **Timezone Support**: Full timezone support with automatic conversion and display of local times
- **Recurring Events**: Support for daily, weekly, monthly, and yearly recurring events
- **Event Management**: Full CRUD operations for events with form validation

### 🎨 User Interface
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Event Cards**: Beautiful event cards with images, descriptions, and action buttons
- **Filtering & Sorting**: Filter by category and sort chronologically or reverse-chronologically
- **Statistics**: Display event counts and statistics
- **Time Remaining**: Shows countdown for upcoming events

### 🔧 Technical Features
- **TypeScript**: Full type safety with comprehensive interfaces
- **Singleton Pattern**: Centralized event management with EventService
- **Utility Classes**: Dedicated classes for date and timezone operations
- **React Hooks**: Modern React patterns with hooks for state management
- **Auto-cleanup**: Automatic cleanup of intervals and listeners

## Architecture

### Core Components

#### 1. Event Types (`types/event.ts`)
```typescript
interface Event {
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
```

#### 2. Event Service (`services/eventService.ts`)
- Singleton pattern for centralized event management
- Automatic categorization logic
- Recurring event handling
- Timezone-aware date operations
- Real-time updates

#### 3. Utility Classes
- **TimezoneUtils** (`utils/timezone.ts`): Timezone conversion and handling
- **DateUtils** (`utils/dateUtils.ts`): Date parsing, formatting, and comparison

#### 4. React Components
- **EventCard**: Individual event display component
- **EventSection**: Section for displaying categorized events
- **EventTimeline**: Main timeline component with both sections
- **EventManager**: Full event management interface

## Usage

### Basic Implementation

```typescript
import { EventService } from './services/eventService';
import { EventTimeline } from './components/EventTimeline';

// Initialize event service
const eventService = EventService.getInstance();

// Add events
eventService.addEvent({
  id: 'event-1',
  title: 'Wedding Ceremony',
  startDateTime: new Date('2026-01-04T09:00:00'),
  timezone: 'Asia/Kolkata',
  venue: 'Temple',
  // ... other properties
});

// Use timeline component
<EventTimeline
  events={events}
  showFilters={true}
  autoUpdate={true}
/>
```

### Event Management

```typescript
import { EventManager } from './components/EventManager';

// Full event management interface
<EventManager
  initialEvents={events}
  showEventForm={true}
  showStatistics={true}
/>
```

### Recurring Events

```typescript
const recurringEvent: Event = {
  // ... basic properties
  isRecurring: true,
  recurringPattern: {
    type: 'weekly',
    interval: 1,
    endDate: new Date('2026-12-31'),
    occurrences: 52
  }
};
```

## API Reference

### EventService

#### Methods
- `getInstance()`: Get singleton instance
- `addEvent(event: Event)`: Add or update event
- `removeEvent(eventId: string)`: Remove event
- `getAllEvents()`: Get all events
- `getCategorizedEvents()`: Get events split by status
- `getUpcomingEvents()`: Get upcoming events only
- `getPastEvents()`: Get past events only

#### Static Methods
- `parseEventDateTime(dateString: string, timeString: string, timezone: string)`: Parse date with timezone
- `formatEventDate(event: Event, locale: string)`: Format event date for display
- `getTimeUntilEvent(event: Event)`: Get time remaining until event

### DateUtils

#### Methods
- `parseDate(dateString: string, timeString: string, timezone: string)`: Parse date with timezone
- `formatDate(date: Date, format: string, locale: string)`: Format date for display
- `isToday(date: Date)`: Check if date is today
- `isTomorrow(date: Date)`: Check if date is tomorrow
- `isYesterday(date: Date)`: Check if date is yesterday
- `getRelativeTime(date: Date, locale: string)`: Get relative time string
- `isPast(date: Date)`: Check if date is in the past
- `isFuture(date: Date)`: Check if date is in the future

### TimezoneUtils

#### Methods
- `getUserTimezone()`: Get user's timezone
- `convertToTimezone(date: Date, timezone: string)`: Convert date to timezone
- `getTimezoneOffset(timezone: string)`: Get timezone offset in minutes
- `isSameTimezone(date1: Date, date2: Date)`: Check if dates are in same timezone
- `formatWithTimezone(date: Date, timezone: string, locale: string)`: Format with timezone
- `getTimezoneAbbreviation(timezone: string)`: Get timezone abbreviation
- `isValidTimezone(timezone: string)`: Check if timezone is valid
- `getAvailableTimezones()`: Get all available timezones

## Configuration

### Event Categories
- `ceremony`: Wedding ceremonies and formal events
- `celebration`: Parties and celebrations
- `reception`: Reception events
- `ritual`: Religious and cultural rituals
- `other`: Miscellaneous events

### Recurring Patterns
- `daily`: Every N days
- `weekly`: Every N weeks
- `monthly`: Every N months
- `yearly`: Every N years

### Timezone Support
The system supports all standard timezones including:
- UTC
- America/New_York
- America/Los_Angeles
- Europe/London
- Asia/Tokyo
- Asia/Kolkata
- And many more...

## Demo

To see the system in action, use the `EventDemo` component:

```typescript
import { EventDemo } from './pages/EventDemo';

<EventDemo />
```

This provides a complete demonstration of the system with sample events and interactive management interface.

## Best Practices

### Event Creation
1. Always specify timezone when creating events
2. Use descriptive titles and categories
3. Include venue and location information
4. Set appropriate dress codes
5. Use high-quality images

### Performance
1. The system automatically updates every minute
2. Use `maxEvents` prop to limit displayed events
3. Implement pagination for large event lists
4. Clean up intervals when components unmount

### Timezone Handling
1. Always specify timezone when creating events
2. Use user's local timezone as default
3. Display timezone information to users
4. Handle timezone changes gracefully

## Troubleshooting

### Common Issues

1. **Events not categorizing correctly**
   - Check timezone settings
   - Verify date format
   - Ensure system time is correct

2. **Recurring events not working**
   - Verify recurring pattern configuration
   - Check end date and occurrence limits
   - Ensure proper timezone handling

3. **Performance issues**
   - Limit number of events displayed
   - Use pagination for large lists
   - Check for memory leaks in intervals

### Debug Mode
Enable debug logging by setting:
```typescript
localStorage.setItem('eventSystemDebug', 'true');
```

## Future Enhancements

- [ ] Event notifications and reminders
- [ ] Calendar integration
- [ ] Event sharing and collaboration
- [ ] Advanced filtering options
- [ ] Event templates
- [ ] Bulk operations
- [ ] Export functionality
- [ ] Mobile app integration

## License

This system is part of the Wedding Web Application and follows the same licensing terms.
