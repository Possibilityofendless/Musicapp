# Testing MusicApp on Railway - Troubleshooting Guide

## 🚨 Issue Found: Database Schema Not Initialized

The signup endpoint returns **500 error**, which indicates the database tables don't exist yet.

### ✅ Solution: Run Database Migrations on Railway

You have two options:

---

## Option 1: Via Railway CLI (Recommended - 5 minutes)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
# or
brew install railway  # macOS
```

### Step 2: Login to Railway
```bash
railway login
# Will open browser to authenticate
```

### Step 3: Link to Your Project
```bash
cd /workspaces/Musicapp
railway link
# Select your "Musicapp" project
```

### Step 4: Run Migrations
```bash
# Run in backend directory
cd packages/backend

# Set Railway environment
railway env  # This shows your production environment

# Run migrations
railway run npm run prisma:push
# or for interactive migration
railway run npm run prisma:migrate
```

### Step 5: Verify Database
```bash
railway run npm run prisma:generate
```

---

## Option 2: Via Railway Dashboard (Manual)

### Step 1: Access Railway Dashboard
Go to https://railway.app → Your Project → PostgreSQL service

### Step 2: Check Database Connection
- Open PostgreSQL plugin
- Verify connection is active
- Check if tables exist (initially empty)

### Step 3: Run Migration Remotely
You have a few options:

**Option A: Use Railway CLI** (see Option 1 above)

**Option B: Deploy a migration script**
1. Create `run-migration.js` in root:
```javascript
const { execSync } = require('child_process');
execSync('npm run prisma:push', { cwd: 'packages/backend', stdio: 'inherit' });
```
2. Deploy app
3. Remove the file
4. Redeploy

**Option C: Manual SQL (Advanced)**
Copy the schema from `packages/backend/prisma/schema.prisma` and execute in the Railway PostgreSQL console

---

## 🔍 Testing Checklist (After Migrations)

Once database is initialized, test these:

### 1. Backend Health
```bash
curl https://musicapp-production-4e4b.up.railway.app/health
# Should return: {"status":"ok","timestamp":"..."}
```

### 2. User Registration (After Migration)
```bash
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123",
    "name": "Admin User"
  }'
```

Should return:
```json
{
  "user": {
    "id": "user_xxx",
    "email": "admin@example.com",
    "name": "Admin User",
    "createdAt": "2026-02-09T..."
  },
  "token": "eyJhbGc..."
}
```

### 3. Login
```bash
RESPONSE=$(curl -s -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123"
  }')

TOKEN=$(echo $RESPONSE | jq -r '.token')
echo "Token: $TOKEN"
```

### 4. Get Current User (Requires valid token)
```bash
curl -X GET https://musicapp-production-4e4b.up.railway.app/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

Should return:
```json
{
  "id": "user_xxx",
  "email": "admin@example.com",
  "name": "Admin User",
  "createdAt": "..."
}
```

### 5. Create Project (With token)
```bash
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Music Video",
    "description": "Testing the app",
    "audioUrl": "https://example.com/song.mp3",
    "duration": 180,
    "performanceDensity": 0.5,
    "lyrics": "These are the song lyrics"
  }'
```

### 6. List Projects
```bash
curl https://musicapp-production-4e4b.up.railway.app/api/projects \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🌐 Frontend Testing

Once signup works, test the UI:

### 1. Access Frontend
Visit: `https://musicapp-production-4e4b.up.railway.app`

### 2. Sign Up Flow
1. Click "Sign Up"
2. Enter: email, password, name
3. Submit
4. Should redirect to projects page

### 3. Create Project
1. Click "New Project"
2. Fill in:
   - Title: "Test Video"
   - Audio URL: https://example.com/demo.mp3
   - Duration: 180
   - Performance Density: 0.5
   - Lyrics: "Test lyrics"
3. Click Create
4. Should show project editor

### 4. Create Character
1. In project, go to Characters
2. Click "Add Character"
3. Fill: Name, Description, isPrimary
4. Submit
5. Should appear in character list

### 5. Edit Storyboard
1. Go to Storyboard section
2. It should show parsed lyrics
3. Should allow editing sections/beats

---

## 📊 API Endpoints to Test

| Endpoint | Method | Auth Required | Test |
|----------|--------|---------------|------|
| `/health` | GET | No | `curl https://...app/health` |
| `/` | GET | No | Get API info |
| `/api/auth/signup` | POST | No | Register user |
| `/api/auth/login` | POST | No | Get token |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/projects` | GET | Yes | List projects |
| `/api/projects` | POST | Yes | Create project |
| `/api/projects/:id` | GET | Yes | Get project |
| `/api/projects/:id/characters` | GET | Yes | List characters |
| `/api/projects/:id/characters` | POST | Yes | Create character |
| `/api/projects/:id/storyboard` | GET | Yes | Get storyboard |
| `/api/projects/:id/storyboard` | PUT | Yes | Update storyboard |
| `/api/projects/:id/scenes` | GET | Yes | List scenes |

---

## 🔧 Environment Variables Check

In Railway Dashboard, verify these are set:

```
✓ NODE_ENV=production
✓ JWT_SECRET=<your-secret>
✓ OPENAI_API_KEY=sk-... (optional for mocking)
✓ USE_SORA_MOCK=true (or false if testing with real API)
✓ DATABASE_URL=postgresql://... (auto-set)
✓ REDIS_URL=redis://... (auto-set)
```

---

## 📝 Next Steps

1. **Run database migrations** (see Option 1 or 2 above)
2. **Test endpoints** using the checklist above
3. **Create test account** via signup API or UI
4. **Create test project** to verify full workflow
5. **Check logs** in Railway Dashboard for errors

---

## 🆘 If Migrations Still Don't Work

Try this one-liner:
```bash
cd /workspaces/Musicapp/packages/backend && \
  DATABASE_URL="$(railway env DATABASE_URL)" npm run prisma:push
```

Or check logs in Railway:
```bash
railway logs -s backend  # View backend logs
railway logs -s postgres # View database logs
```

---

## ✅ Success Criteria

After migrations, you should:
- ✅ Signup creates user in database
- ✅ Login returns valid token
- ✅ Token works for protected endpoints
- ✅ Can create projects
- ✅ Can create characters
- ✅ Frontend loads and works
- ✅ No 500 errors in API

Once all pass, your app is **fully functional**! 🎉
