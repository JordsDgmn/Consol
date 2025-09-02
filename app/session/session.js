'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultSessionSettings, formatTime, saveSessionMetadata } from './sessionLogic';
import { useUser } from '@/lib/UserContext';
import { getTimeLimit } from './sessionLogic';
import dynamic from 'next/dynamic';
import { groupSessionsByNoteAndTime } from '@/utils/sessionUtils';



const FinishModal = dynamic(() => import('./FinishModal'), { ssr: false });


export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const noteId = searchParams.get('noteId');
  const { user } = useUser();
  const [viewMode, setViewMode] = useState('sessionOnly');
  const noteTitle = searchParams.get('noteTitle');
  const userId = searchParams.get('userId');
  const [sessionOnlyGroup, setSessionOnlyGroup] = useState([]);
  const [allSessionGroup, setAllSessionGroup] = useState([]);



  const [elapsed, setElapsed] = useState(0);
  const [text, setText] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [initialNote, setInitialNote] = useState(null);
  
  const [score, setScore] = useState(null);
  const [stars, setStars] = useState('✩');
  const [hintCount, setHintCount] = useState(0);
  const [allowHints, setAllowHints] = useState(
    searchParams.get('allowHints') === '1'
  );
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const [sessions, setSessions] = useState([]);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());



  const [chartData, setChartData] = useState([]);
  const [highlightId, setHighlightId] = useState(null);




  const rawTimeLimit = Number(searchParams.get('timeLimit'));
  const [settings] = useState({
    ...defaultSessionSettings,
    timeLimit: rawTimeLimit > 0 ? rawTimeLimit : null,
  });
  const timeLimit = isNaN(rawTimeLimit) ? defaultSessionSettings.timeLimit : rawTimeLimit;

  const textRef = useRef();

  // Load note from query param
  // using noteId
  useEffect(() => {
    if (!noteId) {
      console.error("🚫 noteId missing in URL");
      alert("Note ID missing in URL. Cannot load session.");
      return;
    }

    if (!user?.id) {
      console.warn("🕒 Waiting for user context...");
      return;
    }

    const fetchNote = async () => {
      try {
        console.log("[🔍] Fetching note:", noteId, "for user:", user.id);
        const res = await fetch(`/api/notes/${noteId}?userId=${user.id}`);
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData?.error || 'Unknown error');
        }
        const data = await res.json();
        if (!data?.id) {
          throw new Error("Note not found or empty result.");
        }
        console.log("[🟢 Loaded note]", data);
        setInitialNote(data);
      } catch (err) {
        console.error('❌ Failed to fetch note:', err);
        alert(`Failed to load note for session: ${err.message}`);
      }
    };

    fetchNote();
  }, [noteId, user?.id]);


  // Start interval timer
  useEffect(() => {
    if (isFinished) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isFinished]);

  // Auto-finish when time limit reached
  useEffect(() => {
    if (settings.timeLimit !== null && elapsed >= settings.timeLimit) {
      handleFinish();
    }
  }, [elapsed, settings.timeLimit, isFinished]);

  useEffect(() => {
    const activeGroup = viewMode === 'sessionOnly' ? sessionOnlyGroup : allSessionGroup;
    if (!Array.isArray(activeGroup)) return; // safety guard
    const flatGroup = Array.isArray(activeGroup[0]) ? activeGroup.flat() : activeGroup;


    const chart = flatGroup.map((s, i) => ({
      id: s.id,
      similarity: Number(s.similarity),
      trial: i + 1,
    }));

    console.log('[📈 Chart data]', chart);
    setChartData(chart);
  }, [viewMode, sessionOnlyGroup, allSessionGroup]);



  const handleFinish = async () => {
    if (isFinished) return;
    setIsFinished(true);
    clearInterval(intervalRef.current);

    if (!initialNote) {
      alert('Note not loaded yet.');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text1: initialNote.content,
          text2: text,
        }),
      });

      const result = await res.json();
      console.log('[✅ Score received]', result);

      if (typeof result.similarity !== 'number') {
        if (text.trim() === '') result.similarity = 0.0;
        else {
          alert('Invalid score from backend.');
          return;
        }
      }

      setScore(result.similarity);

      let givenStars = 0;
      if (result.similarity >= 0.90) givenStars = 3;
      else if (result.similarity >= 0.70) givenStars = 2;
      else if (result.similarity >= 0.45) givenStars = 1;

      setStars('⭐'.repeat(givenStars) || '✩');

      const duration_secs = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const word_count = text.trim().split(/\s+/).filter(Boolean).length;
      const wpm = duration_secs > 0 ? word_count / (duration_secs / 60) : 0;

      const saved = await saveSessionMetadata({
        user_id: user?.id,
        note_id: initialNote?.id,
        similarity: result.similarity,
        stars: givenStars,
        word_count,
        duration_secs,
        wpm,
      });

      console.log('💾 Saved session:', saved);
      setHighlightId(saved?.id || null);

      const response = await fetch(`/api/sessions?userId=${user.id}&noteId=${initialNote.id}`);
      const sessionData = await response.json();

      const allSessions = Array.isArray(sessionData.sessions) ? sessionData.sessions : [];
      setSessions(allSessions);
      console.log('[📊 All sessions]', allSessions);

      const { groupSessionsByNoteAndTime } = await import('@/utils/sessionUtils');
      const { sessionOnly, allSessions: allGrouped } = groupSessionsByNoteAndTime(allSessions);

      const sessionOnlyGroups = sessionOnly[initialNote.id] || [];
      const allSessionGroup = allGrouped[initialNote.id] || [];

      let retryGroup = sessionOnlyGroups.find(g => g.some(s => s.id === saved?.id));

      if (!retryGroup) {
        console.warn('[⚠️ retryGroup IS EMPTY] Could not match saved session ID in sessionOnly groups');
        retryGroup = saved ? [saved] : [];
      }

      setSessionOnlyGroup(retryGroup);

      setAllSessionGroup(allSessionGroup);

      setTimeout(() => {
        setShowFinishModal(true);
      }, 100);
    } catch (err) {
      console.error('❌ Scoring failed:', err);
      alert('Failed to get score from backend.');
    }
  };





  const handleRestart = () => {
    clearInterval(intervalRef.current);
    setElapsed(0);
    setScore(null);
    setStars('✩');
    setShowFinishModal(false);
    setHintCount(0);
    setIsFinished(false);
    // preserve text for user convenience
  };

  const handleExit = () => {
    clearInterval(intervalRef.current);
    router.push('/dashboard?refresh=1');
  };

  const allSessions = sessions; // 🆕 define from state for use in FinishModal


  return (
    <section className="min-h-screen w-full bg-[#2C282C] flex items-start justify-center p-10 gap-12 text-black font-sans">
      {/* LEFT PANEL */}
      <div className="w-[531px] h-[463px] bg-[#F1E5FC] rounded-3xl p-6 flex flex-col justify-between shadow-lg text-black">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-2xl font-bold">Consol</h1>
          <div className="text-right text-sm">
            <div className="text-[#979797]">Hints Used</div>
            <div
              className={`text-xl font-semibold ${
                !allowHints ? 'line-through text-gray-400' : ''
              }`}
            >
              {hintCount}
            </div>
            <div className="text-[#979797] mt-2">Word Count</div>
            <div className="text-xl font-semibold">
              {text.split(/\s+/).filter(Boolean).length}
            </div>
          </div>
        </div>

        <button
          className={`rounded-full px-8 py-2 font-medium text-lg shadow-md transition ${
            allowHints
              ? 'bg-[#C170FF] text-white hover:brightness-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          onClick={() => {
            if (!allowHints) return;
            alert(initialNote?.content || 'Note not loaded yet.');
            setHintCount((prev) => prev + 1);
          }}
          disabled={!allowHints}
        >
          {allowHints ? 'Open Notes' : '🔒 Hints Disabled'}
        </button>


        <div className="text-center my-4">
          <p className="text-[#979797] text-sm">Elapsed Session Time</p>
          <p className="text-3xl font-bold tracking-wide">{formatTime(elapsed)}</p>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 w-full h-[8px] bg-white rounded-full overflow-hidden">
            <div
              className="h-full bg-[#C170FF]"
              style={{
                width: settings.timeLimit
                  ? `${Math.min((elapsed / settings.timeLimit) * 100, 100)}%`
                  : '100%',
              }}
            />
          </div>
          {!settings.timeLimit && (
            <span className="text-xxl text-[#C170FF] font-bold ml-2">unli∞</span>
          )}
        </div>


        <div className="flex justify-between mt-4">
          <button
            className="px-6 py-2 rounded-full text-[#C170FF] border border-[#C170FF] bg-white shadow-sm hover:bg-[#f9f0ff] text-sm"
            onClick={handleRestart}
          >
            Restart
          </button>
          <button
            onClick={handleFinish}
            className="px-6 py-2 rounded-full text-white bg-[#C170FF] shadow-md hover:brightness-110 text-sm"
          >
            Finish Session
          </button>
        </div>
      </div>

      {/* TEXT AREA */}
      <div className="w-[1100px] h-[95vh] rounded-2xl bg-white shadow-lg p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-[#D8D8D8]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type here..."
          className="w-full h-full resize-none outline-none text-lg text-black leading-relaxed bg-transparent"
        />
      </div>

      {/* MODAL */}
      {showFinishModal && (
        <FinishModal
          score={score}
          stars={stars}
          sessionData={{
            allSessions, // ⬅️ all fetched sessions
            sessionOnly: sessionOnlyGroup || [],

          }}
          lineChartData={chartData} 
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleRestart={handleRestart}
          handleExit={handleExit}
          highlightId={highlightId}
        />


      )}


    </section>
  );
}
