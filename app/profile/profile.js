'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import HistoryTable from '@/components/HistoryTable';
import { groupSessionsByNoteAndTime } from '@/utils/sessionUtils';
import { useUser } from '@/lib/UserContext';
import Calendar from '@/components/Calendar';
import { computeRadarStats } from '@/utils/computeRadarStats';

const RadarChart = dynamic(() => import('@/components/RadarChart'), { ssr: false });
const LineChart = dynamic(() => import('@/components/LineChart'), { ssr: false });

export default function ProfilePage() {
  const { user } = useUser();
  const [notes, setNotes] = useState([]);

  const [overallRadarStats, setOverallRadarStats] = useState([0, 0, 0]);

  const [sessionData, setSessionData] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);


  const [groupedData, setGroupedData] = useState({
    allSessions: {},
    sessionOnly: {},
  });
  const [viewMode, setViewMode] = useState('sessionOnly');

  const sortedSessions = [...sessionData].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  useEffect(() => {
    async function fetchNotes() {
      if (!user?.id) return;
      const res = await fetch(`/api/notes?userId=${user.id}`);
      const json = await res.json();
      setNotes(json.notes);
    }
    fetchNotes();
  }, [user]);

  useEffect(() => {
    async function fetchSessions() {
      if (!user?.id) return;
      try {
        const res = await fetch(`/api/sessions?userId=${user.id}`);
        const json = await res.json();
        const grouped = groupSessionsByNoteAndTime(json.sessions || []);
        setGroupedData(grouped);
        setSessionData(json.sessions);
        const overallRadar = computeRadarStats(json.sessions, 100);
        setOverallRadarStats(overallRadar);
      } catch (e) {
        console.error(e);
      }
    }
    fetchSessions();
  }, [user]);

  const streakStats = computeDailyStreaks(sessionData);


  // Find current sessions
  const selectedNoteId = selectedRow?.note_id;
  let currentSessions = [];

  if (selectedRow && selectedNoteId && groupedData[viewMode]) {
    if (viewMode === 'allSessions') {
      currentSessions = groupedData.allSessions[selectedNoteId] || [];
    } else {
      const group = (groupedData.sessionOnly[selectedNoteId] || []).find(g =>
        g.some(s => s.id === selectedRow.id)
      );
      currentSessions = group || [];
    }
  } else {
    // fallback: ALL sessions for user for initial radar chart
    currentSessions = sessionData;
  }

  const originalNote = selectedNoteId && Array.isArray(notes)
    ? notes.find(n => n.id === selectedNoteId)
    : null;

  const originalWordCount = originalNote?.content?.split(' ')?.length || 100;



  // Temporal comparison calculation (current stats vs. stats at selected date)
  const comparisonValues = selectedRow
    ? (() => {
        const selectedDate = new Date(selectedRow.created_at).toISOString().substring(0, 10);
        
        // Get all sessions up to and including the selected date
        const sessionsUpToSelectedDate = sessionData.filter(session => {
          const sessionDate = new Date(session.created_at).toISOString().substring(0, 10);
          return sessionDate <= selectedDate;
        });

        if (sessionsUpToSelectedDate.length > 0) {
          // Calculate stats as they were on the selected date
          return computeRadarStats(sessionsUpToSelectedDate, originalWordCount);
        }
        return null;
      })()
    : null;


  // Line Chart Data
  let lineChartData = [];

  if (selectedRow && selectedNoteId) {
    if (viewMode === 'allSessions') {
      lineChartData =
        (groupedData.allSessions[selectedNoteId] || []).map((s, i) => ({
          id: s.id,
          similarity: s.similarity,
          trial: i + 1,
        }));
    } else {
      const group = (groupedData.sessionOnly[selectedNoteId] || []).find(g =>
        g.some(sess => sess.id === selectedRow.id)
      );
      lineChartData =
        (group || []).map((s, i) => ({
          id: s.id,
          similarity: s.similarity,
          trial: i + 1,
        }));
    }
  }

  // helper functions for streak and mastered notes:

  function computeDailyStreaks(sessions = []) {
    const validSessions = sessions.filter(s => s.stars > 0);

    if (validSessions.length === 0) return { current: 0, highest: 0 };

    // Map to unique session dates
    const days = new Set(
      validSessions.map(s => new Date(s.created_at).toISOString().substring(0, 10))
    );

    const dayTimestamps = [...days].map(d =>
      Math.floor(new Date(d).getTime() / (1000 * 60 * 60 * 24))
    ).sort((a, b) => a - b);

    let currentStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < dayTimestamps.length; i++) {
      if (dayTimestamps[i] === dayTimestamps[i - 1] + 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else if (dayTimestamps[i] > dayTimestamps[i - 1] + 1) {
        currentStreak = 1;
      }
    }

    // Check if there's a session today
    const todayStr = new Date().toISOString().substring(0, 10);
    const hasSessionToday = days.has(todayStr);

    // If no session today, streak is broken
    if (!hasSessionToday) currentStreak = 0;

    return { current: currentStreak, highest: maxStreak };
  }


  function computeNotesMastered(sessions = []) {
    if (!sessions.length) return 0;

    const masteredNotes = new Set(
      sessions.filter(s => s.stars === 3).map(s => s.note_id)
    );

    return masteredNotes.size;
  }

    function formatHoursDecimal(seconds) {
    const hours = seconds / 3600;
    return hours.toFixed(2) + " hrs";
  }

  function getTotalSessionSeconds(sessions = []) {
    return sessions.reduce((acc, s) => acc + (s.duration_secs || 0), 0);
  }

  function getAverageSessionSeconds(sessions = []) {
    if (!sessions.length) return 0;
    return getTotalSessionSeconds(sessions) / sessions.length;
  }

    

  return (
    <main className="min-h-screen bg-white font-sans text-gray-900 flex flex-col">
      <section className="flex-1 grid grid-cols-[44%_56%] grid-rows-[44%_55%] gap-0 p-4">
        {/* Top Left */}
        {/* Top Left Profile Main*/}
        <div className="flex items-center justify-center px-8">
          <div className="flex items-center gap-8">
            <div className="w-48 h-48 rounded-full border border-gray-300 flex items-center justify-center text-sm text-gray-500">
              [ Profile Picture ]
            </div>
            <div className="flex flex-col gap-4">
              <h2 className="text-4xl font-semibold">User Name</h2>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">

                <div>
                  <p className="text-gray-500 relative group">
                    Total Sessions Started
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Total number of sessions ever started.<br/>
                      <span className="opacity-50">(Count of rows in sessions table)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">{sessionData.length}</p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Average Session Time
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Average duration of all sessions.<br/>
                      <span className="opacity-50">(Total seconds ÷ sessions count)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">
                    {sessionData.length
                      ? formatHoursDecimal(getAverageSessionSeconds(sessionData))
                      : "--"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Total Session Time
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Total time spent across all sessions.<br/>
                      <span className="opacity-50">(Sum of duration_secs)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">
                    {sessionData.length
                      ? formatHoursDecimal(getTotalSessionSeconds(sessionData))
                      : "--"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Total Word Count
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Words typed in all sessions combined.<br/>
                      <span className="opacity-50">(Sum of word_count)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">
                    {sessionData.reduce((acc, s) => acc + (s.word_count || 0), 0)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Current Daily Streak
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Number of consecutive days with at least one session achieving a star.<br/>
                      <span className="opacity-50">(Resets if no session today)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">{streakStats.current}</p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Notes Mastered
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Number of unique notes where you achieved 3 stars at least once.<br/>
                      <span className="opacity-50">(Distinct note_ids with stars = 3)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">
                    {computeNotesMastered(sessionData)}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Highest Daily Streak
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      Longest daily streak you've ever achieved.<br/>
                      <span className="opacity-50">(All-time highest streak)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">{streakStats.highest}</p>
                </div>

                <div>
                  <p className="text-gray-500 relative group">
                    Last Active{" "}
                    <span className="text-gray-400 text-xs">
                      {user?.last_active ? (() => {
                        const last = new Date(user.last_active);
                        const now = new Date();
                        const diffTime = now - last;
                        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                        return `(${diffDays === 0 ? 'today' : `${diffDays} day${diffDays > 1 ? 's' : ''} ago`})`;
                      })() : ""}
                    </span>
                    <span className="absolute left-0 top-full mt-1 hidden group-hover:block w-max bg-gray-800 text-white text-xs rounded px-2 py-1 shadow z-10">
                      The most recent calendar date when you performed a session.<br/>
                      <span className="opacity-50">(Auto-updates when new session is saved)</span>
                    </span>
                  </p>
                  <p className="text-xl font-semibold">
                    {user?.last_active
                      ? new Date(user.last_active).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : "--"}
                  </p>
                </div>



              </div>
            </div>
          </div>
        </div>



        {/* Top Right */}
        <div className="flex items-start justify-start w-full h-full px-4 py-2 gap-4">
  

          <div className="w-[600px] h-[390px] overflow-y-auto border border-gray-300 rounded-xl shadow bg-white text-xs">
            <HistoryTable
              sessions={sortedSessions}
              notes={notes}
              selectedIndex={selectedRowIndex}
              setSelectedDate={setSelectedDate}
              onRowHover={(row) => setSelectedRow(row)}
              onRowSelect={(row) => {
                setSelectedRow(row);
                const idx = sortedSessions.findIndex((s) => s.id === row.id);
                setSelectedRowIndex(idx);
                // Use consistent date formatting
                const dateStr = new Date(row.created_at).toISOString().substring(0, 10);
                setSelectedDate(dateStr);
              }}
            />

          </div>
          <div className="flex flex-col w-full h-full bg-purple-50 border border-purple-400 rounded-xl p-4 shadow">
            <h2 className="text-center text-purple-700 font-bold mb-2">
              Session Metadata
            </h2>
            {selectedRow ? (
              <>
                <p className="text-sm mb-1">
                  <span className="text-gray-600">Word Count (Notes):</span>{' '}
                  <span className="text-purple-700 font-semibold">
                    {originalWordCount}
                  </span>
                </p>
                <p className="text-sm mb-1">
                  <span className="text-gray-600">
                    Word Count (Recollection):
                  </span>{' '}
                  <span className="text-purple-700 font-semibold">
                    {selectedRow.word_count}
                  </span>
                </p>
                <p className="text-sm mb-1">
                  <span className="text-gray-600">Avg. Improvement (%):</span>{' '}
                  <span className="text-purple-700 font-semibold">9</span>
                </p>
                <p className="text-sm mb-2">
                  <span className="text-gray-600">Mastery Level:</span>{' '}
                  <span className="text-yellow-500 font-semibold">
                    {selectedRow.stars} ⭐
                  </span>
                </p>

                <div className="flex items-center justify-center gap-2 mb-2">
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

                <div className="flex-1b border h-full bg-white text-center text-gray-400 text-xs flex items-center justify-center rounded-md">
                  <LineChart
                    data={lineChartData}
                    highlightId={selectedRow.id}
                  />
                </div>
              </>
            ) : (
              <div className="text-center text-purple-500 text-sm flex-1 flex items-center justify-center">
                Select History To View Analytics
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left: STATS & RADAR CHARTS */}
        <div className="flex items-center justify-center w-full max-w-5xl h-auto p-4">
          <RadarChart 
            dataValues={overallRadarStats} 
            compareValues={comparisonValues}
            comparisonDate={selectedRow?.created_at}
          />

        </div>

        {/* Bottom Right */}
        <div className="flex items-center justify-center w-full h-[450px] px-4">
          <Calendar
            sessions={sessionData}
            selectedDate={selectedDate}
            onSelectDate={(session) => {
              setSelectedRow(session);
              // Use consistent date formatting
              const dateStr = new Date(session.created_at).toISOString().substring(0, 10);
              setSelectedDate(dateStr);
              const idx = sortedSessions.findIndex((s) => s.id === session.id);
              setSelectedRowIndex(idx);
            }}
          />

        </div>
      </section>
    </main>
  );
}
