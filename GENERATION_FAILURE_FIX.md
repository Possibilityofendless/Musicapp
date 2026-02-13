# 🚨 Generation Failures - Fix Guide

## Problem Identified
Your generations are failing because the API keys are not configured. The backend server is running, but it cannot make API calls to generate content.

---

## ⚠️ Current Configuration Issues

### In `.env` file:
```dotenv
OPENAI_API_KEY="sk-your-key-here"        # ❌ Placeholder
SORA_API_KEY="your_sora_api_key_here"    # ❌ Placeholder
USE_SORA_MOCK=false                       # ❌ Mock disabled
```

---

## 🔧 Solution Options

### **Option 1: Use Real API Keys (Recommended for Production)**

1. **Get OpenAI API Key:**
   - Go to https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Update `.env` file:**
   ```bash
   cd /workspaces/Musicapp
   nano .env
   ```

3. **Replace placeholder with real key:**
   ```dotenv
   OPENAI_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxx"
   SORA_API_KEY="sk-proj-xxxxxxxxxxxxxxxxxxxxx"  # Same key or separate Sora key
   ```

4. **Restart backend:**
   ```bash
   # Kill existing backend
   lsof -ti:3000 | xargs kill -9
   
   # Start fresh
   npm run dev --workspace=backend
   ```

---

### **Option 2: Enable Mock Mode (Development/Testing)**

If you don't have API keys yet or want to test the UI:

1. **Update `.env` file:**
   ```dotenv
   OPENAI_API_KEY="sk-your-key-here"    # Keep placeholder
   SORA_API_KEY="your_sora_api_key_here"
   USE_SORA_MOCK=true                    # ✅ Enable mock mode
   USE_AUDIO_MOCK=true                   # ✅ Already enabled
   ```

2. **What mock mode does:**
   - Returns fake video URLs instead of calling Sora API
   - Allows testing the full UI flow
   - No API costs incurred
   - Still requires database and Redis

3. **Update the file:**
   ```bash
   sed -i 's/USE_SORA_MOCK=false/USE_SORA_MOCK=true/' /workspaces/Musicapp/.env
   ```

4. **Restart backend:**
   ```bash
   lsof -ti:3000 | xargs kill -9
   npm run dev --workspace=backend
   ```

---

## 🧪 Quick Test Commands

### Test with Mock Mode (Recommended First):
```bash
# 1. Enable mock mode
sed -i 's/USE_SORA_MOCK=false/USE_SORA_MOCK=true/' /workspaces/Musicapp/.env

# 2. Restart backend
lsof -ti:3000 | xargs kill -9 && npm run dev --workspace=backend &

# 3. Wait 3 seconds then test
sleep 3 && curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}' \
  | jq .
```

### Verify Mock Mode is Active:
```bash
grep "USE_SORA_MOCK" /workspaces/Musicapp/.env
# Should show: USE_SORA_MOCK=true
```

---

## 🎯 What Each Setting Does

### `OPENAI_API_KEY`:
- **Used for:** Whisper transcription, text processing
- **Required for:** Auto-lyrics feature
- **Cost:** ~$0.006 per minute of audio
- **Without it:** Manual lyrics required, some AI features disabled

### `SORA_API_KEY`:
- **Used for:** Video generation from prompts
- **Required for:** Creating actual video clips
- **Cost:** Varies by Sora pricing
- **Without it:** No videos generated (or use mock mode)

### `USE_SORA_MOCK`:
- **When true:** Returns fake video URLs (for testing)
- **When false:** Calls real Sora API
- **Default:** false (expects real API)

### `USE_AUDIO_MOCK`:
- **When true:** Skips audio processing
- **When false:** Uses real audio analysis
- **Default:** true (already enabled)

---

## 📊 Feature Availability Matrix

| Feature | Mock Mode | With API Keys |
|---------|-----------|---------------|
| User Authentication | ✅ | ✅ |
| Project Creation | ✅ | ✅ |
| Scene Management | ✅ | ✅ |
| Auto-Lyrics (Whisper) | ❌ | ✅ |
| Video Generation (Sora) | ✅ (fake URLs) | ✅ (real videos) |
| Audio Analysis | ✅ (mock) | ✅ (real) |
| Final Video Download | ✅ | ✅ |

---

## 🚀 Recommended Workflow

### For Development/Testing:
```bash
# 1. Enable mock mode
echo "USE_SORA_MOCK=true" >> /workspaces/Musicapp/.env

# 2. Restart backend
lsof -ti:3000 | xargs kill -9
npm run dev --workspace=backend
```

### For Production/Real Usage:
```bash
# 1. Get API keys from OpenAI
# 2. Update .env with real keys
# 3. Set USE_SORA_MOCK=false
# 4. Restart backend
```

---

## 🐛 Debugging Tips

### Check if backend loaded config:
```bash
curl http://localhost:3000/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Check backend logs:
```bash
# View last 20 lines of backend output
# (Look for API key warnings)
```

### Test API endpoints:
```bash
# 1. Create account
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123","name":"Test"}'

# 2. Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"pass123"}' \
  | jq -r .token)

# 3. Create project
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"Test Project",
    "audioUrl":"https://example.com/audio.mp3",
    "lyrics":"Test lyrics line 1\nTest lyrics line 2",
    "duration":120,
    "performanceDensity":0.5
  }' | jq .
```

---

## ✅ Quick Fix (Enable Mock Mode Now)

Run this single command to enable mock mode and restart:

```bash
cd /workspaces/Musicapp && \
sed -i 's/USE_SORA_MOCK=false/USE_SORA_MOCK=true/' .env && \
lsof -ti:3000 | xargs kill -9 2>/dev/null || true && \
sleep 2 && \
npm run dev --workspace=backend &
```

Then open http://localhost:5173 and try creating a project!

---

## 📝 Summary

**Problem:** API keys not configured → API calls fail → generations fail

**Solutions:**
1. **Quick Test:** Enable `USE_SORA_MOCK=true` (no API keys needed)
2. **Production:** Add real OpenAI/Sora API keys to `.env`

**Next Step:** Choose Option 1 or Option 2 above and follow the steps!
