# Vercel Production Deployment Checklist

**Status**: ✅ Code ready, ⏳ Environment variables needed

## 🚨 CRITICAL: Add Missing Environment Variables

### Step 1: Add DATABASE_URL (This is blocking all API calls)

1. **Open Vercel Dashboard**: https://vercel.com/dashboard
2. **Select Project**: Click "Consol"
3. **Go to Settings**: Top menu → "Settings"
4. **Environment Variables**: Left sidebar → "Environment Variables"
5. **Add new variable**:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://neondb_owner:npg_7wDFcjgxBm4b@ep-proud-lake-aoa31hnk.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
   - **Environments**: Select "Production"
   - Click "Save"

✅ **Expected Result**: Variable appears in the list

### Step 2: (Optional) Add SimCSE API URL

Only do this AFTER you deploy the SimCSE API to Render/Railway.

1. **Same Environment Variables page**
2. **Add new variable**:
   - **Name**: `NEXT_PUBLIC_SIMCSE_API_URL`
   - **Value**: `https://simcse-api-xxxxx.onrender.com/score` (replace with your actual Render URL)
   - **Environments**: Select "Production"
   - Click "Save"

⚠️ **Note**: Leave this out for now. The app uses fallback scoring if this is missing.

### Step 3: Redeploy to Activate Changes

1. **Go to Deployments**: Top menu → "Deployments"
2. **Find Latest Deploy**: Look for the most recent deployment (should show commit "3f10635f")
3. **Redeploy**: Click the "..." (three dots) → "Redeploy"
4. **Wait for completion**:
   - You'll see: "Building..." → "Built successfully" → "Ready"
   - The URL button will turn blue when ready (usually 30-60 seconds)
   - ✅ Green checkmark = deployment successful

✅ **Expected Result**: Status shows "Ready" in green

## 🧪 Verify Deployment Works

### Test 1: Database Connection

Visit: https://consol.vercel.app/api/users

**Expected Response**: 
```json
[]
```
(Empty array if no users, or list of users if they exist)

**If you see this error**:
```json
{"error":"Error: connect ECONNREFUSED 127.0.0.1:5432"}
```
**Solution**: DATABASE_URL was not set correctly. Go back to Step 1 and verify the value.

### Test 2: Test Endpoint (Diagnostic)

Visit: https://consol.vercel.app/api/test

**Expected Response**:
```json
{"message":"Hello from Next.js API","timestamp":"2024-01-XX..."}
```

### Test 3: Users Page

Visit: https://consol.vercel.app/users

**Expected**: Page loads without errors (may show empty if no users in database)

**If you see errors**:
- Check browser console (F12 → Console tab)
- Look for red error messages
- Common cause: DATABASE_URL not set

## 📋 Complete End-to-End Test

### Test Flow: Create User → Create Note → Practice → Score

#### 1. Create a Test User

```bash
curl -X POST https://consol.vercel.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser"}'
```

Expected response:
```json
{"id":"uuid","username":"testuser","created_at":"..."}
```

#### 2. Visit Users Page

Go to: https://consol.vercel.app/users

**Expected**: Your new test user appears in the list

#### 3. Create a Test Note

```bash
curl -X POST https://consol.vercel.app/api/notes \
  -H "Content-Type: application/json" \
  -d '{"user_id":"<from step 1>","title":"Test Note","content":"The quick brown fox jumps over the lazy dog"}'
```

Expected response: Note ID

#### 4. Start a Session

Visit: https://consol.vercel.app/session?noteId=<from step 3>&timeLimit=30&allowHints=0

**Expected**: 
- Timer starts counting down
- Text editor appears with the note content
- Can type in the editor
- "Finish Session" button is visible

#### 5. Practice & Finish

- Type something similar to the original note
- Click "Finish Session"
- Open browser console (F12 → Console)

**Expected console output**:
```
[📋 Score Status] API/Fallback method used. Similarity: 0.XX
```

If you see:
- `API method used` = SimCSE API is working ✅
- `Fallback method used` = SimCSE API unavailable (but fallback works) ✅
- `Failed to get score from backend` = This error should NOT appear anymore

## 🔍 Debugging Tips

### Check Vercel Logs

1. Go to Vercel Dashboard → Consol → Functions
2. Click on the deployment
3. Scroll through logs looking for:
   - Green ✅: Successful requests
   - Red ❌: Errors (usually ECONNREFUSED means DATABASE_URL missing)

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | DATABASE_URL not set | Add DATABASE_URL env var |
| `relation 'users' does not exist` | Database schema missing | Schema is already in Neon, try /api/users again |
| `Failed to get score from backend` | SimCSE API down | Fallback is working, no action needed |
| `Column 'word_count' does not exist` | Schema outdated | Schema is fixed in Neon, clear cache |

### View Real-Time Logs

1. In Vercel dashboard, click "Deployments"
2. Click the "..." → "View Function Logs"
3. Watch logs in real-time as you make requests

## 🎯 What to Verify

**Minimum working state (after redeploy)**:
- [ ] `/api/users` returns `[]` or user data (not 500 error)
- [ ] Users page loads without crashing
- [ ] Can create a note via API
- [ ] Session page loads with timer
- [ ] Can type in session editor
- [ ] Finish Session shows similarity score

**Full working state (after SimCSE deployment)**:
- [ ] Everything above PLUS
- [ ] Session scoring uses "API method" (not fallback)
- [ ] Stars are calculated based on similarity threshold
- [ ] Score persists to database

## ⏱️ Estimated Timelines

- Add DATABASE_URL → Redeploy: **2-3 minutes**
- Full functionality test: **5 minutes**
- SimCSE deployment (optional): **15-20 minutes**

## 📝 Checklist

Production deployment readiness:

```
CRITICAL (Required for API to work):
☐ DATABASE_URL added to Vercel env vars
☐ Redeploy completed
☐ /api/users endpoint returns data (not 500)
☐ Users page loads

IMPORTANT (For full experience):
☐ Can create notes via API
☐ Session page loads with timer
☐ Finish Session displays score

NICE TO HAVE (Better accuracy):
☐ SimCSE API deployed to Render
☐ NEXT_PUBLIC_SIMCSE_API_URL set
☐ Vercel redeployed with SimCSE URL
☐ Scoring uses "API method" (checked in console)
```

## 🚀 Next Steps

1. **Immediately**: Add DATABASE_URL and redeploy (2 min) → Test APIs
2. **Then**: Create test user/note, verify workflow
3. **Optional**: Deploy SimCSE to Render (15 min) → Get better scoring accuracy

**Current blocker**: DATABASE_URL not in Vercel
**Workaround**: None - this MUST be added for ANY API calls to work

---

**Questions?** Check the session.js file for scoring logic or lib/db.js for database connection details.
