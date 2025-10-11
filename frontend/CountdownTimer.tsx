import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate }) => {
  const [timeRemaining, setTimeRemaining] = useState(getTimeRemaining(targetDate));

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeRemaining(getTimeRemaining(targetDate));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [targetDate]);

  function getTimeRemaining(targetDate: Date) {
    const totalSeconds = (targetDate.getTime() - new Date().getTime()) / 1000;
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    return {
      days,
      hours,
      minutes,
      seconds,
    };
  }

  return (
    <div className="text-center p-4">
      <div className="text-3xl font-bold">
        {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
      </div>
    </div>
  );
};

export default CountdownTimer;
