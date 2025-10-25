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
import { useState, useEffect } from 'react';
import StarSlot from './StarSlot';

const Calendar = ({ sessions, onSelectDate, selectedDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Auto-navigate to selected date's month
  useEffect(() => {
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      // Only navigate if the selected date is in a different month
      if (!isSameMonth(selectedDateObj, currentDate)) {
        setCurrentDate(selectedDateObj);
      }
    }
  }, [selectedDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate daily performance and session data
  const dailyData = {};
  const bestSessionByDate = {};

  sessions.forEach((s) => {
    const dateKey = format(new Date(s.created_at), 'yyyy-MM-dd');
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = [];
    }
    dailyData[dateKey].push(s);

    // Keep track of best session for selection
    if (!bestSessionByDate[dateKey] || s.stars > bestSessionByDate[dateKey].stars) {
      bestSessionByDate[dateKey] = s;
    }
  });

  // Calculate star slots for each day
  const getStarSlots = (dateKey) => {
    const daySessions = dailyData[dateKey];
    if (!daySessions || daySessions.length === 0) return [];

    // Calculate average similarity for the day
    const avgSimilarity = daySessions.reduce((sum, s) => sum + (s.similarity || 0), 0) / daySessions.length;
    
    // Map similarity to star slots (0-3 filled stars)
    let filledStars = 0;
    if (avgSimilarity >= 0.7) filledStars = 3;      // 70%+ = 3 stars
    else if (avgSimilarity >= 0.5) filledStars = 2; // 50-69% = 2 stars  
    else if (avgSimilarity >= 0.3) filledStars = 1; // 30-49% = 1 star
    else filledStars = 0;                            // <30% = 0 stars

    // Always return 3 slots, fill based on performance
    return [
      filledStars >= 1,
      filledStars >= 2, 
      filledStars >= 3
    ];
  };

  const handleDayClick = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const daySessions = dailyData[dateStr];
    
    if (daySessions && daySessions.length > 0) {
      // If there's a "best" session, use that, otherwise use the first session
      const sessionToSelect = bestSessionByDate[dateStr] || daySessions[0];
      onSelectDate(sessionToSelect);
    }
  };

  const renderDays = () => {
    const blanks = Array(getDay(monthStart)).fill(null);
    const paddedDays = [...blanks, ...days];

    return paddedDays.map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="h-14" />;

      const dateStr = format(day, 'yyyy-MM-dd');
      const starSlots = getStarSlots(dateStr);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isSelected = selectedDate === dateStr;
      const hasSession = starSlots.length > 0;

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
          {hasSession && (
            <div className="flex gap-0.5 text-xs leading-none">
              {starSlots.map((filled, i) => (
                <StarSlot key={i} filled={filled} size="12px" />
              ))}
            </div>
          )}
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
