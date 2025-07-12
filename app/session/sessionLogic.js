

export const defaultSessionSettings = {
  allowHints: true,
  timeLimit: 600, // default in seconds
  showVerbatimTags: true,
};

export function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${hrs} : ${mins} : ${secs}`;
}

export function saveTimeLimit(seconds) {
  localStorage.setItem('defaultTimeLimit', seconds);
}

export function getTimeLimit() {
  if (typeof window === "undefined") {
    // Running on the server - return a default
    return defaultSessionSettings.timeLimit;
  }
  const stored = localStorage.getItem("defaultTimeLimit");
  return stored ? Number(stored) : defaultSessionSettings.timeLimit;
}

export function getDifficultyLevel(wordCount, timeLimitSeconds) {
  if (wordCount === 0) {
    return { level: "N/A", wpmLoad: null };
  }

  // UNLIMITED TIME
  if (!timeLimitSeconds) {
    // assign difficulty purely based on word count
    if (wordCount <= 150) return { level: "Easy", wpmLoad: null };
    else if (wordCount <= 300) return { level: "Moderate", wpmLoad: null };
    else if (wordCount <= 600) return { level: "Hard", wpmLoad: null };
    else return { level: "Very Hard", wpmLoad: null };
  }

  const timeMinutes = timeLimitSeconds / 60;
  const wpmLoad = wordCount / timeMinutes;

  let level;
  if (wpmLoad <= 25) level = "Easy";
  else if (wpmLoad <= 40) level = "Moderate";
  else if (wpmLoad <= 60) level = "Hard";
  else level = "Very Hard";

  return {
    level,
    wpmLoad: parseFloat(wpmLoad.toFixed(1))
  };
}




export async function saveSessionMetadata({
  user_id,
  note_id,
  similarity,
  stars,
  word_count,
  duration_secs,
  wpm,
}) {
  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id,
        note_id,
        similarity,
        stars,
        word_count,
        duration_secs,
        wpm,
      }),
    });

    if (!res.ok) throw new Error('Failed to save session');
    const saved = await res.json();
    console.log('[✅ Session saved]', saved);
  } catch (err) {
    console.error('[❌ Session save failed]', err);
  }
}
