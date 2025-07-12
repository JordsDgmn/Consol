export function computeRadarStats(sessions, originalWordCount = 100) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return [0, 0, 0];
  }

  // 1. Comprehension (average similarity)
  const avgSimilarity =
    sessions.reduce((acc, s) => acc + (s.similarity || 0), 0) /
    sessions.length;

  // 2. Speed (normalized WPM * efficiency factor)
  const totalWords = sessions.reduce((acc, s) => acc + (s.word_count || 0), 0);
  const totalTime = sessions.reduce((acc, s) => acc + (s.duration_secs || 0), 0);
  const rawWPM = totalTime > 0 ? (totalWords / totalTime) * 60 : 0;

  const avgNoteLength = originalWordCount || 100;
  const avgCoverageRatio = Math.min(totalWords / (avgNoteLength * sessions.length), 1);
  const normalizedSpeed = Math.min((rawWPM * avgCoverageRatio) / 3, 1); // capped then normalized

  // 3. Mastery (consistency of 3-star finishes)
  const threeStarCount = sessions.filter((s) => s.stars === 3).length;
  const masteryRatio = Math.min(threeStarCount / sessions.length, 1);

  // Final normalization to 0–100
  return [
    Math.round(avgSimilarity * 100),      // Comprehension
    Math.round(normalizedSpeed * 100),    // Speed
    Math.round(masteryRatio * 100),       // Mastery
  ];
}
