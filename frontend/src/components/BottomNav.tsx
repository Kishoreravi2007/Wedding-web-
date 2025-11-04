import { NavLink } from "react-router-dom";
import { CalendarDays, Camera, Image, Video, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface BottomNavProps {
  basePath: string;
  activeColor: string;
}

const BottomNav = ({ basePath, activeColor }: BottomNavProps) => {
  const { t } = useTranslation();
  const navItems = [
    { to: "/schedule", icon: CalendarDays, label: t('schedule') },
    { to: "/photobooth", icon: Camera, label: t('photoBooth') },
    { to: "/gallery", icon: Image, label: t('gallery') },
    { to: "/engagement-video", icon: Video, label: t('video') },
    { to: "/live", icon: Radio, label: "Watch Live" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 shadow-2xl block sm:block">
      <div className="flex justify-around max-w-md mx-auto py-2">
        {navItems.map((item, index) => (
          <NavLink
            key={item.to}
            to={`${basePath}${item.to}`}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full pt-3 pb-2 px-2 rounded-xl transition-all duration-300 group",
                isActive
                  ? `bg-gradient-to-t from-[${activeColor}]/10 to-transparent scale-105 shadow-lg`
                  : "text-gray-500 hover:text-stone-700 hover:scale-105"
              )
            }
            style={({ isActive }) => (isActive ? { color: activeColor } : {})}
            end
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={cn(
                    "w-6 h-6 mb-1 transition-all duration-300 group-hover:scale-110",
                    isActive && `text-[${activeColor}]`
                  )}
                  style={isActive ? { color: activeColor } : {}}
                />
                <span className="text-xs font-medium transition-all duration-300 group-hover:scale-105 whitespace-nowrap">
                  {item.label}
                </span>
                {/* Active indicator */}
                {isActive && (
                  <div
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full animate-pulse"
                    style={{ backgroundColor: activeColor }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
