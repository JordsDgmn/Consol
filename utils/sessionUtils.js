export function groupSessionsByNoteAndTime(sessions) {
  const sessionOnly = {};
  const allSessions = {};

  // Group all sessions by note_id
  sessions.forEach(session => {
    const { note_id } = session;

    if (!allSessions[note_id]) allSessions[note_id] = [];
    allSessions[note_id].push(session);
  });

  // For sessionOnly, group sessions by session_group_id and show only the most recent group
  for (const noteId in allSessions) {
    const sorted = allSessions[noteId].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    // Group sessions by session_group_id
    const groupMap = {};
    sorted.forEach(session => {
      const groupId = session.session_group_id || `single_${session.id}`;
      if (!groupMap[groupId]) {
        groupMap[groupId] = [];
      }
      groupMap[groupId].push(session);
    });
    
    // Sort groups by most recent session and take only the most recent group (current retry sequence)
    const groups = Object.values(groupMap)
      .map(group => group.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)))
      .sort((groupA, groupB) => 
        new Date(groupB[groupB.length - 1].created_at) - new Date(groupA[groupA.length - 1].created_at)
      );
    
    // Only include the most recent group (current retry sequence)
    sessionOnly[noteId] = groups.length > 0 ? [groups[0]] : [];
  }

  return { allSessions, sessionOnly };
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
