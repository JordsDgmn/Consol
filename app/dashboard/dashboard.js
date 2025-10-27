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

  const toggleSwitch = (key) =>
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));

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

      const avgScore =
        attempts > 0
          ? sessions.reduce((sum, s) => sum + Number(s.similarity), 0) / attempts
          : null;

      let avgStars = 0;
      if (avgScore !== null) {
        if (avgScore >= 0.9) avgStars = 3;
        else if (avgScore >= 0.7) avgStars = 2;
        else if (avgScore >= 0.45) avgStars = 1;
        else avgStars = 0;
      }

      setSessionStats({
        attempts,
        avgStars,
        lastStars,
        avgScore,
        lastScore,
        lastSpeed,
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
      const res = await fetch("http://127.0.0.1:5000/upload-file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      if (data?.text) {
        setLocalContent(data.text);
        console.log("✅ Uploaded file converted to text:", data.text);
      } else {
        alert(data?.error || "Upload failed.");
      }
    } catch (error) {
      console.error("❌ File upload error:", error);
      alert("Upload failed. Make sure the backend server is running.");
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
            >
              ×
            </button>

            {/* Toggles + Text */}
            <div className="flex justify-between items-start mb-10">
              <div className="space-y-6">
                {['hints', 'timeLimit', 'verbatim'].map((key) => (
                  <div key={key} className="flex items-center gap-5">
                    <span className="text-md font-medium capitalize">
                      {key === 'timeLimit'
                        ? 'Time Limit'
                        : key === 'verbatim'
                        ? 'Verbatim Tags'
                        : 'Allow Hints'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
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
            <div className="flex justify-around text-center mb-8">

              {/* Recall Session Duration */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-[#979797]">Recall Session Duration</p>
                {!toggles.timeLimit ? (
                  <p className="text-2xl font-semibold mt-2">Unlimited</p>
                ) : (
                  <>
                    <input
                      type="text"
                      value={durationInput}
                      onChange={(e) => setDurationInput(e.target.value)}
                      className="text-2xl font-semibold text-center w-32 border-b border-black outline-none"
                    />
                    <div className="flex gap-2 mt-1 text-xs">
                      <button
                        className="text-[#C170FF] underline hover:text-[#A229FF] hover:cursor-pointer hover:border-b hover:border-[#A229FF]"
                        onClick={() => {
                          const parts = durationInput.split(':').map(Number);
                          const totalSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];

                          setTimeLimit(totalSecs);
                          // Save it into localStorage immediately
                          saveTimeLimit(totalSecs);
                        }}

                      >
                        Apply
                      </button>
                      <button
                        className="text-[#C170FF] underline hover:text-[#A229FF] hover:cursor-pointer hover:border-b hover:border-[#A229FF]"
                        onClick={() => {
                          const parts = durationInput.split(':').map(Number);
                          const totalSecs =
                            parts[0] * 3600 + parts[1] * 60 + parts[2];
                          saveTimeLimit(totalSecs);
                          setTimeLimit(totalSecs);
                        }}
                      >
                        Set as Default
                      </button>
                    </div>
                  </>
                )}
              </div>






              {/* Word Count */}
              <div>
                <p className="text-sm text-[#979797]">Note Word Count</p>
                <p className="text-2xl font-semibold">
                  {Number.isFinite(wordCount) && wordCount > 0 ? wordCount : '❓'}
                </p>

              </div>

              {/* Last Score (Stars) */}
              <div>
                <p className="text-sm text-[#979797]">Last Score</p>
                <div className="text-2xl font-semibold flex items-center gap-1">
                  {sessionStats?.lastStars && sessionStats.lastStars > 0 ? (
                    <>
                      {[1, 2, 3].map(starNum => (
                        <StarSlot 
                          key={starNum}
                          filled={starNum <= sessionStats.lastStars} 
                          size="1.5rem"
                        />
                      ))}
                    </>
                  ) : (
                    <StarSlot filled={false} size="1.5rem" />
                  )}
                </div>
                <p className="text-xs text-[#C170FF]">
                  {sessionStats.lastScore !== null
                    ? `${(sessionStats.lastScore * 100).toFixed(1)}%`
                    : '—'}{" "}
                  (based on SimCSE)
                </p>
              </div>

              {/* WPM */}
              <div>
                <p className="text-sm text-[#979797] mt-4">Last Speed (WPM)</p>
                <p className="text-xl font-semibold">
                  {Number.isFinite(sessionStats?.sessions?.[0]?.wpm)
                    ? sessionStats.sessions[0].wpm.toFixed(1)
                    : '⏱️'}
                </p>
                <p className="text-xs text-[#979797]">
                  {Number.isFinite(sessionStats?.sessions?.[0]?.duration_secs)
                    ? `(${formatTime(sessionStats.sessions[0].duration_secs)})`
                    : ''}
                </p>

              </div>

              {/* Difficulty Score */}
              
              <div>
                <p className="text-sm text-[#979797]">Difficulty</p>
                <p className="text-xl font-semibold">
                  Difficulty: {difficulty.level}
                </p>

                {difficulty.wpmLoad !== null && (
                  <p className="text-xs text-[#C170FF]">
                    [ WPM required = {difficulty.wpmLoad} ]
                  </p>
                )}
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

        <button
          onClick={handleCreateNote}
          className="w-full bg-white text-[#A229FF] border border-[#E0E0E0] rounded-full py-1 text-lg mb-4 hover:bg-[#A229FF] hover:outline hover:outline-2 hover:outline-green-300 hover:text-white hover:border-green-300 active:scale-95 transition"
        >
          +
        </button>

        {/* Toggles */}
        <div className="flex justify-start gap-2 mb-2 text-[#6B6767] text-xl">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded p-1 hover:bg-[#E5E7EB] ${viewMode === 'list' ? 'bg-[#F1E5FC]' : ''}`}
          >
            ☰
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`rounded p-1 hover:bg-[#E5E7EB] ${viewMode === 'card' ? 'bg-[#F1E5FC]' : ''}`}
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
                        : `flex justify-between items-center border-b border-gray-300 px-2 py-2 hover:bg-[#E5E7EB] ${
                            isSelected ? 'bg-[#F5E8FF]' : ''
                          }`
                    }`}
                  >
                    {/* Card Content */}
                    <div className="flex-1 pr-6">
                      <h2 className="font-semibold text-black truncate max-w-[180px]">
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
        <div
          onClick={() => {
            if (!selectedNoteId) return;
            setShowModal(true);
          }}
          className={`absolute top-[0px] left-[230px] z-20 w-[76px] h-[76px] rounded-full border-[4px] flex items-center justify-center transition shadow-[0_4px_10px_rgba(0,0,0,0.25)]
            ${selectedNoteId
              ? 'bg-[#E9E9E9] border-[#A229FF] cursor-pointer hover:scale-105 '
              : 'bg-gray-200 border-gray-400 cursor-not-allowed opacity-50'}
          `}
        >
          <div
            className={`w-0 h-0 border-t-[16px] border-b-[16px] ml-1
              ${selectedNoteId
                ? 'border-l-[28px] border-l-[#A229FF] border-t-transparent border-b-transparent'
                : 'border-l-[28px] border-l-gray-500 border-t-transparent border-b-transparent'}
            `}
          />
        </div>


        {/* White Center Card */}
        {/* White Center Card */}
        <div className="w-[763px] h-[780px] rounded-2xl shadow-md bg-white pt-[32px] pb-[32px] px-[46px] flex flex-col">
          {selectedNote ? (
            <>
              {/* TOP: scrollable content except Save row */}
              <div className="flex-1 overflow-y-auto mb-4">
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  className="text-2xl font-bold mb-4 w-full outline-none"
                  placeholder="Note Title"
                />

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

              {/* Save Row: Fixed below text area */}
              <div className="flex justify-between items-center mt-4 h-7">
                <button
                  onClick={handleSave}
                  className="text-xs px-3 py-1 rounded-full bg-[#C170FF] text-white shadow hover:brightness-110"
                >
                  Save
                </button>
                {saveStatus && (
                  <p className="text-green-500 text-sm">{saveStatus}</p>
                )}
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
            <div className="text-center">
              <p className="text-sm text-[#979797] mb-2">Note Word Count</p>
              <p className="text-2xl font-semibold">
                {Number.isFinite(wordCount) && wordCount > 0 ? wordCount : '❓'}
              </p>
            </div>

            {/* Attempts Made */}
            <div className="text-center">
              <p className="text-sm text-[#979797] mb-2">Attempts Made</p>
              <p className="text-2xl font-semibold">
                {sessionStats?.attempts ?? '__'}
              </p>
            </div>

            {/* Last Session */}
            <div className="text-center">
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
            <div className="text-center">
              <p className="text-sm text-[#979797] mb-2">Last Speed (WPM)</p>
              <p className="text-2xl font-semibold">
                {Number.isFinite(sessionStats?.sessions?.[0]?.wpm)
                  ? sessionStats.sessions[0].wpm.toFixed(1)
                  : '⏱️'}
              </p>
            </div>
          </div>

          {/* Average Score - Bottom Section */}
          <div className="mt-6 pt-4 border-t border-[#E0E0E0]">
            <div className="text-center">
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
