import React, { useState, useEffect } from 'react';
import { Event, CategorizedEvents } from '../types/event';
import { EventService } from '../services/eventService';
import { EventSection } from './EventSection';
import { DateUtils } from '../utils/dateUtils';

interface EventTimelineProps {
  events?: Event[];
  showFilters?: boolean;
  maxUpcomingEvents?: number;
  maxPastEvents?: number;
  compact?: boolean;
  autoUpdate?: boolean;
}

export const EventTimeline: React.FC<EventTimelineProps> = ({
  events = [],
  showFilters = true,
  maxUpcomingEvents,
  maxPastEvents,
  compact = false,
  autoUpdate = true
}) => {
  const [categorizedEvents, setCategorizedEvents] = useState<CategorizedEvents>({
    upcoming: [],
    past: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initialize event service and load events
  useEffect(() => {
    const eventService = EventService.getInstance();
    
    // Add events to service if provided
    if (events.length > 0) {
      events.forEach(event => eventService.addEvent(event));
    }

    // Get categorized events
    const categorized = eventService.getCategorizedEvents();
    
    // Debug logging
    console.log('EventTimeline - Categorized Events:', {
      upcoming: categorized.upcoming.length,
      past: categorized.past.length,
      upcomingEvents: categorized.upcoming.map(e => ({ title: e.title, startDateTime: e.startDateTime.toISOString() })),
      pastEvents: categorized.past.map(e => ({ title: e.title, startDateTime: e.startDateTime.toISOString() }))
    });
    
    setCategorizedEvents(categorized);
    setIsLoading(false);
    setLastUpdate(new Date());

    // Set up auto-update if enabled
    if (autoUpdate) {
      const updateInterval = setInterval(() => {
        const updatedCategorized = eventService.getCategorizedEvents();
        setCategorizedEvents(updatedCategorized);
        setLastUpdate(new Date());
      }, 60000); // Update every minute

      return () => clearInterval(updateInterval);
    }
  }, [events, autoUpdate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading events...</span>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Event Timeline
        </h1>
        <p className="text-gray-600">
          Automatically categorized events with real-time updates
        </p>
        <div className="text-sm text-gray-500 mt-2">
          Last updated: {DateUtils.formatDate(lastUpdate, 'datetime')}
        </div>
      </div>

      {/* Upcoming Events */}
      <EventSection
        title="Upcoming Events"
        events={categorizedEvents.upcoming}
        emptyMessage="No upcoming events scheduled"
        showFilters={showFilters}
        maxEvents={maxUpcomingEvents}
        compact={compact}
      />

      {/* Past Events */}
      <EventSection
        title="Past Events"
        events={categorizedEvents.past}
        emptyMessage="No past events to display"
        showFilters={showFilters}
        maxEvents={maxPastEvents}
        compact={compact}
      />

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {categorizedEvents.upcoming.length}
            </div>
            <div className="text-sm text-gray-600">Upcoming Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {categorizedEvents.past.length}
            </div>
            <div className="text-sm text-gray-600">Past Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {categorizedEvents.upcoming.length + categorizedEvents.past.length}
            </div>
            <div className="text-sm text-gray-600">Total Events</div>
          </div>
        </div>
      </div>
    </div>
  );
};
