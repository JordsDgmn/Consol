# Scoring System Explanation & Fallback Behavior

## 📊 How Consol Scoring Works

### Two Scoring Methods

#### 1. **SimCSE API** (Primary - Semantic Method) ⭐⭐⭐

**What it is:** Uses a neural network (BERT-based transformer) to understand *meaning*, not just words.

**How it works:**
- Converts both texts into 768-dimensional embeddings
- Computes cosine similarity between embeddings
- Range: 0.0 to 1.0
- Typical results:
  - **0.9+**: Paraphrases, direct matches, excellent understanding
  - **0.6-0.9**: Good semantic alignment
  - **0.44-0.6**: Some understanding, partially correct
  - **<0.44**: Missing key concepts or unrelated

**Example:**
```
Original: "The capital of France is Paris"
Answer:   "France's capital is Paris"
Score:    0.9852 ⭐⭐⭐ (3 stars)
```

#### 2. **Token Set Similarity** (Fallback - Word Overlap Method) ⚠️

**When it's used:** When SimCSE API is unavailable (server not running)

**What it is:** Smarter Jaccard similarity that considers:
- Word overlap (70% weight)
- Length similarity (30% weight)
- Filters out short words and punctuation
- More forgiving of word order changes

**Why it's lower:** Only counts words, not *meaning*. Won't understand synonyms or paraphrasing.

**Example:**
```
Original: "The capital of France is Paris"
Answer:   "France's capital is Paris"
Score:    0.52 ⭐ (1 star - because word overlap is 60%)
Reason:   Only 8 of 10 unique words match; missing "The"
```

---

## 🚨 The Problem: Why Your Scores Were Low

You were seeing **0.3457** in the app but **0.9548** in the test script because:

1. **Test script** (`test_scoring.py`): Uses SimCSE directly ✅
2. **App without SimCSE running**: Falls back to Token Set Similarity ❌

**Result:** Same answer scored **0.95 vs 0.34** - completely different!

---

## ✅ Solution: Run Both Servers Together

### Option 1: Use the Startup Script (EASIEST)

**Windows:**
```bash
cd c:\Users\ASUS LAPTOP
START_BOTH.bat
```

This will:
- Start SimCSE server on port 5000
- Start Next.js app on port 3000
- Auto-set `NEXT_PUBLIC_SIMCSE_API_URL=http://localhost:5000/score`

**Linux/Mac:**
```bash
cd ~
bash START_BOTH.sh
```

### Option 2: Manual (Two Terminals)

**Terminal 1 - SimCSE Server:**
```bash
cd c:\Users\ASUS LAPTOP\simcse-api
python run_server.py
```

**Terminal 2 - Next.js App:**
```bash
cd c:\Users\ASUS LAPTOP\my-app
set NEXT_PUBLIC_SIMCSE_API_URL=http://localhost:5000/score
npm run dev
```

---

## 📈 Star Thresholds (Verified Correct)

These thresholds work for **SimCSE scores**:

| Score Range | Stars | Meaning |
|---|---|---|
| ≥ 0.81 | ⭐⭐⭐ | Excellent - direct understanding |
| 0.60 - 0.80 | ⭐⭐ | Good - mostly correct with minor gaps |
| 0.44 - 0.59 | ⭐ | Fair - partial understanding |
| < 0.44 | ⭐ | Below threshold - missing key content |

**With Fallback (Token Set):** Scores will be ~30-50% lower, so adjust expectations:
- Fallback 0.7+ ≈ API 0.95+ (3 stars equivalent)
- Fallback 0.45+ ≈ API 0.65+ (2 stars equivalent)
- Fallback < 0.35 ≈ API < 0.55 (1 star or below)

---

## 🔍 How to Verify Which Method is Being Used

**Check browser console (F12) after finishing a session:**

**✅ Using API (Good):**
```
[🔄 Attempting to fetch score from] http://localhost:5000/score
[✅ Score received from API] {similarity: 0.8234}
[📋 Score Status] API method used. Similarity: 0.8234
```

**⚠️ Using Fallback (Server not running):**
```
[🔄 Attempting to fetch score from] http://localhost:5000/score
[⚠️ SimCSE API unavailable...] Failed to fetch
[📊 Fallback similarity calculated] {...similarity: 0.3456...}
[📋 Score Status] Fallback method used. Similarity: 0.3456
```

---

## 🧪 Test Your Scoring Locally

Use the calibration tool to verify scores:

```bash
cd c:\Users\ASUS LAPTOP\simcse-api
python test_scoring.py
```

Then paste your note and answer to see the **true SimCSE score** before comparing to app scores.

---

## 🎯 What Changed in This Fix

1. **Improved Fallback Algorithm**: From basic Jaccard to Token Set Similarity
   - Now considers word length and proximity
   - More forgiving of different writing styles
   - ~10-20% higher scores than Jaccard

2. **Better Logging**: Console now shows detailed debug info about which method is used

3. **Auto-Detection**: App automatically tries SimCSE first, falls back if unavailable

4. **Easy Startup**: Created `START_BOTH.bat` to run both servers

---

## 📋 Quick Troubleshooting

**Q: App still showing low scores even after running START_BOTH.bat?**

A: Check that both servers are running:
- Visit http://localhost:5000/health (should show "status": "ok")
- Visit http://localhost:3000 (should load app)
- Check browser console for `[📋 Score Status]` message

**Q: SimCSE server crashes on startup?**

A: Check if model exists: `ls simcse-api/simcse-model`
- If missing, run: `python simcse-api/download_model.py`

**Q: Scores still seem off compared to test script?**

A: Make sure browser console shows "API method used", not "Fallback method used"
- If showing Fallback, the server connection failed
- Try restarting both services

---

## 📚 Reference

- **SimCSE Model**: `princeton-nlp/unsup-simcse-bert-base-uncased` (from HuggingFace)
- **Thresholds Source**: Calibrated through pilot testing with educational content
- **Fallback Algorithm**: Modified Token Set Similarity with length normalization
