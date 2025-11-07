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
  const [stars, setStars] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [allowHints, setAllowHints] = useState(
    searchParams.get('allowHints') === '1'
  );
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);

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

    // Clear any previous session end data when starting a new session
    // This ensures that new sessions from dashboard are always fresh
    localStorage.removeItem('lastSessionEnd');

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
    if (isFinished || isTimerPaused) return;

    intervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isFinished, isTimerPaused]);

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
      if (result.similarity >= 0.81) givenStars = 3;
      else if (result.similarity >= 0.6) givenStars = 2;
      else if (result.similarity >= 0.3) givenStars = 1;

      setStars(givenStars);

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
        hints_used: hintCount,
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

      // Find the group containing the current session (the one we just saved)
      let retryGroup = sessionOnlyGroups.find(g => g.some(s => s.id === saved?.id));

      if (!retryGroup && sessionOnlyGroups.length > 0) {
        // If we can't find the exact session, use the most recent group
        // Sort groups by their latest session time and take the most recent
        const sortedGroups = sessionOnlyGroups.sort((a, b) => {
          const latestA = Math.max(...a.map(s => new Date(s.created_at)));
          const latestB = Math.max(...b.map(s => new Date(s.created_at)));
          return latestB - latestA; // descending order (newest first)
        });
        retryGroup = sortedGroups[0];
        console.log('[📊 Using most recent session group]', retryGroup);
      } else if (!retryGroup) {
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
    setShowRestartModal(true);
    setIsTimerPaused(true);
  };

  const handleTryAgain = () => {
    clearInterval(intervalRef.current);
    setElapsed(0);
    setScore(null);
    setStars(0);
    setShowFinishModal(false);
    setHintCount(0);
    setIsFinished(false);
    setText(''); // Clear the text like it did before
    startTimeRef.current = Date.now(); // Reset start time
    // Timer will start automatically via useEffect
  };

  const confirmRestart = () => {
    clearInterval(intervalRef.current);
    setElapsed(0);
    setScore(null);
    setStars(0);
    setShowFinishModal(false);
    setShowRestartModal(false);
    setHintCount(0);
    setIsFinished(false);
    setIsTimerPaused(false);
    setText(''); // Clear the text for restart
    startTimeRef.current = Date.now(); // Reset start time
    // Timer will start automatically via useEffect
  };

  const cancelRestart = () => {
    setShowRestartModal(false);
    setIsTimerPaused(false);
  };

  const redactText = (text) => {
    if (!text) return '';
    
    // Split text into words (including punctuation)
    const words = text.split(/(\s+)/);
    const actualWords = words.filter(word => word.trim() && !/^\s+$/.test(word));
    
    // Calculate 25% of actual words to redact
    const wordsToRedact = Math.ceil(actualWords.length * 0.25);
    
    // Create array of indices for actual words
    const wordIndices = [];
    words.forEach((word, index) => {
      if (word.trim() && !/^\s+$/.test(word)) {
        wordIndices.push(index);
      }
    });
    
    // Randomly select words to redact
    const selectedIndices = [];
    while (selectedIndices.length < wordsToRedact && selectedIndices.length < wordIndices.length) {
      const randomIndex = wordIndices[Math.floor(Math.random() * wordIndices.length)];
      if (!selectedIndices.includes(randomIndex)) {
        selectedIndices.push(randomIndex);
      }
    }
    
    // Replace selected words with underscores
    return words.map((word, index) => {
      if (selectedIndices.includes(index)) {
        return '_'.repeat(Math.max(3, word.length));
      }
      return word;
    }).join('');
  };

  const handleExit = () => {
    clearInterval(intervalRef.current);
    
    // Mark the session as "ended" by storing the end time in localStorage
    // This will help the grouping logic know that this session was intentionally ended
    const sessionEndData = {
      noteId: initialNote?.id,
      endTime: Date.now(),
      userId: user?.id
    };
    localStorage.setItem('lastSessionEnd', JSON.stringify(sessionEndData));
    
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
            setShowHintModal(true);
            setIsTimerPaused(true);
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
            allSessions: allSessionGroup || [], // ⬅️ all sessions for this note (grouped)
            sessionOnly: sessionOnlyGroup || [], // ⬅️ session-only group for this note

          }}
          lineChartData={chartData} 
          viewMode={viewMode}
          setViewMode={setViewMode}
          handleRestart={handleTryAgain}
          handleExit={handleExit}
          highlightId={highlightId}
        />


      )}

      {/* Restart Confirmation Modal */}
      {showRestartModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-lg w-[500px] p-8 shadow-2xl text-black">
            <h2 className="text-xl font-semibold mb-4 text-center">Restart Session</h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to restart this session? This will reset your timer and progress.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={cancelRestart}
                className="px-6 py-3 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmRestart}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Restart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hint Modal */}
      {showHintModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-lg w-[600px] max-h-[70vh] p-8 shadow-2xl text-black">
            {/* Close Button */}
            <button
              onClick={() => {
                setShowHintModal(false);
                setIsTimerPaused(false);
              }}
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
            >
              ×
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">📝 Note Hint</h2>
              <p className="text-sm text-gray-600">
                Timer is paused while viewing this hint. Close to resume.
              </p>
            </div>

            {/* Note Content */}
            <div className="bg-gray-50 rounded-lg p-6 max-h-96 overflow-y-auto">
              <div 
                className="whitespace-pre-wrap text-gray-800 leading-relaxed select-none"
                style={{
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onSelectStart={(e) => e.preventDefault()}
                onCopy={(e) => e.preventDefault()}
                onCut={(e) => e.preventDefault()}
              >
                {redactText(initialNote?.content) || 'Note content not available.'}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-gray-500">
                Hint #{hintCount} used
              </p>
              <button
                onClick={() => {
                  setShowHintModal(false);
                  setIsTimerPaused(false);
                }}
                className="px-6 py-2 bg-[#C170FF] text-white rounded-lg hover:bg-[#A229FF] transition"
              >
                Resume Session
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
