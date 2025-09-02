'use client';
import { useEffect, useState } from 'react';
import LineChart from '@/components/LineChart';

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
  }, [sessionData, highlightId]);

  useEffect(() => {
    const activeGroup =
      viewMode === 'sessionOnly'
        ? sessionData.sessionOnly
        : sessionData.allSessions;

    const newChartData = activeGroup.map((s, i) => ({
      id: s.id,
      similarity: Number(s.similarity),
      trial: i + 1,
    }));

    setInternalChartData(newChartData);
  }, [viewMode, sessionData]);

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
      <div className="relative w-[900px] bg-[#F1E5FC] rounded-2xl p-10 shadow-xl text-center text-black">
        <h2 className="text-lg font-semibold mb-4">Similarity Score</h2>
        {typeof score === 'number' ? (
          <>
            <p className="text-xl font-bold text-[#A229FF] mb-2">
              Score: {score.toFixed(4)}
            </p>
            <p className="text-3xl mb-6">{stars}</p>
          </>
        ) : (
          <p className="text-sm text-[#696969]">Score unavailable.</p>
        )}

        <div className="w-full h-[200px] bg-white rounded-md text-center text-xs text-gray-400 mb-4">
          <LineChart data={internalChartData} highlightId={highlightId} />
        </div>

        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            className={`px-3 py-1 rounded-full text-xs ${
              viewMode === 'sessionOnly'
                ? 'bg-purple-600 text-white'
                : 'bg-white border'
            }`}
            onClick={() => setViewMode('sessionOnly')}
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
          >
            all sessions
          </button>
        </div>

        <div className="flex justify-center gap-12">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-[#A229FF] rounded-full text-[#A229FF] shadow-md hover:brightness-110"
          >
            <div className="w-0 h-0 border-t-[8px] border-b-[8px] border-l-[14px] border-t-transparent border-b-transparent border-l-[#A229FF] ml-1" />
            Try Again
          </button>
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-white border border-[#D9D9D9] rounded-full text-[#696969] shadow-md hover:bg-[#F3F3F3]"
          >
            Exit Session
          </button>
        </div>
      </div>
    </div>
  );
}
