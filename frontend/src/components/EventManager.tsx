import React, { useState, useEffect } from 'react';
import { Event, RecurringPattern } from '../types/event';
import { EventService } from '../services/eventService';
import { EventTimeline } from './EventTimeline';
import { DateUtils } from '../utils/dateUtils';
import { TimezoneUtils } from '../utils/timezone';

interface EventManagerProps {
  initialEvents?: Event[];
  showEventForm?: boolean;
  showStatistics?: boolean;
}

export const EventManager: React.FC<EventManagerProps> = ({
  initialEvents = [],
  showEventForm = true,
  showStatistics = true
}) => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: TimezoneUtils.getUserTimezone(),
    venue: '',
    locationUrl: '',
    mapLink: '',
    dresscode: '',
    image: '',
    category: 'ceremony' as const,
    isRecurring: false,
    recurringType: 'weekly' as const,
    recurringInterval: 1,
    recurringEndDate: '',
    recurringOccurrences: ''
  });

  const eventService = EventService.getInstance();

  // Load initial events
  useEffect(() => {
    if (initialEvents.length > 0) {
      initialEvents.forEach(event => eventService.addEvent(event));
      setEvents(eventService.getAllEvents());
    }
  }, [initialEvents]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = DateUtils.parseDate(formData.startDate, formData.startTime, formData.timezone);
    const endDateTime = formData.endDate && formData.endTime 
      ? DateUtils.parseDate(formData.endDate, formData.endTime, formData.timezone)
      : undefined;

    const recurringPattern: RecurringPattern | undefined = formData.isRecurring ? {
      type: formData.recurringType,
      interval: formData.recurringInterval,
      endDate: formData.recurringEndDate ? new Date(formData.recurringEndDate) : undefined,
      occurrences: formData.recurringOccurrences ? parseInt(formData.recurringOccurrences) : undefined
    } : undefined;

    const event: Event = {
      id: editingEvent?.id || `event-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      startDateTime,
      endDateTime,
      timezone: formData.timezone,
      venue: formData.venue,
      locationUrl: formData.locationUrl,
      mapLink: formData.mapLink,
      dresscode: formData.dresscode,
      image: formData.image,
      category: formData.category,
      status: 'upcoming',
      isRecurring: formData.isRecurring,
      recurringPattern,
      lastModified: new Date(),
      created: editingEvent?.created || new Date()
    };

    eventService.addEvent(event);
    setEvents(eventService.getAllEvents());
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: '',
      timezone: TimezoneUtils.getUserTimezone(),
      venue: '',
      locationUrl: '',
      mapLink: '',
      dresscode: '',
      image: '',
      category: 'ceremony',
      isRecurring: false,
      recurringType: 'weekly',
      recurringInterval: 1,
      recurringEndDate: '',
      recurringOccurrences: ''
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      startDate: DateUtils.formatDate(event.startDateTime, 'short'),
      startTime: DateUtils.formatDate(event.startDateTime, 'time'),
      endDate: event.endDateTime ? DateUtils.formatDate(event.endDateTime, 'short') : '',
      endTime: event.endDateTime ? DateUtils.formatDate(event.endDateTime, 'time') : '',
      timezone: event.timezone,
      venue: event.venue,
      locationUrl: event.locationUrl,
      mapLink: event.mapLink,
      dresscode: event.dresscode || '',
      image: event.image,
      category: event.category,
      isRecurring: event.isRecurring,
      recurringType: event.recurringPattern?.type || 'weekly',
      recurringInterval: event.recurringPattern?.interval || 1,
      recurringEndDate: event.recurringPattern?.endDate ? DateUtils.formatDate(event.recurringPattern.endDate, 'short') : '',
      recurringOccurrences: event.recurringPattern?.occurrences?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      eventService.removeEvent(eventId);
      setEvents(eventService.getAllEvents());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Manager</h1>
          <p className="text-gray-600 mt-2">Manage and categorize your events automatically</p>
        </div>
        {showEventForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Event
          </button>
        )}
      </div>

      {/* Event Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ceremony">Ceremony</option>
                    <option value="celebration">Celebration</option>
                    <option value="reception">Reception</option>
                    <option value="ritual">Ritual</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timezone *
                </label>
                <select
                  value={formData.timezone}
                  onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {TimezoneUtils.getAvailableTimezones().map(tz => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>

              {/* Venue and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dress Code
                  </label>
                  <input
                    type="text"
                    value={formData.dresscode}
                    onChange={(e) => setFormData({...formData, dresscode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location URL
                  </label>
                  <input
                    type="url"
                    value={formData.locationUrl}
                    onChange={(e) => setFormData({...formData, locationUrl: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Map Link
                  </label>
                  <input
                    type="url"
                    value={formData.mapLink}
                    onChange={(e) => setFormData({...formData, mapLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Recurring Event Options */}
              <div className="border-t pt-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({...formData, isRecurring: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                    This is a recurring event
                  </label>
                </div>

                {formData.isRecurring && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recurring Type
                      </label>
                      <select
                        value={formData.recurringType}
                        onChange={(e) => setFormData({...formData, recurringType: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interval
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurringInterval}
                        onChange={(e) => setFormData({...formData, recurringInterval: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.recurringEndDate}
                        onChange={(e) => setFormData({...formData, recurringEndDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Occurrences
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.recurringOccurrences}
                        onChange={(e) => setFormData({...formData, recurringOccurrences: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Timeline */}
      <EventTimeline
        events={events}
        showFilters={true}
        maxUpcomingEvents={10}
        maxPastEvents={20}
        compact={false}
        autoUpdate={true}
      />
    </div>
  );
};
