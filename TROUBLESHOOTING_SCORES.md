# Troubleshooting Low Scores - Complete Checklist

## ⚡ Quick Diagnosis (30 seconds)

When you run a session, **open browser Developer Tools (F12)** and look at the **Console** tab during page load.

You should see a box like this:

```
🔧 SimCSE Status Check
📍 URL: http://localhost:5000/score
📊 Reachable: ✅ YES
🧪 Test Score: 0.9548 (expected: ~0.95+)
💡 Recommendation: Server is running correctly
```

### ✅ IF YOU SEE THIS:
- **Good news!** Your SimCSE server is running correctly
- Scores should be HIGH (0.7-0.95 for good answers)
- If scores are still low, the problem is your *answer quality*, not the server
- **Next step**: See "Answer Quality Tips" below

### ❌ IF YOU SEE THIS:
```
📊 Reachable: ❌ NO
💡 Recommendation: Start SimCSE server with: python simcse-api/run_server.py
```
- **Your scores will be LOW** (fallback method, 30-50% lower than actual)
- Go to **"Server Not Running"** section below
- **This is the most common issue!**

---

## 🚨 Issue 1: Low Scores (Server Not Running)

### Symptoms:
- Scores showing 0.2-0.5 range for answers that should be 0.8+
- Console shows `❌ Reachable: NO`
- Console shows message: `[⚠️ SimCSE API unavailable, using fallback similarity calculation]`

### Solution - Option A: Use Quick Startup Script (EASIEST)

**Windows:**
```bash
cd c:\Users\ASUS LAPTOP
START_BOTH.bat
```

This will:
1. Start SimCSE server on port 5000
2. Start Next.js app on port 3000
3. Set up environment properly

**Linux/Mac:**
```bash
cd ~
bash START_BOTH.sh
```

### Solution - Option B: Manual Startup (Two Terminals)

**Terminal 1 - Start SimCSE Server:**
```bash
cd c:\Users\ASUS LAPTOP\simcse-api
python run_server.py
```

Should see:
```
[INFO] Loading SimCSE model from: simcse-model
[INFO] Server running on http://localhost:5000
```

**Terminal 2 - Start Next.js App:**
```bash
cd c:\Users\ASUS LAPTOP\my-app
set NEXT_PUBLIC_SIMCSE_API_URL=http://localhost:5000/score
npm run dev
```

Should see:
```
> Local: http://localhost:3000
```

### Verification Steps:

1. **Check server is responding:**
   - Open browser to `http://localhost:5000/health`
   - Should show: `{"status": "ok"}`

2. **Run test in console (F12):**
   ```javascript
   fetch('http://localhost:5000/score', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       text1: 'The capital of France is Paris',
       text2: 'France capital Paris'
     })
   }).then(r => r.json()).then(d => console.log('Score:', d.similarity))
   ```
   
   **Expected result**: Score should be **0.95+** (very high)
   
   **If you see error**: Check that both servers are running

3. **Run actual session test:**
   - Open the app
   - Start a practice session
   - In Console (F12), you should now see:
     ```
     [✅ Score received from API] {similarity: 0.xxxx}
     [📋 Score Status] API method used. Similarity: 0.xxxx
     ```

---

## 🎯 Issue 2: Yellow Dot on Wrong Position

### Symptoms:
- In the session completion graph, yellow dot appears on Trial 1 instead of latest trial
- The "latest attempt" marker is in the wrong place

### Current Status:
This is being debugged. Console logging has been enhanced to show:
```
[🔆 Highlight Debug]
  savedSessionId: "abc123"
  retryGroupLastId: "abc123"
  allSessionGroupLength: 14
```

### Workaround:
- This is a visual display issue only
- Your actual scores and data are being saved correctly
- The score shown in the modal (big purple number) is correct for your attempt
- Check the console logs to verify which session is highlighted

### To Report This Issue:
Please screenshot the console output showing:
```
[🔆 Highlight Debug] { ... }
[📈 FinishModal Chart Data] { ... }
```

---

## 📊 Issue 3: Missing Date/Time on Hover

### Symptoms:
- Hover over graph points but no date/time appears
- Only score shows in tooltip

### Status: ✅ FIXED in latest update

**What was wrong:**
- Chart data wasn't including `created_at` timestamp
- Tooltip had nowhere to get date info from

**What's fixed:**
- `created_at` is now included in all chart data
- Hover now shows:
  - **Session Only view**: Time only (e.g., "3:45 PM")
  - **All Sessions view**: Full date and time (e.g., "Jul 18, 2026 at 3:45 PM")

**If still not working:**
- Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache: DevTools → Application → Clear site data

---

## 💭 Issue 4: Score Shows First Attempt Instead of Latest

### Symptoms:
- Modal shows score from first attempt, not current attempt
- Happens sometimes after clicking "Try Again"

### Root Causes:
1. Page wasn't reloaded after latest update
2. Browser cache showing old data
3. State management edge case (rare)

### Solutions:

1. **Hard refresh app (clears cache):**
   ```
   Ctrl+Shift+R (Windows)
   Cmd+Shift+R (Mac)
   ```

2. **Close and reopen browser tab**

3. **Verify in console after finishing session:**
   ```
   [🔆 Highlight Debug] { savedSessionId: "...", retryGroupLastId: "..." }
   ```
   Make sure both IDs match

---

## 🧪 Testing Your Scores Locally

### Method 1: Use Test Script

```bash
cd c:\Users\ASUS LAPTOP\simcse-api
python test_scoring.py
```

Follow the prompts to:
1. Test specific text pairs
2. See actual SimCSE scores
3. Understand what scores should be for your answers

Example:
```
Enter original text: The capital of France is Paris
Enter recollection text: France's capital is Paris
Similarity Score: 0.9852 ⭐⭐⭐
```

### Method 2: Browser Console Test

Open app, go to session page, then paste in Console (F12):

```javascript
// Check if server is running
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(d => console.log('Server status:', d))
  .catch(e => console.log('Server down:', e.message));

// Test a score
fetch('http://localhost:5000/score', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text1: 'Your original note text',
    text2: 'Your answer text'
  })
}).then(r => r.json()).then(d => console.log('Score:', d.similarity));
```

---

## 📈 Understanding Your Scores

### Why Scores Vary

**Same answer, different sessions?**
- SimCSE uses AI, slight variations are normal
- Typically ±0.02 variation is expected

**Score changes between test and app?**
- Make sure both text strings match exactly (case-sensitive)
- Check for extra spaces or punctuation

### Star Thresholds (Verified Correct)

| Score | Stars | Quality |
|---|---|---|
| ≥ 0.81 | ⭐⭐⭐ | Excellent understanding |
| 0.60-0.80 | ⭐⭐ | Good, minor gaps |
| 0.44-0.59 | ⭐ | Partial understanding |
| < 0.44 | ⭐ | Below threshold |

### Typical Scores for Different Scenarios

| Scenario | Expected Score |
|---|---|
| Word-for-word match | 0.98-1.00 |
| Good paraphrase | 0.85-0.95 |
| Same meaning, different words | 0.70-0.85 |
| Partially correct | 0.50-0.70 |
| Missing key concepts | 0.30-0.50 |
| Unrelated text | 0.00-0.30 |

---

## 🔧 Advanced Troubleshooting

### Check Ports Are Available

```bash
# Windows - Check if ports 3000 and 5000 are in use
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# If you see results, another app is using that port
# Kill the process or use a different port
```

### Check Environment Variables

Open app in browser, go to any page, console (F12):
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_SIMCSE_API_URL);
// Should show: http://localhost:5000/score (or your custom URL)
```

### Check Network Tab (F12)

When you submit a session:
1. Open DevTools → Network tab
2. Complete a practice session
3. Look for request to `localhost:5000/score`
4. Check if it succeeds (green) or fails (red)

**Success response should look like:**
```json
{
  "similarity": 0.8234
}
```

**Failure shows:**
```
ERR_CONNECTION_REFUSED (server not running)
or
timeout (server running but slow)
```

---

## 📞 If Nothing Works

**Gather this information and report:**

1. Screenshot of console diagnostic output:
   ```
   F12 → Console → Check what it says about server status
   ```

2. Screenshot of the low score in the modal

3. Run this command and share output:
   ```bash
   python c:\Users\ASUS LAPTOP\simcse-api\test_scoring.py
   # Type same note text as you used in app
   # Share the scores it shows
   ```

4. Check if SimCSE server is running:
   ```bash
   # Open new terminal and run:
   python c:\Users\ASUS LAPTOP\simcse-api\run_server.py
   # Share any error messages
   ```

5. Check if model file exists:
   ```bash
   ls c:\Users\ASUS LAPTOP\simcse-api\simcse-model
   # Should show: config.json, model.safetensors, tokenizer.json, vocab.txt
   # If missing, run: python c:\Users\ASUS LAPTOP\simcse-api\download_model.py
   ```

---

## ✅ Verification Checklist

- [ ] START_BOTH.bat is running (or manual servers started)
- [ ] Console shows `📊 Reachable: ✅ YES`
- [ ] Console shows test score like `0.9548`
- [ ] Tested with practice session
- [ ] Score shown in modal is reasonable for your answer
- [ ] Yellow dot appears on latest trial (graph should ascend)
- [ ] Hover over graph shows date/time
- [ ] Profile dashboard graph also shows correct data

**If all checked:** Your system is working correctly! 🎉

**If something failed:** Go back to the corresponding Issue section above.
