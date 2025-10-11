import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, ArrowLeft } from "lucide-react";
import { parvathySchedule, sreedeviSchedule } from "@/data/schedules";
import NotFound from "./NotFound";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface Event {
  id: string;
  title: string;
  time: string;
  venue: string;
  locationUrl: string;
  image?: string;
}

interface EventInvitationProps {
  sister: 'a' | 'b';
}

const EventInvitation = ({ sister }: EventInvitationProps) => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const scheduleData = sister === 'a' ? parvathySchedule : sreedeviSchedule;
  const colors = sister === 'a' 
    ? { primary: '#8C3B3B', accent: '#D4AF37', bg: 'bg-white/50' }
    : { primary: '#1B5E20', accent: '#B8860B', bg: 'bg-white/50' };
  const { t } = useTranslation();

  let event: Event | undefined;
  let eventDate: string | undefined;

  for (const day of scheduleData) {
    const foundEvent = day.events.find(e => e.id === eventId);
    if (foundEvent) {
      event = foundEvent as Event;
      eventDate = day.date;
      break;
    }
  }

  if (!event) {
    return <NotFound />;
  }

  const hasBackgroundImage = event.image && event.image !== '/placeholder.svg';
  const backgroundImage = hasBackgroundImage ? `url(${event.image})` : 'none';

  const cardStyle = hasBackgroundImage ? {
    backgroundImage: backgroundImage,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {
    borderColor: colors.accent,
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-stone-50 to-stone-100">
      <Card
        className={cn(
          "w-full max-w-md mx-auto shadow-2xl border-2 relative overflow-hidden cursor-hover animate-bounce-in",
          !hasBackgroundImage && `${colors.bg} backdrop-blur-sm`
        )}
        style={cardStyle}
      >
        {hasBackgroundImage && <div className="absolute inset-0 bg-black/40 z-0" />}
        <div className="relative z-10">
          <CardHeader className="text-center pt-8 pb-4">
            <p className={cn("text-lg font-medium animate-fade-in", hasBackgroundImage ? "text-gray-200" : "")} style={{ color: !hasBackgroundImage ? colors.primary : undefined }}>
              {t('You are cordially invited to the')}
            </p>
            <CardTitle className={cn("font-heading text-5xl mt-2 animate-fade-in", hasBackgroundImage ? "text-white" : "")} style={{ color: !hasBackgroundImage ? colors.primary : undefined, animationDelay: '0.2s' }}>
              {t(event.title)}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6 pb-8">
            <div className={cn("text-2xl font-semibold animate-fade-in", hasBackgroundImage ? "text-white" : "")} style={{ color: !hasBackgroundImage ? colors.primary : undefined, animationDelay: '0.4s' }}>
              {eventDate}
            </div>
            <div className={cn("space-y-4 text-lg animate-fade-in", hasBackgroundImage ? "text-white" : "text-gray-700")} style={{animationDelay: '0.6s'}}>
              <div className="flex items-center justify-center group">
                <Clock className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" style={{ color: colors.accent }} />
                <span className="font-medium">{event.time}</span>
              </div>
              <div className="flex items-center justify-center group">
                <MapPin className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" style={{ color: colors.accent }} />
                <span className="font-medium">{t(event.venue)}</span>
              </div>
              <div className="flex items-center justify-center group">
                <a
                  href={event.locationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "bg-white/80 text-stone-800 px-4 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105",
                    hasBackgroundImage ? "bg-white/20 text-white hover:bg-white/30" : ""
                  )}
                >
                  Location
                </a>
              </div>
            </div>
            <div className="pt-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className={cn(
                  "font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg",
                  hasBackgroundImage
                    ? "text-white hover:bg-white/20 border-white/30 border"
                    : "text-stone-700 hover:bg-stone-100"
                )}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('Back to Schedule')}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default EventInvitation;
