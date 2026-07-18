'use client';
import { useEffect, useState } from 'react';
import LineChart from '@/components/LineChart';
import StarSlot from '@/components/StarSlot';

export default function FinishModal({
  score,
  stars,
  sessionData,
  viewMode,
  setViewMode,
  handleRestart,
  handleExit,
  highlightId,
}) {
  const [internalChartData, setInternalChartData] = useState([]);

  useEffect(() => {
    console.log('[📈 SESSION ONLY DATA]', sessionData.sessionOnly);
    console.log('[📈 ALL SESSIONS DATA]', sessionData.allSessions);
    console.log('[⭐ HIGHLIGHT ID]', highlightId);
    console.log('[🔍 DEBUGGING] sessionData structure:', {
      sessionOnlyLength: sessionData.sessionOnly?.length,
      allSessionsLength: sessionData.allSessions?.length,
      sessionOnlyFirst: sessionData.sessionOnly?.[0],
      sessionOnlyLast: sessionData.sessionOnly?.[sessionData.sessionOnly?.length - 1],
      allSessionsFirst: sessionData.allSessions?.[0],
      allSessionsLast: sessionData.allSessions?.[sessionData.allSessions?.length - 1],
      isArray: Array.isArray(sessionData.sessionOnly)
    });
  }, [sessionData, highlightId]);

  useEffect(() => {
    const activeGroup =
      viewMode === 'sessionOnly'
        ? sessionData.sessionOnly
        : sessionData.allSessions;

    // Reverse to show chronological order (oldest first, newest last)
    // API returns DESC order (newest first), so we reverse to ASC
    const newChartData = [...activeGroup].reverse().map((s, i) => ({
      id: s.id,
      similarity: Number(s.similarity),
      trial: i + 1,
      created_at: s.created_at, // Include for tooltip date/time display
    }));

    console.log('[📊 FinishModal Chart Data]', {
      viewMode,
      dataLength: newChartData.length,
      firstPoint: newChartData[0],
      lastPoint: newChartData[newChartData.length - 1],
    });

    setInternalChartData(newChartData);
  }, [viewMode, sessionData]);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-[900px] bg-[#F1E5FC] rounded-2xl p-10 shadow-xl text-center text-black">
        <h2 className="text-lg font-semibold mb-4">Similarity Score</h2>
        {typeof score === 'number' ? (
          <>
            <p 
              className="text-xl font-bold text-[#A229FF] mb-2 cursor-help"
              title="SimCSE similarity score: Measures semantic similarity between your note and recollection using AI. Range: 0.0000 (no similarity) to 1.0000 (perfect match)"
            >
              Score: {score.toFixed(4)}
            </p>
            <div 
              className="flex justify-center gap-1 mb-6 cursor-help"
              title="Star rating based on similarity thresholds: 3 stars (≥81%), 2 stars (≥60%), 1 star (≥44%), 0 stars (<44%)"
            >
              {[1, 2, 3].map((starIndex) => (
                <StarSlot 
                  key={starIndex} 
                  filled={starIndex <= stars} 
                  size="32px" 
                />
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-[#696969]">Score unavailable.</p>
        )}

        <div className="w-full h-[200px] bg-white rounded-md text-center text-xs text-gray-400 mb-4">
          <LineChart 
            data={internalChartData} 
            highlightId={highlightId}
            tooltipMode={viewMode === 'sessionOnly' ? 'timeOnly' : 'full'}
          />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full text-xs ${
              viewMode === 'sessionOnly'
                ? 'bg-purple-600 text-white'
                : 'bg-white border'
            }`}
            onClick={() => setViewMode('sessionOnly')}
            title="Session Only: Shows current consecutive session attempts and retries for this specific note. Resets when you exit and start a new session."
          >
            session only
          </button>
          <button
            className={`px-3 py-1 rounded-full text-xs ${
              viewMode === 'allSessions'
                ? 'bg-purple-600 text-white'
                : 'bg-white border'
            }`}
            onClick={() => setViewMode('allSessions')}
            title="All Sessions: Shows every session attempt for this note across all time, including previous days and study periods."
          >
            all sessions
          </button>
        </div>

        <div className="flex justify-center gap-12">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#A229FF] rounded-full text-[#A229FF] shadow-md hover:brightness-110"
            title="Try Again: Start a new session with the same note. Your previous attempt will be saved and this will count as another trial."
          >
            <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-t-transparent border-b-transparent border-l-[#A229FF] ml-1" />
            Try Again
          </button>
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-white border border-[#D9D9D9] rounded-full text-[#696969] shadow-md hover:bg-[#F3F3F3]"
            title="Exit Session: Return to the dashboard. Your session results have been saved to your profile analytics."
          >
            Exit Session
          </button>
        </div>
      </div>
    </div>
  );
}
