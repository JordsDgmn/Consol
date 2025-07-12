'use client';
import { useEffect, useState } from 'react';

export default function PreviewPanel({ selectedSession }) {
  const [hoveredSession, setHoveredSession] = useState(null);

  useEffect(() => {
    if (selectedSession) setHoveredSession(selectedSession);
  }, [selectedSession]);

  if (!hoveredSession) {
    return (
      <div className="w-[340px] h-[300px] border rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-xs px-6 text-center shadow-md">
        Select History To View Analytics
      </div>
    );
  }

  return (
    <div className="w-[340px] h-[300px] border rounded-xl bg-purple-100 text-purple-700 p-4 shadow-md text-xs flex flex-col gap-2">
      <div className="text-sm font-semibold text-center mb-2">Session Metadata</div>
      <div className="grid grid-cols-2 gap-y-1 text-[11px]">
        <div className="text-gray-700">Word Count (Notes):</div>
        <div className="font-semibold">{hoveredSession.wordCount || '––'}</div>
        <div className="text-gray-700">Word Count (Recollection):</div>
        <div className="font-semibold">{hoveredSession.recalledCount || '––'}</div>
        <div className="text-gray-700">Avg. Improvement (%):</div>
        <div className="font-semibold">{hoveredSession.avgImprovement || '––'}</div>
        <div className="text-gray-700">Avg. Stars:</div>
        <div className="font-semibold">{hoveredSession.stars || '––'} ⭐</div>
      </div>

      {/* Line chart placeholder */}
      <div className="mt-3 flex-1 border rounded bg-white flex items-center justify-center text-gray-400 text-[10px]">
        [Line Chart Here]
      </div>
    </div>
  );
}
