export function groupSessionsByNoteAndTime(sessions) {
  const sessionOnly = {};
  const allSessions = {};

  // Group all sessions by note_id
  sessions.forEach(session => {
    const { note_id, created_at } = session;

    if (!allSessions[note_id]) allSessions[note_id] = [];
    allSessions[note_id].push(session);
  });

  // Sort and group consecutive ones
  for (const noteId in allSessions) {
    const sorted = allSessions[noteId].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    const groups = [];
    let group = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].created_at);
      const curr = new Date(sorted[i].created_at);
      const diff = (curr - prev) / 1000; // in seconds

      // Check if there was an intentional session end between these sessions
      const wasSessionEndedBetween = checkForSessionEndBetween(prev, curr, noteId);

      if (diff <= 300 && !wasSessionEndedBetween) {
        group.push(sorted[i]);
      } else {
        groups.push(group);
        group = [sorted[i]];
      }
    }
    groups.push(group);
    sessionOnly[noteId] = groups;
  }

  return { allSessions, sessionOnly };
}

function checkForSessionEndBetween(prevTime, currTime, noteId) {
  try {
    const lastSessionEnd = localStorage.getItem('lastSessionEnd');
    if (!lastSessionEnd) return false;

    const sessionEndData = JSON.parse(lastSessionEnd);
    if (sessionEndData.noteId !== noteId) return false;

    const endTime = new Date(sessionEndData.endTime);
    
    // Check if the session end happened between these two sessions
    return endTime > prevTime && endTime < currTime;
  } catch (error) {
    console.warn('Error checking session end:', error);
    return false;
  }
}



// Stat Criteria:

export function computeRadarStats({ session, allSessionsForUser = [], originalNoteWordCount = 100 }) {
  if (!session) return { speed: 0, comprehension: 0, mastery: 0 };

  const { word_count, duration_secs, similarity, note_id, stars } = session;

  // ---- SPEED ----
  // Formula: WPM * completeness ratio, normalized
  const baseSpeed = word_count / duration_secs || 0;
  const completenessRatio = word_count / originalNoteWordCount || 0;
  const adjustedSpeed = baseSpeed * completenessRatio;
  const normalizedSpeed = Math.min((adjustedSpeed / 5) * 100, 100); // capped

  // ---- COMPREHENSION ----
  const normalizedComprehension = (similarity || 0) * 100;

  // ---- MASTERY ----
  const totalSessions = allSessionsForUser.length || 1;
  const threeStars = allSessionsForUser.filter(s => s.stars === 3 && s.note_id === note_id).length;
  const masteryRatio = threeStars / totalSessions;
  const normalizedMastery = masteryRatio * 100;

  return {
    speed: Math.round(normalizedSpeed),
    comprehension: Math.round(normalizedComprehension),
    mastery: Math.round(normalizedMastery),
  };
}
