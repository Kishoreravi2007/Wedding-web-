import React, { useState, useEffect } from 'react';
import { Event, CategorizedEvents } from '../types/event';
import { EventService } from '../services/eventService';
import { EventCard } from './EventCard';

interface EventSectionProps {
  title: string;
  events: Event[];
  emptyMessage?: string;
  showFilters?: boolean;
  maxEvents?: number;
  compact?: boolean;
}

export const EventSection: React.FC<EventSectionProps> = ({
  title,
  events,
  emptyMessage = 'No events found',
  showFilters = false,
  maxEvents,
  compact = false
}) => {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(events);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'chronological' | 'reverse-chronological'>('chronological');

  // Get unique categories
  const categories = Array.from(new Set(events.map(event => event.category)));

  useEffect(() => {
    let filtered = [...events];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'chronological') {
        return a.startDateTime.getTime() - b.startDateTime.getTime();
      } else {
        return b.startDateTime.getTime() - a.startDateTime.getTime();
      }
    });

    // Apply max events limit
    if (maxEvents && maxEvents > 0) {
      filtered = filtered.slice(0, maxEvents);
    }

    setFilteredEvents(filtered);
  }, [events, categoryFilter, sortOrder, maxEvents]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
          {title}
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''})
          </span>
        </h2>

        {/* Filters */}
        {showFilters && (
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'chronological' | 'reverse-chronological')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="chronological">Chronological</option>
              <option value="reverse-chronological">Reverse Chronological</option>
            </select>
          </div>
        )}
      </div>

      {/* Events Grid */}
      <div className={`grid gap-6 ${
        compact 
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-1 md:grid-cols-2'
      }`}>
        {filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            compact={compact}
            showTimeRemaining={true}
            showTimezone={true}
          />
        ))}
      </div>

      {/* Show More Button */}
      {maxEvents && events.length > maxEvents && (
        <div className="text-center">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Show More Events
          </button>
        </div>
      )}
    </div>
  );
};
