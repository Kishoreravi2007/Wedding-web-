import React, { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ClockPickerProps {
    value: string; // HH:mm format
    onChange: (value: string) => void;
}

const ClockPicker: React.FC<ClockPickerProps> = ({ value, onChange }) => {
    // Parse value (HH:mm)
    const [hours, setHours] = useState(parseInt(value?.split(':')[0]) || 10);
    const [minutes, setMinutes] = useState(parseInt(value?.split(':')[1]) || 0);
    const [ampm, setAmpm] = useState(parseInt(value?.split(':')[0]) >= 12 ? 'PM' : 'AM');

    // Convert to 12h for UI
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

    const handleHourChange = (newHour: number) => {
        let finalHour = newHour;
        if (ampm === 'PM' && newHour < 12) finalHour += 12;
        if (ampm === 'AM' && newHour === 12) finalHour = 0;
        setHours(finalHour);
    };

    const handleMinuteChange = (newMin: number) => {
        setMinutes(newMin);
    };

    const toggleAmpm = () => {
        const newAmpm = ampm === 'AM' ? 'PM' : 'AM';
        setAmpm(newAmpm);

        // Update hours based on new AM/PM
        let newHour = hours;
        if (newAmpm === 'PM' && hours < 12) newHour += 12;
        if (newAmpm === 'AM' && hours >= 12) newHour -= 12;
        setHours(newHour);
    };

    useEffect(() => {
        const formattedValue = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        onChange(formattedValue);
    }, [hours, minutes]);

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Hour</span>
                    <select
                        value={displayHours}
                        onChange={(e) => handleHourChange(parseInt(e.target.value))}
                        className="w-full h-10 border rounded-lg text-center font-bold text-lg bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                            <option key={h} value={h}>{h}</option>
                        ))}
                    </select>
                </div>

                <span className="text-2xl font-bold mt-4">:</span>

                <div className="flex-1 flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Minute</span>
                    <select
                        value={minutes}
                        onChange={(e) => handleMinuteChange(parseInt(e.target.value))}
                        className="w-full h-10 border rounded-lg text-center font-bold text-lg bg-gray-50 focus:ring-2 focus:ring-rose-500 outline-none appearance-none"
                    >
                        {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">AM/PM</span>
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={toggleAmpm}
                        className={`h-10 w-12 font-bold ${ampm === 'AM' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'} hover:opacity-80 transition-all`}
                    >
                        {ampm}
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-rose-50 rounded-lg text-rose-700 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                Selected: {displayHours}:{minutes.toString().padStart(2, '0')} {ampm}
            </div>
        </div>
    );
};

export default ClockPicker;
