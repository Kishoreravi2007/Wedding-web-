import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
    targetDate: string; // YYYY-MM-DD
    targetTime?: string; // HH:mm
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, targetTime = '10:00' }) => {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number } | null>(null);

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
            <div className="text-center py-2 px-4 rounded-full bg-rose-100 text-rose-700 font-bold animate-pulse text-sm">
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
                <div key={unit.label} className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-lg p-2 min-w-[50px] border border-white/20">
                    <span className="text-lg font-bold text-white leading-none">{unit.value}</span>
                    <span className="text-[10px] text-white/70 uppercase tracking-tighter mt-1">{unit.label}</span>
                </div>
            ))}
        </div>
    );
};

export default CountdownTimer;
