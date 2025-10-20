import React, { useState, useEffect } from 'react';
import { Event } from '../types/event';
import { EventManager } from '../components/EventManager';
import { EventTimeline } from '../components/EventTimeline';
import { EventCategorizationTest } from '../components/EventCategorizationTest';
import { sampleEvents } from '../data/sampleEvents';
import { EventService } from '../services/eventService';

export const EventDemo: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showManager, setShowManager] = useState(false);
  const [showTest, setShowTest] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Load sample events
    setEvents(sampleEvents);
    
    // Set up auto-update to demonstrate real-time categorization
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 10000); // Update every 10 seconds for demo

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Automatic Event Categorization System
              </h1>
              <p className="text-gray-600 mt-2">
                Events are automatically categorized into "Upcoming" and "Past" sections
              </p>
              <div className="text-sm text-gray-500 mt-1">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTest(!showTest)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showTest
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {showTest ? 'Hide Test' : 'Show Test'}
              </button>
              <button
                onClick={() => setShowManager(!showManager)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  showManager
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {showManager ? 'View Timeline' : 'Manage Events'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {showTest ? (
          <EventCategorizationTest />
        ) : showManager ? (
          <EventManager
            initialEvents={events}
            showEventForm={true}
            showStatistics={true}
          />
        ) : (
          <EventTimeline
            events={events}
            showFilters={true}
            maxUpcomingEvents={10}
            maxPastEvents={20}
            compact={false}
            autoUpdate={true}
          />
        )}
      </div>

      {/* Features Section */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            System Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Automatic Categorization */}
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Automatic Categorization
              </h3>
              <p className="text-gray-600">
                Events automatically move between "Upcoming" and "Past" sections based on their scheduled time.
              </p>
            </div>

            {/* Timezone Support */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Timezone Support
              </h3>
              <p className="text-gray-600">
                Full timezone support with automatic conversion and display of local times.
              </p>
            </div>

            {/* Recurring Events */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recurring Events
              </h3>
              <p className="text-gray-600">
                Support for daily, weekly, monthly, and yearly recurring events with automatic categorization.
              </p>
            </div>

            {/* Real-time Updates */}
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Updates
              </h3>
              <p className="text-gray-600">
                Events are automatically updated every minute to ensure accurate categorization.
              </p>
            </div>

            {/* Event Management */}
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Event Management
              </h3>
              <p className="text-gray-600">
                Full CRUD operations for events with form validation and data persistence.
              </p>
            </div>

            {/* Responsive Design */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Responsive Design
              </h3>
              <p className="text-gray-600">
                Fully responsive design that works on desktop, tablet, and mobile devices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Technical Implementation
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Automatic event categorization based on current time</li>
                <li>• Timezone-aware date and time handling</li>
                <li>• Support for recurring events (daily, weekly, monthly, yearly)</li>
                <li>• Real-time updates every minute</li>
                <li>• Event filtering and sorting</li>
                <li>• Responsive design with Tailwind CSS</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Architecture</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Singleton EventService for centralized event management</li>
                <li>• TypeScript interfaces for type safety</li>
                <li>• Utility classes for date and timezone operations</li>
                <li>• React components with hooks for state management</li>
                <li>• Automatic cleanup of intervals and listeners</li>
                <li>• Modular design for easy extension</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
