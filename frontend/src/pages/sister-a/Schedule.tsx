import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Clock, MapPin, Plus, Radio } from "lucide-react";
import { parvathySchedule } from "@/data/schedules";
import { format, parse, isPast } from "date-fns";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WishBox from "@/components/WishBox"; // Import the WishBox component
import { EventService } from "@/services/eventService";
import { ScheduleConverter } from "@/utils/scheduleConverter";
import { Event } from "@/types/event";

const SisterASchedule = () => {
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
    
    // Convert and load parvathy schedule events
    const events = ScheduleConverter.convertParvathySchedule();
    events.forEach(event => eventService.addEvent(event));
    
    // Get categorized events for parvathy schedule only
    const categorized = eventService.getCategorizedEventsBySchedule('parvathy');
    setCategorizedEvents(categorized);
    setIsLoading(false);
    
    // Set up auto-update
    const updateInterval = setInterval(() => {
      const updatedCategorized = eventService.getCategorizedEventsBySchedule('parvathy');
      setCategorizedEvents(updatedCategorized);
    }, 60000); // Update every minute
    
    return () => clearInterval(updateInterval);
  }, []);

  const parseEventDateTime = (dateString: string, timeString: string): Date => {
    let startTimeStr;
    if (timeString.includes('to')) {
      startTimeStr = timeString.split('to')[0].trim();
    } else {
      startTimeStr = timeString;
    }

    let time = startTimeStr;
    let ampm = '';

    // Check if ampm is attached to the time, e.g., "10pm"
    if (time.toLowerCase().includes('pm')) {
      ampm = 'PM';
      time = time.toLowerCase().replace('pm', '');
    } else if (time.toLowerCase().includes('am')) {
      ampm = 'AM';
      time = time.toLowerCase().replace('am', '');
    } else {
      // If ampm is not attached, try to find it as a separate part
      const timeParts = startTimeStr.split(' ');
      if (timeParts.length > 1) {
        time = timeParts[0];
        ampm = timeParts[1];
      }
    }

    // Normalize ampm to uppercase
    if (ampm) {
      ampm = ampm.toUpperCase();
    }

    // Construct a parsable string for date-fns
    const dateTimeString = `${dateString} ${time} ${ampm}`;
    // Use a format string that matches the constructed string
    // Example: "October 19, 2025 10:00 AM" -> "MMMM d, yyyy h:mm a"
    // Example: "January 3, 2026 8:00 PM" -> "MMMM d, yyyy h:mm a"
    // Example: "January 3, 2026 6 PM" -> "MMMM d, yyyy h a"
    let formatString = "MMMM d, yyyy";
    if (time.includes(':')) {
      formatString += " h:mm";
    } else {
      formatString += " h";
    }
    if (ampm) {
      formatString += " a";
    }

    return parse(dateTimeString, formatString, new Date());
  };

  const isEventPast = (event: any, dayDate: string): boolean => {
    const eventDateTime = parseEventDateTime(dayDate, event.time);
    return isPast(eventDateTime);
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

  const handleAddToCalendar = (event: any, day: any) => {
    // Use startDateTime and endDateTime from the event object
    const startDate = event.startDateTime instanceof Date ? event.startDateTime : new Date(event.startDateTime);
    const endDate = event.endDateTime instanceof Date ? event.endDateTime : (
      event.endDateTime ? new Date(event.endDateTime) : new Date(startDate.getTime() + 60 * 60 * 1000)
    );

    // Format dates for Google Calendar (YYYYMMDDTHHMMSS)
    const formatCalendarDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}${seconds}`;
    };

    const startTime = formatCalendarDate(startDate);
    const endTime = formatCalendarDate(endDate);

    // Use map link as location so it's clickable in Google Calendar
    const location = event.mapLink || t(event.venue);
    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t(event.title))}&dates=${startTime}/${endTime}&details=${encodeURIComponent(t(event.description || ''))}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
    console.log("Google Calendar URL:", googleCalendarUrl);
    window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
  };

  // Map event IDs to their corresponding translation keys for descriptions
  const getDescriptionKey = (eventId: string): string => {
    // Try specific event description first (e.g., "ayaniyoonu-a" -> "ayaniyoonu-aDescription")
    const specificKey = `${eventId}Description`;
    
    // Fallback mapping for common descriptions
    const fallbackMap: { [key: string]: string } = {
      "engagement-a": "engagement-aDescription",
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
          <CardTitle className="text-xl font-semibold text-[#800000] mb-2 font-display">
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleAddToCalendar(event, { date: event.startDateTime.toISOString() })}
              className="text-[#800000] hover:bg-[#800000]/10"
              title={t('addToGoogleCalendar')}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </p>
          {event.dresscode && (
            <p className="text-[#800000] text-sm flex items-center">
              <span className="mr-2 text-lg">👗</span>
              {t(event.dresscode)}
            </p>
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
          onClick={() => navigate('/parvathy/live')}
          className="bg-gradient-to-r from-[#8C3B3B] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#8C3B3B] text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center gap-2 animate-pulse"
        >
          <Radio className="w-5 h-5" />
          Watch Live
        </Button>
      </div>

      <div className="relative w-full h-64 mb-4 overflow-hidden rounded-lg shadow-lg">
        <img
          src="./sister-a-schedule-banner.jpg"
          alt={t('sisterAScheduleBanner')}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center p-4">
          <p className="text-white text-sm md:text-base mb-2 font-sans uppercase tracking-widest">
            {t('weAreGettingMarried')}
          </p>
          <h1 className="font-heading text-5xl md:text-7xl text-center text-white font-bold mb-4">
            {t('sisterAAndPartner')}
          </h1>
          <p className="text-white text-sm md:text-base mb-2 font-sans uppercase tracking-widest">
            {t('saveTheDate')}
          </p>
          <p className="text-white text-lg md:text-xl mb-6 font-serif">
            {t('sisterADate')}
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
            <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pb-16">
              {upcomingEvents.map(event => renderEventCard(event))}
            </div>

            {pastEvents.length > 0 && (
              <>
                <h2 className="font-heading text-3xl text-center mb-8 sm:mb-12 text-[#800000] font-bold mt-16">
                  {t('Out of date Events')}
                </h2>
                <div className="flex flex-wrap justify-center gap-4 sm:gap-8 pb-16">
                  {pastEvents.map(event => renderEventCard(event))}
                </div>
              </>
            )}
          </>
        )}
        <WishBox recipient="parvathy" /> {/* Add the WishBox component here */}
        </div>
      </div>
    </div>
  );
};

export default SisterASchedule;
