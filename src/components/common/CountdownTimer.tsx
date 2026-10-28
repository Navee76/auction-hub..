import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  endTime: string;
  startTime?: string;
  compact?: boolean;
  onExpire?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  endTime,
  startTime,
  compact = false,
  onExpire,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isUpcoming: boolean;
    isExpired: boolean;
    totalMs: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isUpcoming: false,
    isExpired: false,
    totalMs: 0,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const startMs = startTime ? new Date(startTime).getTime() : 0;
      const endMs = new Date(endTime).getTime();

      if (startMs > now) {
        // Upcoming auction
        const diff = startMs - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return {
          days,
          hours,
          minutes,
          seconds,
          isUpcoming: true,
          isExpired: false,
          totalMs: diff,
        };
      }

      if (endMs <= now) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isUpcoming: false,
          isExpired: true,
          totalMs: 0,
        };
      }

      const diff = endMs - now;
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      return {
        days,
        hours,
        minutes,
        seconds,
        isUpcoming: false,
        isExpired: false,
        totalMs: diff,
      };
    };

    const initial = calculateTime();
    setTimeLeft(initial);

    const interval = setInterval(() => {
      const updated = calculateTime();
      setTimeLeft(updated);
      if (updated.isExpired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, startTime, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
        <Clock className="w-3.5 h-3.5" />
        <span>Auction Ended</span>
      </span>
    );
  }

  if (timeLeft.isUpcoming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
        <Clock className="w-3.5 h-3.5" />
        <span>Starts in {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}{String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}</span>
      </span>
    );
  }

  const isEndingSoon = timeLeft.totalMs < 3600 * 1000; // < 1 hour

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-mono tabular-nums font-semibold ${
          isEndingSoon
            ? 'text-rose-600 dark:text-rose-400'
            : 'text-slate-700 dark:text-slate-200'
        }`}
      >
        <Clock className="w-3.5 h-3.5 text-slate-400" />
        {timeLeft.days > 0 && <span>{timeLeft.days}d </span>}
        <span>
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 min-w-[36px]">
          <span className="font-bold text-sm text-slate-900 dark:text-white">{timeLeft.days}</span>
          <span className="text-[10px] text-slate-500 uppercase">Days</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 min-w-[36px]">
        <span className="font-bold text-sm text-slate-900 dark:text-white">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-500 uppercase">Hrs</span>
      </div>
      <span className="font-bold text-slate-400">:</span>
      <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-800 rounded px-2 py-1 min-w-[36px]">
        <span className="font-bold text-sm text-slate-900 dark:text-white">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-500 uppercase">Min</span>
      </div>
      <span className="font-bold text-slate-400">:</span>
      <div
        className={`flex flex-col items-center rounded px-2 py-1 min-w-[36px] ${
          isEndingSoon
            ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300'
            : 'bg-slate-100 dark:bg-slate-800'
        }`}
      >
        <span className="font-bold text-sm text-slate-900 dark:text-white">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-slate-500 uppercase">Sec</span>
      </div>
    </div>
  );
};
