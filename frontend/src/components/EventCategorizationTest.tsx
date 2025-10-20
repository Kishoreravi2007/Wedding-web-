import React, { useState, useEffect } from 'react';
import { Event } from '../types/event';
import { EventService } from '../services/eventService';
import { sampleEvents } from '../data/sampleEvents';

export const EventCategorizationTest: React.FC = () => {
  const [categorizedEvents, setCategorizedEvents] = useState<{
    upcoming: Event[];
    past: Event[];
  }>({ upcoming: [], past: [] });
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const eventService = EventService.getInstance();
    
    // Clear existing events and add sample events
    eventService.events = [];
    sampleEvents.forEach(event => eventService.addEvent(event));
    
    // Get categorized events
    const categorized = eventService.getCategorizedEvents();
    setCategorizedEvents(categorized);
    
    // Update current time every second for demo
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Event Categorization Test</h2>
      
      {/* Current Time Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Time</h3>
        <p className="text-blue-800">{currentTime.toLocaleString()}</p>
      </div>

      {/* Categorization Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Upcoming Events ({categorizedEvents.upcoming.length})
          </h3>
          {categorizedEvents.upcoming.length === 0 ? (
            <p className="text-green-700">No upcoming events</p>
          ) : (
            <div className="space-y-2">
              {categorizedEvents.upcoming.map(event => (
                <div key={event.id} className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {event.startDateTime.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Time until: {Math.round((event.startDateTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Past Events */}
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-red-900 mb-3">
            Past Events ({categorizedEvents.past.length})
          </h3>
          {categorizedEvents.past.length === 0 ? (
            <p className="text-red-700">No past events</p>
          ) : (
            <div className="space-y-2">
              {categorizedEvents.past.map(event => (
                <div key={event.id} className="bg-white p-3 rounded border">
                  <div className="font-medium text-gray-900">{event.title}</div>
                  <div className="text-sm text-gray-600">
                    {event.startDateTime.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Days ago: {Math.round((currentTime.getTime() - event.startDateTime.getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Raw Event Data */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Raw Event Data</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {sampleEvents.map(event => (
            <div key={event.id} className="bg-white p-3 rounded border text-sm">
              <div className="font-medium">{event.title}</div>
              <div className="text-gray-600">
                Start: {event.startDateTime.toLocaleString()}
              </div>
              <div className="text-gray-500">
                Status: {event.status} | 
                Is Upcoming: {event.startDateTime > currentTime ? 'Yes' : 'No'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
