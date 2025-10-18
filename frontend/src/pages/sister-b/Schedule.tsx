import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Home, Clock, MapPin, Plus } from "lucide-react";
import { sreedeviSchedule } from "@/data/schedules";
import { format, parseISO, set } from "date-fns"; // Import set for time manipulation
import React from "react";
import { useTranslation } from "react-i18next";
import WishBox from "@/components/WishBox"; // Import the WishBox component

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
  const description = encodeURIComponent(event.description);
  const location = encodeURIComponent(event.venue);

  const dateParts = dayDate.split(" ");
  const month = dateParts[0];
  const dayOfMonth = dateParts[1].replace(/(\d+)(st|nd|rd|th)/, '$1');
  const year = dateParts[2];

  let startTime: Date | null = null;
  let endTime: Date | null = null;

  if (event.time.includes(" to ")) {
    const [timeRangeStart, timeRangeEnd] = event.time.split(" to ");
    startTime = parseTime(timeRangeStart, year, month, dayOfMonth);
    endTime = parseTime(timeRangeEnd, year, month, dayOfMonth);
  } else {
    startTime = parseTime(event.time, year, month, dayOfMonth);
    if (startTime) {
      // If no end time is specified, assume a 1-hour duration
      endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);
    }
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
    return "#"; // Return placeholder if times are invalid
  }

  let url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formattedStartDate}/${formattedEndDate}&details=${description}&location=${location}`;

  console.log("Generated Google Calendar URL:", url); // Log the generated URL
  return url;
};


const SisterBSchedule = () => {
  const { t } = useTranslation();

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
  const descriptionKeyMapById: { [key: string]: string } = {
    "engagement-a": "engagementDescription",
    "ayaniyoonu-a": "ayaniyoonuDescription",
    "kaikottikali-a": "thiruvathirakaliDescription",
    "sangeeth-a": "sangeethDescription",
    "muhurtham-a": "muhurthamDescription",
    "reception-a": "receptionDescription",
    "ayaniyoonu-b": "ayaniyoonuDescription",
    "kaikottikali-b": "thiruvathirakaliDescription",
    "1000 thiritirikkal-b": "thirittirikkalDescription",
    "sangeeth-b": "sangeethDescription",
    "muhurtham-b": "muhurthamDescription",
    "reception-b": "receptionDescription",
  };

  return (
    <div className="text-white py-12 px-4 sm:px-6 lg:px-8 relative">

      <div className="relative w-full h-64 mb-8 overflow-hidden rounded-lg shadow-lg">
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

      <div className="max-w-7xl mx-auto z-10">
        <h1 className="font-heading text-6xl text-center mb-12 text-[#800000] font-bold">
          {t('Schedule of Events')}
        </h1>

        <div className="flex flex-wrap justify-center gap-8 pb-16">
          {sreedeviSchedule.map((day) => (
            <React.Fragment key={day.date}>
              {day.events.map((event) => (
                <Card key={event.id} className="w-full sm:w-80 bg-[#FFFDD0]/50 border border-[#800000] rounded-lg overflow-hidden shadow-lg transform transition-all duration-500 hover:scale-105">
                  <img src={event.image} alt={t(event.title)} className="w-full h-48 object-cover" />
                  <CardHeader className="p-4">
                    <CardTitle className="text-3xl font-semibold text-[#800000] mb-2 font-display">
                      {t(event.title)}
                    </CardTitle>
                    <CardDescription className="text-[#800000] text-sm mb-4">
                      <div dangerouslySetInnerHTML={{ __html: t(event.id + 'Description') }} />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-3">
                    <p className="text-[#800000] text-sm flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-[#800000]" />
                      {formatDate(day.date)}
                    </p>
                    <p className="text-[#800000] text-sm flex items-center justify-between">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-[#800000]" />
                        {event.time}
                      </span>
                      <button
                        onClick={() => {
                          const url = createGoogleCalendarLink(day.date, event);
                          if (url !== "#") {
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="ml-2 p-1 rounded-full bg-[#FFFDD0] hover:bg-[#B8860B] text-[#800000] transition-all duration-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </p>
{event.dresscode ? (
  <p className="text-[#800000] text-sm flex items-center">👗: {t(event.dresscode)}</p>
) : null}
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
              ))}
            </React.Fragment>
          ))}
        </div>
        <WishBox recipient="sreedevi" /> {/* Add the WishBox component here */}
      </div>
      <div className="fixed bottom-20 left-4 text-[#800000] text-sm bg-white p-2 rounded z-20">
        <a href="mailto:help.weddingweb@gmail.com" className="underline">help.weddingweb@gmail.com</a>
      </div>
    </div>
  );
};

export default SisterBSchedule;
