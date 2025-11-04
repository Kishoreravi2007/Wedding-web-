import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Clock, MapPin, Plus, Radio } from "lucide-react";
import { sreedeviSchedule } from "@/data/schedules";
import { format, parseISO, set, isPast } from "date-fns"; // Import set for time manipulation
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WishBox from "@/components/WishBox"; // Import the WishBox component
import { EventService } from "@/services/eventService";
import { ScheduleConverter } from "@/utils/scheduleConverter";
import { Event } from "@/types/event";

// Helper to get month index (0-11)
const getMonthIndex = (monthName: string): number => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthIndex = months.indexOf(monthName);
  if (monthIndex === -1) {
    console.error(`Invalid month name: ${monthName}`);
    return 0; // Default to January if month name is invalid
  }
  return monthIndex;
};

// Helper to parse time strings like "10:30 am", "12 pm", "6 pm"
const parseTime = (timeString: string, year: string, month: string, day: string): Date | null => {
  try {
    let hours: number;
    let minutes: number = 0;
    let modifier: string = '';

    const timeParts = timeString.trim().split(' ');
    const timeValue = timeParts[0]; // e.g., "10:30" or "12"

    if (timeParts.length > 1) {
      modifier = timeParts[1].toLowerCase(); // "am" or "pm"
    }

    const hourMinute = timeValue.split(':');
    hours = parseInt(hourMinute[0], 10);
    if (hourMinute.length > 1) {
      minutes = parseInt(hourMinute[1], 10);
    }

    // Adjust hours for 12-hour format
    if (modifier === "pm" && hours < 12) {
      hours += 12;
    } else if (modifier === "am" && hours === 12) {
      hours = 0; // Midnight is 0 hours in 24-hour format
    }

    const monthIndex = getMonthIndex(month);
    const date = new Date(parseInt(year, 10), monthIndex, parseInt(day, 10), hours, minutes);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error(`Failed to parse date: ${month} ${day}, ${year} ${timeString}`);
      return null;
    }
    return date;
  } catch (error) {
    console.error("Error parsing time:", timeString, error);
    return null;
  }
};

// Helper function to create Google Calendar event link
const createGoogleCalendarLink = (dayDate: string, event: any) => {
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description || '');
  const location = encodeURIComponent(event.venue);

  // Use startDateTime and endDateTime from the event object
  let startTime: Date | null = null;
  let endTime: Date | null = null;

  // Check if event has startDateTime (Date object or ISO string)
  if (event.startDateTime) {
    startTime = event.startDateTime instanceof Date ? event.startDateTime : new Date(event.startDateTime);
    endTime = event.endDateTime ? 
      (event.endDateTime instanceof Date ? event.endDateTime : new Date(event.endDateTime)) :
      new Date(startTime.getTime() + 60 * 60 * 1000); // Default to 1 hour duration
  }

  const formatDateTime = (date: Date | null) => {
    if (!date) return "";
    // Google Calendar expects format like YYYYMMDDTHHMMSS
    const yearStr = date.getFullYear().toString();
    const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = date.getDate().toString().padStart(2, '0');
    const hoursStr = date.getHours().toString().padStart(2, '0');
    const minutesStr = date.getMinutes().toString().padStart(2, '0');
    const secondsStr = date.getSeconds().toString().padStart(2, '0');
    return `${yearStr}${monthStr}${dayStr}T${hoursStr}${minutesStr}${secondsStr}`;
  };

  const formattedStartDate = formatDateTime(startTime);
  const formattedEndDate = formatDateTime(endTime);

  // Ensure we have valid start and end times before constructing the URL
  if (!formattedStartDate || !formattedEndDate) {
    console.error("Invalid event dates:", event);
    return "#"; // Return placeholder if times are invalid
  }

  // Use map link as location so it's clickable in Google Calendar
  const locationLink = event.mapLink || location;
  let url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedStartDate}/${formattedEndDate}&details=${description}&location=${encodeURIComponent(locationLink)}`;

  console.log("Generated Google Calendar URL:", url); // Log the generated URL
  return url;
};


const SisterBSchedule = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [categorizedEvents, setCategorizedEvents] = useState<{
    upcoming: Event[];
    past: Event[];
  }>({ upcoming: [], past: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Initialize EventService and load events
  useEffect(() => {
    const eventService = EventService.getInstance();
    
    // Convert and load sreedevi schedule events
    const events = ScheduleConverter.convertSreedeviSchedule();
    events.forEach(event => eventService.addEvent(event));
    
    // Get categorized events for sreedevi schedule only
    const categorized = eventService.getCategorizedEventsBySchedule('sreedevi');
    setCategorizedEvents(categorized);
    setIsLoading(false);
    
    // Set up auto-update
    const updateInterval = setInterval(() => {
      const updatedCategorized = eventService.getCategorizedEventsBySchedule('sreedevi');
      setCategorizedEvents(updatedCategorized);
    }, 60000); // Update every minute
    
    return () => clearInterval(updateInterval);
  }, []);

  const isEventPast = (event: any, dayDate: string): boolean => {
    const dateParts = dayDate.split(" ");
    const month = dateParts[0];
    const dayOfMonth = dateParts[1].replace(/(\d+)(st|nd|rd|th)/, '$1');
    const year = dateParts[2];

    const eventDateTime = parseTime(event.time, year, month, dayOfMonth);
    return eventDateTime ? isPast(eventDateTime) : false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const monthName = date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase();
    const day = date.getDate();
    const year = date.getFullYear();
    
    return `${t(dayName)}, ${t(monthName)} ${day}${getOrdinalSuffix(day)}, ${year}`;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) {
      return 'th';
    }
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  // Map event IDs to their corresponding translation keys for descriptions
  const getDescriptionKey = (eventId: string): string => {
    // Try specific event description first (e.g., "ayaniyoonu-b" -> "ayaniyoonu-bDescription")
    const specificKey = `${eventId}Description`;
    
    // Fallback mapping for common descriptions
    const fallbackMap: { [key: string]: string } = {
      "engagement-a": "engagementDescription",
      "engagement-b": "engagementDescription",
      "ayaniyoonu-a": "ayaniyoonuDescription",
      "ayaniyoonu-b": "ayaniyoonu-bDescription",
      "kaikottikali-a": "kaikottikali-aDescription",
      "kaikottikali-b": "kaikottikali-bDescription",
      "sangeeth-a": "sangeet-aDescription",
      "sangeeth-b": "sangeet-bDescription",
      "muhurtham-a": "wedding-aDescription",
      "muhurtham-b": "wedding-bDescription",
      "reception-a": "reception-aDescription",
      "reception-b": "reception-bDescription",
      "1000 thiritirikkal-b": "1000 thiritirikkal-bDescription",
      "ganapathykidal-a": "ganapathykidal-aDescription",
    };
    
    return fallbackMap[eventId] || specificKey;
  };

  // Use the new categorized events from EventService
  const upcomingEvents = categorizedEvents.upcoming;
  const pastEvents = categorizedEvents.past;

  const renderEventCard = (event: Event) => {
    const descriptionKey = getDescriptionKey(event.id);
    const translatedDescription = t(descriptionKey);
    
    return (
      <Card key={event.id} className="w-full sm:w-80 bg-[#FFFDD0]/50 border border-[#800000] rounded-lg overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105">
        <img src={event.image} alt={t(event.title)} className="w-full h-48 object-cover" />
        <CardHeader className="p-4">
          <CardTitle className="text-3xl font-semibold text-[#800000] mb-2 font-display">
            {t(event.title)}
          </CardTitle>
          <CardDescription className="text-[#800000] text-sm mb-4">
            <div dangerouslySetInnerHTML={{ __html: translatedDescription }} />
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <p className="text-[#800000] text-sm flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-[#800000]" />
            {formatDate(event.startDateTime.toISOString())}
          </p>
          <p className="text-[#800000] text-sm flex items-center justify-between">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-[#800000]" />
              {event.startDateTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })}
              {event.endDateTime && (
                <span> - {event.endDateTime.toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit',
                  hour12: true 
                })}</span>
              )}
            </span>
            <button
              onClick={() => {
                const url = createGoogleCalendarLink(event.startDateTime.toISOString(), event);
                if (url !== "#") {
                  window.open(url, '_blank', 'noopener,noreferrer');
                }
              }}
              className="ml-2 p-1 rounded-full bg-[#FFFDD0] hover:bg-[#B8860B] text-[#800000] transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
            </button>
          </p>
          {event.dresscode && (
            <p className="text-[#800000] text-sm flex items-center">👗: {t(event.dresscode)}</p>
          )}
          <p className="text-[#800000] text-sm flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-[#800000]" />
            {t(event.venue)}
          </p>
          <a href={event.mapLink} target="_blank" rel="noopener noreferrer">
            <Button className="w-full bg-[#FFFDD0] hover:bg-[#B8860B] text-[#800000] font-bold py-2 px-4 rounded transition-all duration-300">
              {t('location')}
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="text-white relative">
      {/* Watch Live Button */}
      <div className="flex justify-start px-4 mb-4">
        <Button
          onClick={() => navigate('/sreedevi/live')}
          className="bg-gradient-to-r from-[#B8860B] to-[#FFD700] hover:from-[#FFD700] hover:to-[#B8860B] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
        >
          <Radio className="w-5 h-5" />
          Watch Live
        </Button>
      </div>

      <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg shadow-lg">
        <img
          src="/sister-b-schedule-banner.jpg"
          alt={t('sisterBScheduleBanner')}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4">
          <p className="text-white text-sm md:text-base mb-2 font-sans uppercase tracking-widest">
            {t('weAreGettingMarried')}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl text-center text-white font-bold mb-4">
            {t('sreedeviAndVaishag')}
          </h1>
          <p className="text-white text-sm md:text-base mb-2 font-sans uppercase tracking-widest">
            {t('saveTheDate')}
          </p>
          <p className="text-white text-lg md:text-xl mb-6 font-serif">
            {t('january11th2026')}
          </p>
          {/* Add to my Calendar button - functionality can be added later if needed */}
        </div>
      </div>

      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto z-10">
        <h1 className="font-heading text-6xl text-center mb-12 text-[#800000] font-bold">
          {t('Schedule of Events')}
        </h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#800000]"></div>
            <span className="ml-3 text-[#800000]">Loading events...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap justify-center gap-8 pb-16">
              {upcomingEvents.map(event => renderEventCard(event))}
            </div>

            {pastEvents.length > 0 && (
              <>
                <h2 className="font-heading text-3xl text-center mb-8 sm:mb-12 text-[#800000] font-bold mt-16">
                  {t('Out of date Events')}
                </h2>
                <div className="flex flex-wrap justify-center gap-8 pb-16">
                  {pastEvents.map(event => renderEventCard(event))}
                </div>
              </>
            )}
          </>
        )}
        <WishBox recipient="sreedevi" /> {/* Add the WishBox component here */}
        </div>
      </div>
      <div className="fixed bottom-20 left-4 text-[#800000] text-sm bg-white p-2 rounded z-20">
        <a href="mailto:help.weddingweb@gmail.com" className="underline">help.weddingweb@gmail.com</a>
      </div>
    </div>
  );
};

export default SisterBSchedule;
