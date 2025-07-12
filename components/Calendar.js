'use client';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  getDay,
  isSameMonth,
  addMonths,
  subMonths,
} from 'date-fns';
import { useState } from 'react';

const Calendar = ({ sessions, onSelectDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const starsPerDay = {};
  const bestSessionByDate = {};

  sessions.forEach((s) => {
    const dateKey = format(new Date(s.created_at), 'yyyy-MM-dd');
    const stars = s.stars || 0;
    if (!starsPerDay[dateKey] || stars > starsPerDay[dateKey]) {
      starsPerDay[dateKey] = stars;
      bestSessionByDate[dateKey] = s;
    }
  });

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (bestSessionByDate[dateStr]) {
      onSelectDate(bestSessionByDate[dateStr]);
    }
  };

  const renderDays = () => {
    const blanks = Array(getDay(monthStart)).fill(null);
    const paddedDays = [...blanks, ...days];

    return paddedDays.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="h-14" />;

      const dateStr = format(day, 'yyyy-MM-dd');
      const stars = starsPerDay[dateStr] || 0;
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isSelected = selectedDate === dateStr;

      return (
        <div
          key={dateStr}
          onClick={() => handleDayClick(day)}
          className={`h-14 flex flex-col items-center justify-center border text-sm transition cursor-pointer
            ${isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}
            ${isSelected ? 'bg-purple-200 text-purple-800 font-bold' : 'hover:bg-purple-100'}
            border-purple-200`}
        >
          <span>{format(day, 'd')}</span>
          <span className="text-yellow-400 text-lg leading-none">
            {'★'.repeat(stars)}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="w-full p-4 bg-white rounded-xl border border-purple-300">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="text-purple-600 hover:underline text-sm"
        >
          ← Prev
        </button>
        <h2 className="text-center text-purple-700 font-semibold text-lg">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="text-purple-600 hover:underline text-sm"
        >
          Next →
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-sm font-medium text-purple-600 border-b border-purple-200 pb-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-[1px] gap-x-[2px]">{renderDays()}</div>
    </div>
  );
};

export default Calendar;
