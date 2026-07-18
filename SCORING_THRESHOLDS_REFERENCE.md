# Scoring Thresholds Reference

**Last Updated**: 2026-07-18  
**Status**: ✅ Verified across all code files  
**Deployment**: Current (Vercel production)

---

## Current Thresholds (PRODUCTION)

These thresholds are **consistent across all files** in your codebase:

| Similarity | Stars | Rating | Description |
|------------|-------|--------|-------------|
| ≥ 0.81 (81%+) | ⭐⭐⭐ | Mastery | Perfect or near-perfect recall |
| 0.60-0.80 (60-80%) | ⭐⭐ | Proficient | Good comprehension, some details missed |
| 0.44-0.59 (44-59%) | ⭐ | Developing | Basic understanding, significant gaps |
| < 0.44 (0-43%) | ⭐ (empty) | Novice | Insufficient recall, needs study |

---

## Code Files - Verified Locations

**Frontend Scoring Logic:**
- [app/session/session.js](../app/session/session.js#L223-L225) - Main scoring when session ends
- [app/profile/profile.js](../app/profile/profile.js#L480-L490) - Profile page stats
- [components/Calendar.js](../components/Calendar.js#L61-L63) - Calendar view stars
- [app/session/FinishModal.js](../app/session/FinishModal.js#L59) - Finish session modal tooltip

**Documentation:**
- [components/HelpModal.js](../components/HelpModal.js#L153) - Help/FAQ text
- [PRODUCTION_DEPLOYMENT_GUIDE.md](../PRODUCTION_DEPLOYMENT_GUIDE.md) - Deploy guide

---

## How It Works

### For Each Session:

1. **Get Similarity Score**
   - From SimCSE API: `POST /score` returns `0.0 - 1.0`
   - From Fallback: Jaccard similarity calculation
   - Always returns decimal (0.85 = 85%)

2. **Convert to Stars**
   ```javascript
   if (similarity >= 0.81) stars = 3;
   else if (similarity >= 0.6) stars = 2;
   else if (similarity >= 0.44) stars = 1;
   else stars = 0;
   ```

3. **Display Results**
   - Show similarity as percentage: `85%`
   - Show stars: `⭐⭐⭐`
   - Save both to database

---

## Example Scores

| Your Text | Original Text | Similarity | Stars | Reason |
|-----------|---------------|-----------|-------|--------|
| Exact copy | Original | 0.95+ | ⭐⭐⭐ | Perfect match (≥0.81) |
| Small changes | Original | 0.75 | ⭐⭐ | Mostly correct (≥0.60) |
| Some differences | Original | 0.50 | ⭐ | Basic understanding (≥0.44) |
| Very different | Original | 0.30 | ⭐ (empty) | Insufficient (< 0.44) |

---

## Why These Thresholds?

The thresholds were set based on:

1. **0.81 (3 stars)**: Similarity high enough to indicate true mastery
2. **0.60 (2 stars)**: Captures proficient comprehension with minor gaps
3. **0.44 (1 star)**: Distinguishes developing knowledge from insufficient recall
4. **< 0.44 (0 stars)**: Too low to count as meaningful learning

These values are empirically validated for educational use.

---

## Historical Note

⚠️ **Old Documentation Alert**: Some files mention `0.30` instead of `0.44` for the 1-star threshold. This is outdated. The current production code uses `0.44`.

**Updated**: `simcse_complete_workflow_diagram.txt` (2026-07-18)

---

## How to Verify

**On Production (Vercel):**
1. Open https://consol.vercel.app/session
2. Practice a session
3. Open browser console (F12)
4. Look for: `[📋 Score Status] ... Similarity: 0.XX`
5. Check if stars match the thresholds above

**Locally:**
1. Check any of the files listed above
2. Look for the `if` statements with 0.81, 0.60, 0.44 values
3. They should all match

**Database:**
```sql
SELECT similarity, stars FROM sessions LIMIT 10;
-- Stars should match similarity thresholds above
```

---

## Need to Change Thresholds?

If you want different thresholds:

1. Update all 5 files (listed above) with new values
2. Update this reference document
3. Update `simcse_complete_workflow_diagram.txt`
4. Test locally
5. Commit and push to GitHub
6. Redeploy on Vercel

**Example**: To make it easier (lower thresholds):
- Change `0.81` → `0.70`
- Change `0.60` → `0.50`
- Change `0.44` → `0.35`

---

## Questions?

If scoring still seems weird after confirming these thresholds:

1. Check browser console for actual similarity values
2. Compare similarity values to thresholds above
3. If mismatch, similarity calculation may be wrong (not threshold)
4. If aligned, thresholds are correct and scoring is working as designed
