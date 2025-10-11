import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Clock, MapPin, Plus } from "lucide-react";
import { parvathySchedule } from "@/data/schedules";
import { format } from "date-fns";
import React from "react";
import { useTranslation } from "react-i18next";
import WishBox from "@/components/WishBox"; // Import the WishBox component

const SisterASchedule = () => {
  const { t } = useTranslation();

  const handleAddToCalendar = (event: any, day: any) => {
    const eventDate = format(new Date(day.date), 'yyyyMMdd');

    // New time parsing logic
    let timeString = event.time;
    let startTimeStr;

    if (timeString.includes('to')) {
        startTimeStr = timeString.split('to')[0].trim();
    } else {
        startTimeStr = timeString;
    }

    const timeParts = startTimeStr.split(' ');
    let time = timeParts[0];
    let ampm = timeParts[1]; // This might be undefined if the format is "6pm"

    // Check if ampm is attached to the time, e.g., "10pm"
    if (!ampm) {
        if (time.toLowerCase().includes('pm')) {
            ampm = 'PM';
            time = time.toLowerCase().replace('pm', '');
        } else if (time.toLowerCase().includes('am')) {
            ampm = 'AM';
            time = time.toLowerCase().replace('am', '');
        }
    }
    
    // If ampm is still not found, check the end of the original string
    if (!ampm) {
        const originalTimeLower = timeString.toLowerCase();
        if (originalTimeLower.endsWith('pm')) {
            ampm = 'PM';
        } else if (originalTimeLower.endsWith('am')) {
            ampm = 'AM';
        }
    }


    let [hours, minutes] = time.split(':').map(Number);
    if (isNaN(minutes)) {
        minutes = 0;
    }

    // Normalize ampm to uppercase
    if (ampm) {
        ampm = ampm.toUpperCase();
    }

    if (ampm === 'PM' && hours < 12) {
      hours += 12;
    }
    if (ampm === 'AM' && hours === 12) { // Midnight case (12 AM)
      hours = 0;
    }

    const startTime = `${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}00`;
    // Assuming event duration is 1 hour for simplicity, adjust as needed
    const endHours = (hours + 1) % 24;
    const endTime = `${endHours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}00`;

    const googleCalendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t(event.title))}&dates=${eventDate}T${startTime}/${eventDate}T${endTime}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}&sf=true&output=xml`;
    console.log("Google Calendar URL:", googleCalendarUrl);
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <div className="text-white py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="max-w-7xl mx-auto z-10">
        <h1 className="font-heading text-6xl text-center mb-12 text-[#800000] font-bold">
          {t('Schedule of Events')}
        </h1>

        <div className="flex flex-wrap justify-center gap-8 pb-16">
          {parvathySchedule.map((day) => (
            <React.Fragment key={day.date}>
              {day.events.map((event) => (
                <Card key={event.id} className="w-full sm:w-80 bg-[#FFFDD0]/50 border border-[#800000] rounded-lg overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105">
                  <img src={event.image} alt={t(event.title)} className="w-full h-48 object-cover" />
                  <CardHeader className="p-4">
                    <CardTitle className="text-3xl font-semibold text-[#800000] mb-2 font-display">
                      {t(event.title)}
                    </CardTitle>
                    <CardDescription className="text-[#800000] text-sm mb-4">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <p className="text-[#800000] text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#800000]" />
                      {format(new Date(day.date), 'EEEE, MMMM do, yyyy')}
                    </p>
                    <p className="text-[#800000] text-sm flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#800000]" />
                        {event.time}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAddToCalendar(event, day)}
                        className="text-[#800000] hover:bg-[#800000]/10"
                        title={t('addToGoogleCalendar')}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </p>
                    {event.dresscode && (
                      <p className="text-[#800000] text-sm flex items-center">
                        <span className="mr-2 text-lg">👗</span>
                        {event.dresscode}
                      </p>
                    )}
                    <p className="text-[#800000] text-sm flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-[#800000]" />
                      {event.venue}
                    </p>
                    <a href={event.mapLink} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-[#FFFDD0] hover:bg-[#B8860B] text-[#800000] font-bold py-2 px-4 rounded transition-all duration-300">
                        {t('location')}
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </React.Fragment>
          ))}
        </div>
        <WishBox recipient="parvathy" /> {/* Add the WishBox component here */}
      </div>
    </div>
  );
};

export default SisterASchedule;
