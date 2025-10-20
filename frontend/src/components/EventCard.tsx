import React from 'react';
import { Event } from '../types/event';
import { EventService } from '../services/eventService';
import { DateUtils } from '../utils/dateUtils';
import { TimezoneUtils } from '../utils/timezone';

interface EventCardProps {
  event: Event;
  showTimeRemaining?: boolean;
  showTimezone?: boolean;
  compact?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showTimeRemaining = true,
  showTimezone = true,
  compact = false
}) => {
  const isUpcoming = event.status === 'upcoming';
  const timeRemaining = showTimeRemaining && isUpcoming 
    ? EventService.getTimeUntilEvent(event) 
    : null;

  const formattedDate = EventService.formatEventDate(event);
  const relativeTime = DateUtils.getRelativeTime(event.startDateTime);

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg ${
      compact ? 'p-4' : 'p-6'
    }`}>
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isUpcoming 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
        </div>
        {event.isRecurring && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              Recurring
            </span>
          </div>
        )}
      </div>

      {/* Event Content */}
      <div className={compact ? 'p-4' : 'p-6'}>
        {/* Event Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {event.title}
        </h3>

        {/* Event Description */}
        {!compact && (
          <p className="text-gray-600 mb-4 line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date and Time */}
          <div className="flex items-center text-gray-700">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">{formattedDate}</span>
            {showTimezone && (
              <span className="ml-2 text-sm text-gray-500">
                ({TimezoneUtils.getTimezoneAbbreviation(event.timezone)})
              </span>
            )}
          </div>

          {/* Venue */}
          <div className="flex items-center text-gray-700">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{event.venue}</span>
          </div>

          {/* Dress Code */}
          {event.dresscode && (
            <div className="flex items-center text-gray-700">
              <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span>Dress Code: {event.dresscode}</span>
            </div>
          )}

          {/* Category */}
          <div className="flex items-center text-gray-700">
            <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="capitalize">{event.category}</span>
          </div>
        </div>

        {/* Time Remaining */}
        {timeRemaining && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-blue-800 font-medium">{timeRemaining}</span>
            </div>
          </div>
        )}

        {/* Relative Time */}
        <div className="text-sm text-gray-500 mb-4">
          {isUpcoming ? `Starts ${relativeTime}` : `Ended ${relativeTime}`}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <a
            href={event.locationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition-colors"
          >
            View Location
          </a>
          <a
            href={event.mapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-center font-medium hover:bg-gray-700 transition-colors"
          >
            Open Maps
          </a>
        </div>
      </div>
    </div>
  );
};
