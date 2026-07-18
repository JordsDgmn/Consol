'use client';
import dynamic from 'next/dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

import { useNotesLogic } from './notes';


import { v4 as uuidv4 } from 'uuid';
import { useUser } from '@/lib/UserContext';
import { defaultSessionSettings, formatTime, saveTimeLimit, getTimeLimit, getDifficultyLevel } from '../session/sessionLogic';


const LineChart = dynamic(() => import('@/components/LineChart'), { ssr: false });
const StarSlot = dynamic(() => import('@/components/StarSlot'), { ssr: false });



/* ────────────────────────────────────────────────
🔁 1. Debounced Update Hook
──────────────────────────────────────────────── */
function useDebouncedUpdate(value, delay, callback) {
  useEffect(() => {
    const handler = setTimeout(() => callback(), delay);
    return () => clearTimeout(handler);
  }, [value]);
}

/* ────────────────────────────────────────────────
📦 2. Dashboard Component Entry
──────────────────────────────────────────────── */
export default function Dashboard() {
  const router = useRouter();
  const firstNoteRef = useRef(null);

  const { user } = useUser(); // ✅ this should give you { id, username }
  const userId = user?.id // ✅ Ensure userId is available\

  

  const searchParams = useSearchParams();
  
  console.log('[👤 DASHBOARD USER]', userId);

 


  /* ────────────────────────────────────────────────
  🪄 3. Sidebar Modal & Feature Toggles
  ──────────────────────────────────────────────── */
  const [showModal, setShowModal] = useState(false);
  const [toggles, setToggles] = useState({
    hints: true,
    timeLimit: true,
    verbatim: true,
  });

  const toggleSwitch = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    
    // Initialize original time when opening modal
    if (key === 'timeLimit' && !toggles[key]) {
      setOriginalTimeLimit(getTimeLimit());
      setDurationInput(formatTime(getTimeLimit()));
    }
  };

  /* ────────────────────────────────────────────────
  📥 4. Notes Fetching on First Load
  ──────────────────────────────────────────────── */

  const [highlightedNoteId, setHighlightedNoteId] = useState(null); // ✅ For fade-in animation

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch(`/api/notes?userId=${userId}`);
        const data = await res.json();
        setExternalNotes(data);
      } catch (err) {
        console.error('Failed to fetch notes:', err);
      }
    };

    if (userId) fetchNotes();
  }, [userId]);


  /* ────────────────────────────────────────────────
  ⚙️ 5. Note Logic from useNotesLogic Hook
  ──────────────────────────────────────────────── */
  const [externalNotes, setExternalNotes] = useState([]);



  const {
    notes,
    selectedNote,
    selectedNoteId,
    setSelectedNoteId,
    updateNote,
    deleteNote,
  } = useNotesLogic(externalNotes, setExternalNotes, userId); // ✅ 2. correct order

  console.log('[💡 NOTES STATE]', externalNotes);
  console.log('[💡 notes]', notes);

  

  const [sessionStats, setSessionStats] = useState({
    attempts: 0,
    avgStars: 0,
    lastStars: 0,
    avgScore: null,
    lastScore: null,
    lastSpeed: null,
    masteryLevel: null,
    sessions: [],
  });

  async function fetchSessionStats(userId, selectedNoteId) {
    if (!userId || !selectedNoteId) return;

    try {
      const res = await fetch(`/api/sessions?userId=${userId}&noteId=${selectedNoteId}`);

      if (!res.ok) {
        console.error("❌ Backend error:", res.status);
        return;
      }

      const json = await res.json();
      console.log('[DEBUG] /api/sessions response:', json);

      
      const sessions = json?.sessions ?? [];

      const attempts = sessions.length;
      const lastStars = sessions[0]?.stars || 0;
      const lastScore = sessions[0]?.similarity ?? null;
      const lastSpeed = sessions[0]?.wpm ?? null;

      // Filter sessions with valid similarity scores and calculate average
      const sessionsWithScores = sessions.filter(s => s.similarity !== null && s.similarity !== undefined && !isNaN(Number(s.similarity)));
      const avgScore = sessionsWithScores.length > 0
        ? sessionsWithScores.reduce((sum, s) => sum + Number(s.similarity), 0) / sessionsWithScores.length
        : null;

      console.log('[DEBUG] Sessions with scores:', sessionsWithScores.length, 'out of', sessions.length);
      console.log('[DEBUG] Average score calculated:', avgScore);

      // Calculate mastery level (percentage of 3-star sessions)
      const threeStarSessions = sessions.filter(s => s.stars === 3);
      const masteryLevel = attempts > 0 ? (threeStarSessions.length / attempts) * 100 : null;

      let avgStars = 0;
      if (avgScore !== null) {
        if (avgScore >= 0.81) avgStars = 3;       // 81% for 3 stars
        else if (avgScore >= 0.6) avgStars = 2;   // 60% for 2 stars  
        else if (avgScore >= 0.44) avgStars = 1;  // 44% for 1 star
        else avgStars = 0;
      }

      setSessionStats({
        attempts,
        avgStars,
        lastStars,
        avgScore,
        lastScore,
        lastSpeed,
        masteryLevel,
        sessions,
      });
    } catch (err) {
      console.error('❌ Failed to fetch session stats:', err);
      setSessionStats({
        attempts: 0,
        avgStars: 0,
        lastStars: 0,
        avgScore: null,
        lastScore: null,
        lastSpeed: null,
        masteryLevel: null,
        sessions: [],
      });
    }
  }




  
  useEffect(() => {
    if (user?.id && selectedNoteId) {
      fetchSessionStats(user.id, selectedNoteId);
    }
  }, [user?.id, selectedNoteId]);




  // ✅ Create and immediately select + highlight new note
  const handleCreateNote = async () => {
    try {
      const res = await fetch(`/api/notes?userId=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          title: 'Untitled Note',
          content: '',
          word_count: 0,
        }),

      });
      if (!res.ok) throw new Error('Failed to create note');
      const created = await res.json();

      setExternalNotes((prev) => [created, ...prev]);
      setSelectedNoteId(created.id);
      setHighlightedNoteId(created.id);
      setTimeout(() => setHighlightedNoteId(null), 2000);
    } catch (err) {
      console.error('Create note failed:', err);
    }
  };

  console.log('[🔁 notes updated]', notes);


  /* ────────────────────────────────────────────────
  🧠 6. Local Editable State (updated to re-run on note title/content change)
  ──────────────────────────────────────────────── */
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');

  useEffect(() => {
    setLocalTitle(selectedNote?.title || '');
    setLocalContent(selectedNote?.content || '');
  }, [selectedNote?.title, selectedNote?.content]);

  /* ────────────────────────────────────────────────
  💾 7. Manual Save Button Logic
  ──────────────────────────────────────────────── */
  const [saveStatus, setSaveStatus] = useState('');
  const [lastSaved, setLastSaved] = useState(Date.now());

  const handleSave = async () => {
    if (!selectedNoteId) return;
    await updateNote(selectedNoteId, {
      title: localTitle,
      content: localContent,
    });
    setSaveStatus(`Note ${selectedNoteId} saved`);
    setLastSaved(Date.now());
    setTimeout(() => setSaveStatus(''), 2000);
  };

    /* ⌨️ Manual Save Shortcut (Ctrl+S) */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
        console.log(`[💾 Ctrl+S] Note ${selectedNoteId} saved`);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNoteId, localTitle, localContent]);

    /* ────────────────────────────────────────────────
    upload notes
  ──────────────────────────────────────────────── */

  const handleUploadNote = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (localContent.trim().length > 0) {
      alert("Please clear the note content before uploading a file.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Upload failed");
      }

      const data = await res.json();

      if (data?.text) {
        setLocalContent(data.text);
        console.log("✅ Uploaded file converted to text:", data.fileName);
        console.log(`   Cleaned ${data.cleanedLength} characters from ${data.rawLength} original`);
      } else {
        alert(data?.error || "Upload failed.");
      }
    } catch (error) {
      console.error("❌ File upload error:", error);
      alert(`Upload failed: ${error.message}`);
    }
  };


/* ────────────────────────────────────────────────
👁️ 11. View Mode (list/card toggle)
──────────────────────────────────────────────── */
  const [viewMode, setViewMode] = useState('list');

  const [text, setText] = useState('');

  const liveWordCount = localContent.trim().split(/\s+/).filter(Boolean).length;
  const totalWordCount = notes?.reduce((sum, note) => {
    const wordCount = note.word_count ?? note.content?.split(/\s+/).filter(Boolean).length ?? 0;
    return sum + wordCount;
  }, 0);


  const [timeLimit, setTimeLimit] = useState(getTimeLimit());
  const [durationInput, setDurationInput] = useState(
    formatTime(getTimeLimit())
  );
  
  // Track original time and confirmation message
  const [originalTimeLimit, setOriginalTimeLimit] = useState(getTimeLimit());
  const [defaultSetMessage, setDefaultSetMessage] = useState('');




  // Difficulty state
  const [difficulty, setDifficulty] = useState({
    level: "N/A",
    wpmLoad: null,
  });

  // Word count
  const wordCount = selectedNote?.word_count ?? 0;

  // Compute effective time limit
  const effectiveTimeLimitSeconds = toggles.timeLimit ? timeLimit : undefined;

  // Recalculate whenever inputs change
  useEffect(() => {
    if (!selectedNote) {
      setDifficulty({ level: "N/A", wpmLoad: null });
      return;
    }

    const currentWordCount = selectedNote.word_count ?? 0;
    const diff = getDifficultyLevel(currentWordCount, effectiveTimeLimitSeconds);
    setDifficulty(diff);
  }, [selectedNote, effectiveTimeLimitSeconds]);

  const { level, wpmLoad } = difficulty;

  const refresh = searchParams.get("refresh");

  useEffect(() => {
    if (user?.id && selectedNoteId) {
      fetchSessionStats(user.id, selectedNoteId);

    }
  }, [user?.id, selectedNoteId, refresh]);


    function triggerUploadDisabledMessage() {
      setShowUploadDisabledMsg(true);
      setTimeout(() => setShowUploadDisabledMsg(false), 5000);
    }


  const [showUploadDisabledMsg, setShowUploadDisabledMsg] = useState(false);




  return (
    <section className="relative flex h-[calc(100vh-80px)] overflow-hidden bg-white text-black">
      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
        <div className="relative bg-white rounded-lg w-[767px] p-10 shadow-2xl text-black">
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-xl text-gray-600 hover:text-black"
              title="Close Session Settings"
            >
              ×
            </button>

            {/* Toggles + Text */}
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-6">
                {['hints', 'timeLimit'].map((key) => (
                  <div key={key} className="flex items-center gap-5">
                    <span className="text-md font-medium capitalize">
                      {key === 'timeLimit'
                        ? 'Time Limit'
                        : 'Allow Hints'}
                    </span>
                    <label 
                      className="relative inline-flex items-center cursor-pointer"
                      title={key === 'timeLimit' 
                        ? 'Enable time limit for study sessions' 
                        : 'Allow access to hints during study sessions'}
                    >
                      <input
                        type="checkbox"
                        checked={toggles[key]}
                        onChange={() => toggleSwitch(key)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#C170FF] transition duration-200"></div>
                      <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 peer-checked:translate-x-5"></div>
                    </label>
                  </div>
                ))}

              </div>

              <p className="italic text-sm text-gray-600 text-justify max-w-[500px]">
                How This Works:<br />
                - You’ll try to recall your note from memory.<br />
                - Type as much as you remember in the box.<br />
                - Use “Open Notes” if hints are allowed.<br />
                - Press “Finish Session” when done or wait for time to run out.<br />
                - Your similarity score and stats will appear afterward!
              </p>

            </div>




            {/* Stats Row */}
            <div className="grid grid-cols-5 gap-8 text-center mb-8">

              {/* Recall Session Duration */}
              <div className="flex flex-col items-center">
                <span className="text-sm text-[#979797] mb-2">Recall Session Duration</span>
                <div className="flex flex-col items-center">
                  {!toggles.timeLimit ? (
                    <p className="text-xl font-semibold">Unlimited</p>
                  ) : (
                    <div className="flex flex-col items-center">
                      {/* Time Input with Incrementors */}
                      <div className="flex items-center gap-1 mb-2">
                        {/* Hours */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              const parts = durationInput.split(':').map(Number);
                              parts[0] = Math.min(23, parts[0] + 1);
                              setDurationInput(parts.map(p => p.toString().padStart(2, '0')).join(':'));
                            }}
                            className="text-xs text-gray-600 hover:text-purple-600 px-1"
                          >
                            ▲
                          </button>
                          <input
                            type="text"
                            value={durationInput.split(':')[0]}
                            onChange={(e) => {
                              const parts = durationInput.split(':');
                              parts[0] = e.target.value.padStart(2, '0');
                              setDurationInput(parts.join(':'));
                            }}
                            className="text-lg font-semibold text-center w-8 border-b border-gray-300 outline-none"
                            maxLength="2"
                          />
                          <button
                            onClick={() => {
                              const parts = durationInput.split(':').map(Number);
                              parts[0] = Math.max(0, parts[0] - 1);
                              setDurationInput(parts.map(p => p.toString().padStart(2, '0')).join(':'));
                            }}
                            className="text-xs text-gray-600 hover:text-purple-600 px-1"
                          >
                            ▼
                          </button>
                          <span className="text-xs text-gray-500 mt-1">h</span>
                        </div>
                        
                        <span className="text-lg font-semibold mx-1">:</span>
                        
                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              const parts = durationInput.split(':').map(Number);
                              parts[1] = Math.min(59, parts[1] + 1);
                              setDurationInput(parts.map(p => p.toString().padStart(2, '0')).join(':'));
                            }}
                            className="text-xs text-gray-600 hover:text-purple-600 px-1"
                          >
                            ▲
                          </button>
                          <input
                            type="text"
                            value={durationInput.split(':')[1]}
                            onChange={(e) => {
                              const parts = durationInput.split(':');
                              parts[1] = e.target.value.padStart(2, '0');
                              setDurationInput(parts.join(':'));
                            }}
                            className="text-lg font-semibold text-center w-8 border-b border-gray-300 outline-none"
                            maxLength="2"
                          />
                          <button
                            onClick={() => {
                              const parts = durationInput.split(':').map(Number);
                              parts[1] = Math.max(0, parts[1] - 1);
                              setDurationInput(parts.map(p => p.toString().padStart(2, '0')).join(':'));
                            }}
                            className="text-xs text-gray-600 hover:text-purple-600 px-1"
                          >
                            ▼
                          </button>
                          <span className="text-xs text-gray-500 mt-1">m</span>
                        </div>
                        
                        <span className="text-lg font-semibold mx-1">:</span>
                        
                        {/* Seconds */}
                        <div className="flex flex-col items-center">
                          <button
                            onClick={() => {
                              const parts = durationInput.split(':').map(Number);
                              parts[2] = Math.min(59, parts[2] + 1);
                              setDurationInput(parts.map(p => p.toString().padStart(2, '0')).join(':'));
                            }}
                            className="text-xs text-gray-600 hover:text-purple-600 px-1"
                          >
                            ▲
                          </button>
                          <input
                            type="text"
                            value={durationInput.split(':')[2]}
                            onChange={(e) => {
                              const parts = durationInput.split(':');
                              parts[2] = e.target.value.padStart(2, '0');
                              setDurationInput(parts.join(':'));
                            }}
                            className="text-lg font-semibold text-center w-8 border-b border-gray-300 outline-none"
                            maxLength="2"
                          />
                          <button
                            onClick={() => {
                              const parts = durationInput.split(':').map(Number);
                              parts[2] = Math.max(0, parts[2] - 1);
                              setDurationInput(parts.map(p => p.toString().padStart(2, '0')).join(':'));
                            }}
                            className="text-xs text-gray-600 hover:text-purple-600 px-1"
                          >
                            ▼
                          </button>
                          <span className="text-xs text-gray-500 mt-1">s</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex gap-2 text-xs">
                        {(() => {
                          const parts = durationInput.split(':').map(Number);
                          const currentTotalSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
                          const hasChanged = currentTotalSecs !== originalTimeLimit;
                          
                          return (
                            <>
                              <button
                                className={`underline hover:cursor-pointer hover:border-b transition ${
                                  hasChanged 
                                    ? 'text-[#C170FF] hover:text-[#A229FF] hover:border-[#A229FF]' 
                                    : 'text-gray-400 cursor-not-allowed'
                                }`}
                                onClick={() => {
                                  if (hasChanged) {
                                    setTimeLimit(currentTotalSecs);
                                  }
                                }}
                                disabled={!hasChanged}
                                title={hasChanged ? "Apply this time limit for the current session only" : "No changes to apply"}
                              >
                                Apply
                              </button>
                              {hasChanged && (
                                <button
                                  className="text-[#C170FF] underline hover:text-[#A229FF] hover:cursor-pointer hover:border-b hover:border-[#A229FF]"
                                  onClick={() => {
                                    saveTimeLimit(currentTotalSecs);
                                    setTimeLimit(currentTotalSecs);
                                    setOriginalTimeLimit(currentTotalSecs);
                                    
                                    // Show confirmation message
                                    const hours = Math.floor(currentTotalSecs / 3600);
                                    const minutes = Math.floor((currentTotalSecs % 3600) / 60);
                                    const seconds = currentTotalSecs % 60;
                                    
                                    let timeText = '';
                                    if (hours > 0) timeText += `${hours} hour${hours !== 1 ? 's' : ''} `;
                                    if (minutes > 0) timeText += `${minutes} minute${minutes !== 1 ? 's' : ''} `;
                                    if (seconds > 0) timeText += `${seconds} second${seconds !== 1 ? 's' : ''}`;
                                    timeText = timeText.trim();
                                    
                                    setDefaultSetMessage(`${timeText} set as default`);
                                    setTimeout(() => setDefaultSetMessage(''), 3000);
                                  }}
                                  title="Save this as the default time limit for all future sessions"
                                >
                                  Set as Default
                                </button>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      
                      {/* Confirmation Message */}
                      {defaultSetMessage && (
                        <p className="text-xs text-green-600 mt-2 text-center">
                          {defaultSetMessage}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Word Count */}
              <div className="flex flex-col items-center" title="Total word count of the selected note">
                <span className="text-sm text-[#979797] mb-2">Note Word Count</span>
                <span className="text-xl font-semibold">
                  {Number.isFinite(wordCount) && wordCount > 0 ? wordCount : '—'}
                </span>
              </div>

              {/* Last Score (Stars) */}
              <div className="flex flex-col items-center" title="Star rating from your most recent study session">
                <span className="text-sm text-[#979797] mb-2">Last Score</span>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 mb-1">
                    {sessionStats?.lastStars && sessionStats.lastStars > 0 ? (
                      <>
                        {[1, 2, 3].map(starNum => (
                          <StarSlot 
                            key={starNum}
                            filled={starNum <= sessionStats.lastStars} 
                            size="1.2rem"
                          />
                        ))}
                      </>
                    ) : (
                      <>
                        {[1, 2, 3].map(starNum => (
                          <StarSlot 
                            key={starNum}
                            filled={false} 
                            size="1.2rem"
                          />
                        ))}
                      </>
                    )}
                  </div>
                  <p className="text-xs text-[#C170FF]">
                    {sessionStats.lastScore !== null
                      ? `${(sessionStats.lastScore * 100).toFixed(1)}% (based on SimCSE)`
                      : '— (based on SimCSE)'}
                  </p>
                </div>
              </div>

              {/* Last Speed (WPM) */}
              <div className="flex flex-col items-center" title="Words per minute from your most recent session">
                <span className="text-sm text-[#979797] mb-2">Last Speed (WPM)</span>
                <div className="flex flex-col items-center">
                  <p className="text-xl font-semibold">
                    {Number.isFinite(sessionStats?.sessions?.[0]?.wpm)
                      ? sessionStats.sessions[0].wpm.toFixed(1)
                      : '—'}
                  </p>
                  <p className="text-xs text-[#979797]">
                    {Number.isFinite(sessionStats?.sessions?.[0]?.duration_secs)
                      ? `(${formatTime(sessionStats.sessions[0].duration_secs)})`
                      : ''}
                  </p>
                </div>
              </div>

              {/* Difficulty */}
              <div className="flex flex-col items-center" title="Calculated difficulty level based on note length and session performance">
                <span className="text-sm text-[#979797] mb-2">Difficulty (estimate)</span>
                <div className="flex flex-col items-center">
                  <p className="text-xl font-semibold">
                    {difficulty.level}
                  </p>
                  {difficulty.wpmLoad !== null && (
                    <p className="text-xs text-[#C170FF]">
                      [ WPM required = {difficulty.wpmLoad.toFixed(1)} ]
                    </p>
                  )}
                </div>
              </div>

            </div>


            {/* Start Session Button */}
            <div className="flex justify-center">
              <button
                onClick={() => {
                  if (!selectedNoteId) {
                    alert("Please select a note first.");
                    return;
                  }

                  const selectedNote = notes.find((note) => note.id === selectedNoteId);

                  if (!selectedNote) {
                    alert("Selected note data not found.");
                    return;
                  }

                  try {
                    const encodedNote = encodeURIComponent(JSON.stringify({
                      id: selectedNote.id,
                      title: selectedNote.title,
                      content: selectedNote.content,
                    }));
                    console.log("[📤 Routing to session with note]", selectedNote);
                    router.push(
                      `/session?noteId=${selectedNote.id}` +
                      `&timeLimit=${toggles.timeLimit ? timeLimit : ''}` +
                      `&allowHints=${toggles.hints ? 1 : 0}`
                    );




                  } catch (err) {
                    console.error("❌ Failed to encode note:", err);
                    alert("Failed to start session. Please try again.");
                  }
                }}
                className="flex items-center gap-4 text-[#A229FF] bg-[#E9E9E9] px-8 py-4 text-lg font-semibold rounded-full border border-[#A229FF] shadow-md hover:shadow-lg"
                title="Start a new study session with the selected note"
              >
                <div className="w-[52px] h-[52px] rounded-full border-[4px] border-[#A229FF] bg-white flex items-center justify-center shadow">
                  <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[18px] border-t-transparent border-b-transparent border-l-[#A229FF] ml-1" />
                </div>
                Start Session
              </button>
            </div>

          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      {/* LEFT SIDEBAR */}
      <aside className="w-[320px] border-r border-[#D9D9D9] flex flex-col px-4 pt-4 overflow-hidden z-10">

        <div className="group cursor-pointer mb-4" onClick={handleCreateNote}>
          {/* Morphing Add Note Button Container */}
          <div className="relative transition-all duration-500 ease-out transform group-hover:scale-105 overflow-hidden rounded-full group-hover:rounded-full">
            {/* Base Button that expands */}
            <button
              className="w-full h-[40px] bg-white text-[#A229FF] border border-[#E0E0E0] rounded-full text-lg hover:bg-[#A229FF] hover:outline hover:outline-2 hover:outline-green-300 hover:text-white hover:border-green-300 active:scale-95 transition-all duration-500 ease-out group-hover:w-full shadow-[0_2px_6px_rgba(162,41,255,0.15)] group-hover:shadow-[0_4px_12px_rgba(162,41,255,0.1)] overflow-hidden flex items-center justify-center"
              title="Create New Note"
            >
              {/* Plus Symbol - disappears instantly on hover, reappears slowly after text is gone */}
              <div className="absolute text-2xl font-bold transition-all duration-[50ms] group-hover:duration-[50ms] group-hover:opacity-0 group-hover:scale-75 opacity-100 delay-0 group-hover:delay-0 [transition-delay:800ms] [transition-duration:700ms] z-10">
                +
              </div>
              
              {/* Text Content - starts hidden, fades and slides in */}
              <div className="absolute flex items-center justify-center h-full w-full transform -translate-x-[120px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-150">
                <span className="text-[#A229FF] group-hover:text-white font-bold text-base whitespace-nowrap flex items-center px-4">
                  <span className="mr-2">+</span>
                  <span>Create New Note</span>
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex justify-start gap-2 mb-2 text-[#6B6767] text-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded p-1 hover:bg-[#E5E7EB] ${viewMode === 'list' ? 'bg-[#F1E5FC]' : ''}`}
            title="List View"
          >
            ☰
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`rounded p-1 hover:bg-[#E5E7EB] ${viewMode === 'card' ? 'bg-[#F1E5FC]' : ''}`}
            title="Card View"
          >
            ⧉
          </button>
        </div>

        {/* Scrollable Notes */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#D8D8D8] scrollbar-track-transparent">
          {Array.isArray(notes) && (notes || []).length > 0 ? (
            [...notes]
              .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
              .map((note, index) => {
                const isSelected = note.id === selectedNoteId;
                const isHighlighted = note.id === highlightedNoteId;

                return (
                  <div
                    ref={index === 0 ? firstNoteRef : null}
                    key={note.id}
                    onClick={() => setSelectedNoteId(note.id)}
                    className={`group relative cursor-pointer transition duration-300 ${
                      isHighlighted ? 'bg-[#F5E8FF] animate-pulse' : ''
                    } ${
                      viewMode === 'card'
                        ? `relative flex flex-col justify-between h-[110px] rounded-xl px-4 py-3 mb-3 text-sm shadow-sm hover:bg-[#E5E7EB] hover:border-[#A229FF] ${
                            isSelected
                              ? 'border border-[#A229FF] bg-[#F5E8FF]'
                              : 'border border-[#E0E0E0] bg-white'
                          }`
                        : `flex justify-between items-center border-b border-gray-300 px-2 py-3 text-base hover:bg-[#E5E7EB] ${
                            isSelected ? 'bg-[#F5E8FF]' : ''
                          }`
                    }`}
                  >
                    {/* Card Content */}
                    <div className="flex-1 pr-6">
                      <h2 className={`font-semibold text-black truncate max-w-[180px] ${
                        viewMode === 'list' ? 'text-lg' : ''
                      }`}>
                        {note.title || 'Untitled'}
                      </h2>

                      {viewMode === 'card' && (
                        <div className="relative text-xs text-[#979797] mt-1 max-h-[3.8rem] overflow-hidden">
                          <p className="line-clamp-3 whitespace-pre-wrap">
                            {note.content || 'No content'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* LIST MODE: Date + Trash */}
                    {viewMode === 'list' && (
                      <div className="flex items-center gap-2 text-xs text-[#979797]">
                        <span>
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-900 w-6 h-6 rounded-full flex items-center justify-center"
                          title="Delete Note"
                        >
                          🗑️
                        </button>
                      </div>
                    )}

                    {/* CARD MODE: Trash top-right, date bottom-right */}
                    {viewMode === 'card' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNote(note.id);
                          }}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-900 w-6 h-6 rounded-full flex items-center justify-center"
                          title="Delete Note"
                        >
                          🗑️
                        </button>
                        <p className="absolute bottom-2 right-3 text-xs text-[#979797]">
                          {new Date(note.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </>
                    )}
                  </div>
                );

              })
          ) : (
            <p className="text-gray-400 text-sm mt-2">No notes available Click (+) to create a new note.</p>
          )}
        </div>
      </aside>


        {/* CENTER NOTE BLOCK */}
      <main className="relative flex-1 flex justify-center items-start px-4 py-10 overflow-hidden ">
        {/* PLAY BUTTON */}
        {selectedNoteId && (
          <div
            onClick={() => {
              if (!selectedNoteId) return;
              setShowModal(true);
            }}
            className="absolute top-[0px] left-[230px] z-20 group cursor-pointer"
          >
            {/* Morphing Button Container with Overflow Hidden for Masking */}
            <div className="relative transition-all duration-500 ease-out transform group-hover:scale-105 overflow-hidden rounded-full group-hover:rounded-full">
              {/* Base Circle that expands */}
              <div className="w-[76px] h-[76px] rounded-full border-[4px] bg-[#E9E9E9] border-[#A229FF] flex items-center justify-center transition-all duration-500 ease-out group-hover:w-[200px] shadow-[0_4px_10px_rgba(162,41,255,0.25)] group-hover:shadow-[0_8px_25px_rgba(162,41,255,0.15)] overflow-hidden">
                
                {/* Play Triangle - stays in place but shrinks */}
                <div className="absolute left-[26px] w-0 h-0 border-t-[16px] border-b-[16px] border-l-[28px] border-l-[#A229FF] border-t-transparent border-b-transparent transition-all duration-500 ease-out group-hover:scale-75 z-10" />
                
                {/* Text Content - starts hidden with fade and slide animation */}
                <div className="absolute flex items-center justify-start h-full w-full transform -translate-x-[120px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 ease-out delay-150">
                  <span className="text-[#A229FF] font-bold text-lg whitespace-nowrap flex items-center pl-[60px] pr-4">
                    <span>Start Session</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* White Center Card */}
        {/* White Center Card */}
        <div className="w-[763px] h-[780px] rounded-2xl shadow-md bg-white pt-[32px] pb-[32px] px-[46px] flex flex-col">
          {selectedNote ? (
            <>
              {/* TOP: scrollable content except Save row */}
              <div className="flex-1 overflow-y-auto mb-4">
                {/* Title row with Save button */}
                <div className="flex justify-between items-center mb-4">
                  <input
                    type="text"
                    value={localTitle}
                    onChange={(e) => setLocalTitle(e.target.value)}
                    className="text-2xl font-bold flex-1 outline-none mr-4"
                    placeholder="Note Title"
                  />
                  <div className="flex items-center gap-3 shrink-0">
                    {saveStatus && (
                      <p className="text-green-500 text-sm">{saveStatus}</p>
                    )}
                    {/* Only show Save button if there are changes */}
                    {(localTitle !== (selectedNote?.title || '') || localContent !== (selectedNote?.content || '')) && (
                      <button
                        onClick={handleSave}
                        className="text-xs px-3 py-1 rounded-full bg-[#C170FF] text-white shadow hover:brightness-110 transition-all duration-200"
                        title="Save Note (Ctrl+S)"
                      >
                        Save
                      </button>
                    )}
                  </div>
                </div>

                {localContent.trim().length === 0 ? (
                  <input
                    type="file"
                    accept=".pdf,.docx,.txt"
                    onChange={handleUploadNote}
                    className="mb-4 block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 
                      file:rounded-full file:border-0 
                      file:text-sm file:font-semibold 
                      file:bg-[#C170FF] file:text-white 
                      hover:file:bg-[#A229FF] cursor-pointer"
                    title="Upload PDF, DOCX, or TXT file"
                  />
                ) : (
                  showUploadDisabledMsg && (
                    <p className="mb-4 text-sm text-gray-400">
                      ✨ File upload disabled while typing. Delete all text to re-enable.
                    </p>
                  )
                )}

                <textarea
                  value={localContent}
                  onChange={(e) => {
                    setLocalContent(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      triggerUploadDisabledMessage();
                    }
                  }}
                  placeholder="Start typing here..."
                  className="w-full min-h-[600px] resize-none outline-none text-base leading-relaxed bg-transparent"
                />
              </div>
            </>
          ) : (
            <div className="text-gray-400 text-center text-xl py-20">
              Select a note to begin.
            </div>
          )}
        </div>


      </main>




      {/* RIGHT PANEL */}
      {/* RIGHT PANEL */}
      <aside className="w-[360px] bg-[#F8F8F8] p-4 flex flex-col text-center text-sm text-black overflow-hidden">
        <div className="bg-[#F8F8F8] rounded-xl p-4 mb-4">
          <div className="grid grid-cols-2 gap-6 text-xs">
            {/* Word Count */}
            <div className="text-center" title="Total word count of the selected note">
              <p className="text-sm text-[#979797] mb-2">Note Word Count</p>
              <p className="text-2xl font-semibold">
                {Number.isFinite(wordCount) && wordCount > 0 ? wordCount : '—'}
              </p>
            </div>

            {/* Attempts Made */}
            <div className="text-center" title="Total number of study sessions completed for this note">
              <p className="text-sm text-[#979797] mb-2">Attempts Made</p>
              <p className="text-2xl font-semibold">
                {sessionStats?.attempts ?? 0}
              </p>
            </div>

            {/* Last Session */}
            <div className="text-center" title="Date and time of your most recent study session">
              <p className="text-sm text-[#979797] mb-2">Last Session</p>
              <div className="text-lg font-semibold">
                {sessionStats?.sessions?.[0]?.created_at ? (
                  <>
                    <div className="text-base">
                      {new Date(sessionStats.sessions[0].created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-[#979797] mt-1">
                      {new Date(sessionStats.sessions[0].created_at).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </div>
                  </>
                ) : (
                  <span className="text-base">—</span>
                )}
              </div>
            </div>

            {/* Last Speed (WPM) */}
            <div className="text-center" title="Words per minute from your most recent session">
              <p className="text-sm text-[#979797] mb-2">Last Speed (WPM)</p>
              <p className="text-2xl font-semibold">
                {Number.isFinite(sessionStats?.sessions?.[0]?.wpm)
                  ? sessionStats.sessions[0].wpm.toFixed(1)
                  : '—'}
              </p>
            </div>
          </div>

          {/* Average Score & Mastery Level - Bottom Section */}
          <div className="mt-6 pt-4 border-t border-[#E0E0E0]">
            <div className="grid grid-cols-2 gap-4">
              {/* Average Score */}
              <div className="text-center" title="Average star rating across all sessions for this note">
                <p className="text-sm text-[#979797] mb-2">Average Score</p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {sessionStats.avgStars === 0 ? (
                    <span className="text-xl font-semibold">—</span>
                  ) : (
                    <>
                      {[1, 2, 3].map(starNum => (
                        <StarSlot 
                          key={starNum}
                          filled={starNum <= sessionStats.avgStars} 
                          size="1.5rem"
                        />
                      ))}
                    </>
                  )}
                </div>
                <p className="text-xs text-[#979797]">
                  {sessionStats.avgScore !== null
                    ? `${(sessionStats.avgScore * 100).toFixed(1)}%`
                    : ''}
                </p>
              </div>

              {/* Mastery Level */}
              <div className="text-center" title="Percentage of your sessions that achieved 3 stars (mastery level)">
                <p className="text-sm text-[#979797] mb-2">Mastery Level</p>
                <div className="flex items-center justify-center gap-1 mb-1">
                  {sessionStats.masteryLevel === null ? (
                    <span className="text-xl font-semibold">—</span>
                  ) : (
                    <span className="text-xl font-semibold text-yellow-500">
                      {sessionStats.masteryLevel.toFixed(0)}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#979797]">
                  3-star sessions
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-4">
            {/* <button className="bg-[#C170FF] text-white px-3 py-1 text-xs rounded-full">
              session only
            </button>
            <button className="bg-[#E0E0E0] text-[#696969] px-3 py-1 text-xs rounded-full">
              all sessions
            </button> */}
          </div>

          <div className="w-full h-60 bg-[#F8F8F8] border border-[#D9D9D9] rounded flex items-center justify-center text-[#979797]">
            {selectedNoteId && (sessionStats?.sessions?.length > 0) ? (
              <LineChart
                data={sessionStats.sessions.map((s, i) => ({
                  id: s.id,
                  similarity: s.similarity,
                  trial: i + 1,
                  created_at: s.created_at,
                }))}
                highlightId={sessionStats.sessions?.[0]?.id || null}
                pointSize={1.5}
              />
            ) : (
              <span className="text-gray-400 text-xs">No sessions available for this note.</span>
            )}

          </div>
        </div>
      </aside>


    </section>
  );
}
