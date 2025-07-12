'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultSessionSettings, formatTime, saveSessionMetadata } from './sessionLogic';
import { useUser } from '@/lib/UserContext';
import { getTimeLimit } from './sessionLogic';

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const encodedNote = searchParams.get('note');
  const { user } = useUser();

  const [elapsed, setElapsed] = useState(0);
  const [text, setText] = useState('');
  const [initialNote, setInitialNote] = useState(null);
  const [score, setScore] = useState(null);
  const [stars, setStars] = useState('✩');
  const [hintCount, setHintCount] = useState(0);
  const [allowHints, setAllowHints] = useState(
    searchParams.get('allowHints') === '1'
  );
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  const rawTimeLimit = Number(searchParams.get('timeLimit'));
  const [settings] = useState({
    ...defaultSessionSettings,
    timeLimit: rawTimeLimit > 0 ? rawTimeLimit : null,
  });
  const timeLimit = isNaN(rawTimeLimit) ? defaultSessionSettings.timeLimit : rawTimeLimit;

  // Load note from query param
  useEffect(() => {
    if (!initialNote && encodedNote) {
      try {
        const parsed = JSON.parse(decodeURIComponent(encodedNote));
        console.log('[🟢 Parsed note]', parsed);
        setInitialNote(parsed);
      } catch (err) {
        console.error('❌ Failed to parse note:', err);
      }
    }
  }, [encodedNote, initialNote]);

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
    if (settings.timeLimit && elapsed >= settings.timeLimit) {
      handleFinish();
    }

  }, [elapsed, timeLimit, isFinished]);

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

      // ALLOW ZERO score if empty
      if (typeof result.similarity !== 'number') {
        if (text.trim() === '') {
          result.similarity = 0.0;
        } else {
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

      await saveSessionMetadata({
        user_id: user?.id,
        note_id: initialNote?.id,
        similarity: result.similarity,
        stars: givenStars,
        word_count,
        duration_secs,
        wpm,
      });

      setShowFinishModal(true);
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

            <div className="w-full h-48 bg-white rounded-lg border border-[#D9D9D9] flex items-center justify-center text-[#979797] mb-6">
              Accuracy Chart (Placeholder)
            </div>

            <div className="flex justify-center gap-4 mb-6">
              <button className="bg-[#C170FF] text-white text-xs px-3 py-1 rounded-full">
                all stats : on
              </button>
              <button className="bg-[#E0E0E0] text-[#696969] text-xs px-3 py-1 rounded-full">
                session only
              </button>
              <button className="bg-[#E0E0E0] text-[#696969] text-xs px-3 py-1 rounded-full">
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
      )}
    </section>
  );
}
