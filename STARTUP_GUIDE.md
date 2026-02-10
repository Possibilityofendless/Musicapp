# MusicApp - Startup Guide 🎬

Your AI-powered music video generator is ready to launch! This guide walks you through setting up and running your application.

## ✅ What's Completed

- ✅ Full-stack architecture (React frontend, Node.js backend, Python workers)
- ✅ Authentication system (signup/login with JWT tokens)
- ✅ Database models (PostgreSQL with Prisma ORM)
- ✅ Job queue system (Bull + Redis for background processing)
- ✅ Sora API integration for video generation
- ✅ Advanced mouth visibility detection (MediaPipe-based)
- ✅ Lip-sync support with forced alignment
- ✅ Video stitching and composition
- ✅ Production-ready deployment configuration

---

## 🚀 Quick Start (Local Development)

### Prerequisites

You'll need to install these on your machine:

- **Node.js 20+** - [Download](https://nodejs.org)
- **PostgreSQL 14+** - [Download](https://www.postgresql.org/download)
- **Redis 6+** - [Download](https://redis.io/download)
- **FFmpeg** - For video processing
- **Python 3.9+** - For workers (optional for local dev)

```bash
# macOS (using Homebrew)
brew install node postgresql redis ffmpeg python3

# Ubuntu/Debian
sudo apt update && sudo apt install -y nodejs postgresql postgresql-contrib redis-server ffmpeg python3

# Start services
# PostgreSQL
brew services start postgresql
# or: sudo service postgresql start

# Redis
brew services start redis
# or: redis-server
```

### Step 1: Clone and Install Dependencies

```bash
cd /workspaces/Musicapp
npm install
```

### Step 2: Setup Database

```bash
# Create PostgreSQL database and user
createuser musicapp --createdb
createdb -U musicapp musicapp

# Or manually:
# psql -U postgres
# postgres=# CREATE USER musicapp WITH PASSWORD 'musicapp_dev' CREATEDB;
# postgres=# CREATE DATABASE musicapp OWNER musicapp;
# postgres=# \q
```

### Step 3: Run Migrations

```bash
cd packages/backend
npm run prisma:push  # or npm run prisma:migrate for interactive mode
npm run prisma:generate  # Generate Prisma client
```

### Step 4: Configure Environment Variables

The `.env` file is already created with development defaults. Modify as needed:

```bash
# packages/backend/.env (or root .env)

# Database
DATABASE_URL="postgresql://musicapp:musicapp_dev@localhost:5432/musicapp"

# Redis
REDIS_URL="redis://localhost:6379"

# API Keys (optional for mock mode)
OPENAI_API_KEY="sk-your-actual-key-here"
USE_SORA_MOCK=true  # Set to false once you have an API key

# Authentication
JWT_SECRET="dev-secret-key-change-in-production"

# Server
PORT=3000
NODE_ENV=development
```

### Step 5: Start Development Servers

```bash
# From root directory
npm run dev

# This starts both backend (http://localhost:3000) and frontend (http://localhost:5173)
```

The app should now be running:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Docs**: http://localhost:3000

### Step 6: Create Test Account

Visit http://localhost:5173 and sign up with:
- Email: `test@example.com`
- Password: `TestPass123!`

---

## 🎯 Key Features to Test

### 1. Authentication ✓
- Sign up with email/password
- Login returns JWT token
- Token persists in localStorage

### 2. Project Creation ✓
- Create a new music project
- Upload/link audio file
- Configure video settings (duration, format, density)

### 3. Character Management ✓
- Create character profiles
- Upload reference images
- Define character descriptions

### 4. Scene Generation ✓
- Auto-generate scenes from lyrics
- Customize scene prompts
- Configure lip-sync for performances

### 5. Video Generation ✓
- Generate scenes with Sora API
- Create multiple takes (A/B testing)
- Quality checks with mouth visibility detection

### 6. Final Composition ✓
- Stitch scenes together
- Add audio
- Export final video

---

## 🔑 Environment Variables Cheat Sheet

```bash
# Core Services
DATABASE_URL=postgresql://user:pass@localhost:5432/musicapp
REDIS_URL=redis://localhost:6379

# API Keys
OPENAI_API_KEY=sk-your-key
SORA_API_KEY=optional-sora-specific-key
SORA_API_BASE_URL=https://api.openai.com/v1

# Feature Flags
USE_SORA_MOCK=true              # Mock video generation for testing
USE_AUDIO_MOCK=true             # Mock audio processing

# Server Config
PORT=3000
NODE_ENV=development|production
JWT_SECRET=your-secret-key

# Processing
STORAGE_TYPE=local              # or "s3"
STORAGE_PATH=/tmp/musicapp_storage
PROCESSING_TIMEOUT=600000       # 10 minutes in ms

# Logging
LOG_LEVEL=debug|info|warn|error
```

---

## 📦 API Endpoints Reference

### Authentication
```bash
POST   /api/auth/signup            # Create account
POST   /api/auth/login             # Login
GET    /api/auth/me                # Get current user (requires token)
POST   /api/auth/logout            # Logout
```

### Projects
```bash
GET    /api/projects               # List user's projects
POST   /api/projects               # Create new project
GET    /api/projects/:id           # Get project details
PUT    /api/projects/:id           # Update project
DELETE /api/projects/:id           # Delete project
```

### Characters
```bash
GET    /api/projects/:id/characters          # List characters
POST   /api/projects/:id/characters          # Create character
PUT    /api/projects/:id/characters/:charId  # Update character
DELETE /api/projects/:id/characters/:charId  # Delete character
```

### Scenes
```bash
GET    /api/projects/:id/scenes                           # List scenes
POST   /api/projects/:id/scenes/:sceneId/generate        # Generate takes
POST   /api/projects/:id/scenes/:sceneId/remix           # Remix scene
POST   /api/projects/:id/scenes/:sceneId/versions/:vId/select  # Select version
```

### Storyboard
```bash
GET    /api/projects/:id/storyboard          # Get storyboard
PUT    /api/projects/:id/storyboard          # Update storyboard
```

---

## 🐳 Docker Deployment

### Build Docker Images

```bash
cd /workspaces/Musicapp

# Build all services
docker-compose -f docker-compose.yml build

# Run all services
docker-compose -f docker-compose.yml up -d

# View logs
docker-compose logs -f
```

### Services in Docker Compose

| Service | Port | Image |
|---------|------|-------|
| Frontend | 80/443 | nginx |
| Backend | 3000 | Node.js |
| PostgreSQL | 5432 | postgres:14 |
| Redis | 6379 | redis:7 |
| Workers | - | python:3.11 |

---

## ☁️ Production Deployment (Railway)

### One-Click Deploy

```bash
# Option A: Via Railway CLI
npm install -g @railway/cli
railway login
railway init
railway up

# Option B: Via Web Dashboard
# 1. Go to railway.app
# 2. "New Project" → "Deploy from GitHub"
# 3. Select this repository
# 4. Select docker-compose.yml
```

### Railway Environment Variables

Set these in the Railway Dashboard → Variables:

```
NODE_ENV=production
JWT_SECRET=generate-a-strong-random-string
OPENAI_API_KEY=sk-your-production-key
USE_SORA_MOCK=false
DATABASE_URL=<auto-injected>
REDIS_URL=<auto-injected>
```

### Post-Deploy Setup

```bash
# Create initial user
curl -X POST https://your-backend.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "SecurePassword123!",
    "name": "Admin User"
  }'

# Test API
curl https://your-backend.railway.app/health
```

---

## 🔧 Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
psql -U musicapp -d musicapp -c "SELECT 1;"

# Reset database (warning: deletes all data)
dropdb -U postgres musicapp
createdb -U musicapp musicapp
npm run prisma:push

# Check connection string
echo $DATABASE_URL
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping  # Should return "PONG"

# Check Redis connection
redis-cli -u redis://localhost:6379 ping
```

### Cannot find ffmpeg

```bash
# Install FFmpeg
brew install ffmpeg        # macOS
sudo apt install ffmpeg    # Ubuntu/Debian

# Verify installation
ffmpeg -version
```

### Frontend won't connect to backend

```bash
# Check if backend is running
curl http://localhost:3000/health

# Check CORS in browser DevTools
# Should see 'Access-Control-Allow-Origin' header

# If using proxy, check vite.config.ts
```

### Jobs not processing

```bash
# Check Redis queue
redis-cli LLEN processing

# Check job status
npm run logs  # or docker-compose logs workers

# Restart workers
npm run restart-workers  # or docker-compose restart workers
```

---

## 📊 Database Schema Overview

### Key Models

- **User** - Authentication and account management
- **Project** - Music video projects with metadata
- **Scene** - Individual video clips with Sora prompts
- **SceneVersion** - Multiple takes for A/B testing
- **Character** - Persistent character profiles for consistency
- **Storyboard** - Overall beat grid and lyric timing
- **VocalSegment** - Extracted audio for lip-sync
- **ProcessingJob** - Job queue entries and status
- **GeneratedVideo** - Final outputs and intermediates

All relationships include automatic cascade deletes for clean data management.

---

## 🧪 Testing the Full Pipeline

### Manual Test Workflow

1. **Create Project**
   ```bash
   curl -X POST http://localhost:3000/api/projects \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Video",
       "audioUrl": "https://example.com/song.mp3",
       "duration": 180,
       "performanceDensity": 0.5,
       "lyrics": "Sample lyrics here"
     }'
   ```

2. **Create Character**
   ```bash
   curl -X POST http://localhost:3000/api/projects/PROJECT_ID/characters \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Singer",
       "description": "Main vocalist",
       "isPrimary": true
     }'
   ```

3. **Generate Scenes** - Use web UI for simplicity

4. **Check Job Status**
   ```bash
   curl http://localhost:3000/api/projects/PROJECT_ID/jobs \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

5. **Download Video** - Once processing completes

---

## 📚 Additional Resources

- **Architecture**: See [MUSIC_VIDEO_PIPELINE.md](./MUSIC_VIDEO_PIPELINE.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API**: See [README.md](./README.md)
- **Sora API Docs**: https://platform.openai.com/docs/guides/vision

---

## 🎉 You're All Set!

Your MusicApp is now ready to generate amazing AI music videos. 

**Next Steps:**
1. Start the dev server: `npm run dev`
2. Build your first music video
3. Customize prompts for better results
4. Deploy to Railway when ready

**Questions?** Check the troubleshooting section or update the respective `.env` files.

Happy video creating! 🎥✨
