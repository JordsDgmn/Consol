# Scoring & Metadata Debugging Guide

## Quick Diagnostics

### 1. Check if SimCSE API is Available

Open your browser console and run:
```javascript
fetch('/api/simcse-diagnostic').then(r => r.json()).then(console.log);
```

**Expected output if API is working:**
```json
{
  "simcseUrl": "http://your-deployed-api:5000/score",
  "isConfigured": true,
  "reachable": true,
  "status": 200,
  "environment": "production"
}
```

**If API is NOT available** (shows `reachable: false`):
- App will use **Jaccard similarity** (word-overlap based)
- Jaccard scores are typically **20-30% lower** than SimCSE
- Example: Same answer might get 0.65 (Jaccard) vs 0.88 (SimCSE)

---

## Understanding Similarity Scores

### Score Calculation Methods

1. **SimCSE API** (Preferred - Semantic)
   - Uses transformer neural network
   - Scores range: 0.0 - 1.0
   - Typical range: 0.3 - 0.95 for most comparisons
   - **More accurate** but requires external API

2. **Jaccard Fallback** (Automatic - Word-overlap)
   - Counts word overlap: intersection / union
   - Formula: `common_words / total_unique_words`
   - Scores range: 0.0 - 1.0
   - Typical range: 0.2 - 0.7 for most comparisons
   - **Always available** but less accurate

### Star Assignment (Same for Both Methods)
```
Similarity ≥ 0.81  →  ⭐⭐⭐ (3 stars)
Similarity ≥ 0.60  →  ⭐⭐ (2 stars)
Similarity ≥ 0.44  →  ⭐ (1 star)
Similarity < 0.44  →  ⭐ (0 stars)
```

---

## Verify Your Recent Session

### Step 1: Open Browser Console
Press `F12` or `Ctrl+Shift+I` → Click **Console** tab

### Step 2: After Finishing a Practice Session
Look for console logs like:

**If using API (Good):**
```
[🔄 Attempting to fetch score from] http://localhost:5000/score
[✅ Score received from API] {similarity: 0.8234}
[📋 Score Status] API method used. Similarity: 0.8234
💾 Saved session: {id: 123, similarity: 0.8234, stars: 3}
```

**If using Fallback (Warning):**
```
[🔄 Attempting to fetch score from] http://localhost:5000/score
[⚠️ SimCSE API unavailable, using fallback similarity calculation] ...
[📊 Fallback similarity calculated] 0.6234
[📋 Score Status] Fallback method used. Similarity: 0.6234
💾 Saved session: {id: 123, similarity: 0.6234, stars: 2}
```

---

## Verify Metadata & Graph Display

### Check Session Data in Profile

1. Go to **Profile** page
2. Select a note with multiple attempts
3. Verify in console:
```javascript
// Check if trials display in chronological order
fetch('/api/sessions?userId=YOUR_USER_ID&noteId=YOUR_NOTE_ID')
  .then(r => r.json())
  .then(data => console.table(data.sessions.map(s => ({
    id: s.id,
    similarity: s.similarity,
    stars: s.stars,
    created_at: s.created_at
  }))));
```

**Expected output:**
- Sessions listed in **oldest-to-newest** order (ascending by created_at)
- Trial 1 should have the **earliest timestamp**
- Trial 2 should have **later timestamp**
- Graph should show line going **up/down based on actual performance**

---

## Production Issues & Solutions

### Issue: "Scores seem lower than before"

**Cause:** Probably using Jaccard fallback instead of SimCSE API

**Solutions:**
1. **Local Testing:** Start SimCSE API locally
   ```bash
   cd c:\Users\ASUS LAPTOP\simcse-api
   python server.py
   ```
   Then run app with `npm run dev`

2. **Production:** Deploy SimCSE to Render or AWS Lambda
   - Set `NEXT_PUBLIC_SIMCSE_API_URL` environment variable
   - Verify in /api/simcse-diagnostic endpoint

3. **Accept Fallback:** If API unavailable, Jaccard is fine
   - Scores will be 20-30% lower but **star assignments are correct**
   - Users just need to understand: 0.65 (Jaccard) = 2 stars, same as 0.75 (SimCSE)

### Issue: "Graph shows trials in wrong order"

**Status:** ✅ FIXED in latest build
- Applied `.reverse()` to chronological sorting
- Rebuild and restart to see effect

### Issue: "Stars don't match my score"

**Verification:**
- 0.81 or higher = 3 stars ✓
- 0.60 - 0.80 = 2 stars ✓
- 0.44 - 0.59 = 1 star ✓
- Below 0.44 = 0 stars ✓

If mismatch, check console logs for actual similarity value.

---

## Deployment Verification Checklist

- [ ] Can load https://consol.vercel.app without errors
- [ ] Can login and create a note
- [ ] Can practice and finish session
- [ ] Console shows `[📋 Score Status]` message (API or Fallback)
- [ ] Score matches star rating according to thresholds
- [ ] Graph shows trials in chronological order (1→2→3)
- [ ] Can upload file (PDF/DOCX/TXT) to create notes
- [ ] File text extracts correctly and shows in note content

---

## Quick Test Script

Run in browser console:
```javascript
console.log('🔍 Consol Diagnostics');

// 1. Check API
fetch('/api/simcse-diagnostic').then(r => r.json()).then(d => {
  console.log('SimCSE API Status:', d.reachable ? '✅ Available' : '❌ Not available');
  console.log('  Method:', d.environment);
});

// 2. Check latest session
const userId = new URLSearchParams(window.location.search).get('userId');
if (userId) {
  fetch(`/api/sessions?userId=${userId}`)
    .then(r => r.json())
    .then(d => console.log(`✅ ${d.sessions.length} sessions loaded`));
}

console.log('Check messages above ☝️');
```

---

## Support

If issues persist:
1. Check `/api/simcse-diagnostic` endpoint
2. Review browser console for `[📋 Score Status]` messages
3. Verify `NEXT_PUBLIC_SIMCSE_API_URL` is set in .env.local
4. Verify database connection with test query
