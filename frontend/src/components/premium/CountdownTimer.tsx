import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string; // YYYY-MM-DD
    targetTime?: string; // HH:mm
    theme?: string;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, targetTime = '10:00', theme = 'Minimalist' }) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

    // Get theme-specific colors
    const getThemeColors = () => {
        switch (theme) {
            case 'Modern Elegance': return { container: 'bg-white/10 border-white/20', text: 'text-white', subtext: 'text-white/70' };
            case 'Classic Romance': return { container: 'bg-rose-100/50 border-rose-200', text: 'text-rose-900', subtext: 'text-rose-600' };
            case 'Rustic Charm': return { container: 'bg-amber-100/50 border-amber-200', text: 'text-amber-900', subtext: 'text-amber-600' };
            case 'Minimalist': return { container: 'bg-gray-100 border-gray-200', text: 'text-gray-900', subtext: 'text-gray-500' };
            case 'Vintage Glamour': return { container: 'bg-[#4a403a]/10 border-[#4a403a]/20', text: 'text-[#4a403a]', subtext: 'text-[#4a403a]/70' };
            case 'Boho Chic': return { container: 'bg-[#5c4b37]/10 border-[#5c4b37]/20', text: 'text-[#5c4b37]', subtext: 'text-[#5c4b37]/70' };
            case 'Beach Bliss': return { container: 'bg-cyan-100/50 border-cyan-200', text: 'text-cyan-900', subtext: 'text-cyan-600' };
            case 'Royal Luxury': return { container: 'bg-white/10 border-white/20', text: 'text-white', subtext: 'text-white/70' };
            default: return { container: 'bg-gray-100 border-gray-200', text: 'text-gray-900', subtext: 'text-gray-500' };
        }
    };

    const colors = getThemeColors();

    useEffect(() => {
        const calculateTimeLeft = () => {
            const weddingDateTime = new Date(`${targetDate}T${targetTime}:00`);
            const now = new Date();
            const difference = weddingDateTime.getTime() - now.getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft(null); // Already happened
            }
        };

        const timer = setInterval(calculateTimeLeft, 1000);
        calculateTimeLeft(); // Initial call

        return () => clearInterval(timer);
    }, [targetDate, targetTime]);

    if (!timeLeft) {
        return (
            <div className={`text-center py-2 px-4 rounded-full font-bold animate-pulse text-sm ${colors.container} ${colors.text}`}>
                🎉 Just Married!
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            {[
                { label: 'Days', value: timeLeft.days },
                { label: 'Hrs', value: timeLeft.hours },
                { label: 'Min', value: timeLeft.minutes },
                { label: 'Sec', value: timeLeft.seconds }
            ].map((unit) => (
                <div key={unit.label} className={`flex flex-col items-center backdrop-blur-md rounded-lg p-2 min-w-[50px] border transition-colors duration-500 ${colors.container}`}>
                    <span className={`text-lg font-bold leading-none ${colors.text}`}>{unit.value}</span>
                    <span className={`text-[10px] uppercase tracking-tighter mt-1 ${colors.subtext}`}>{unit.label}</span>
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;
