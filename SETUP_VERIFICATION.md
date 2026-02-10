# MusicApp - Setup Verification Checklist ✅

Use this checklist to verify your MusicApp setup is complete and working.

## Pre-Setup (System Requirements)

- [ ] Node.js 20+ installed: `node --version`
- [ ] npm installed: `npm --version`
- [ ] PostgreSQL 14+ installed: `psql --version`
- [ ] Redis installed: `redis-server --version`
- [ ] FFmpeg installed: `ffmpeg -version`
- [ ] Python 3.9+ installed: `python3 --version`

## Installation

- [ ] Repository cloned
- [ ] All npm dependencies installed: `npm install`
- [ ] Backend dependencies installed: `cd packages/backend && npm install`
- [ ] Frontend dependencies installed: `cd packages/frontend && npm install`
- [ ] All node_modules present

## Database Setup

### PostgreSQL
```bash
# Run these commands:
createuser musicapp --createdb
createdb -U musicapp musicapp
```

- [ ] PostgreSQL user created: `musicapp`
- [ ] PostgreSQL database created: `musicapp`
- [ ] Can connect: `psql -U musicapp -d musicapp -c "SELECT 1;"`

### Database Schema
```bash
cd packages/backend
npm run prisma:generate
npm run prisma:push
```

- [ ] Prisma client generated
- [ ] Database tables created
- [ ] Migrations applied
- [ ] Can view schema: `npx prisma studio`

## Environment Configuration

- [ ] `.env` file exists in root
- [ ] `DATABASE_URL` set correctly (check psql connection)
- [ ] `REDIS_URL` set (default: redis://localhost:6379)
- [ ] `JWT_SECRET` set (anything for dev)
- [ ] `USE_SORA_MOCK=true` (for testing without API key)

## Redis Setup

```bash
# Start Redis (in separate terminal)
redis-server
```

- [ ] Redis running: `redis-cli ping` returns "PONG"
- [ ] Can connect programmatically

## Build Verification

```bash
# Backend build
cd packages/backend && npm run build

# Frontend build  
cd packages/frontend && npm run build
```

- [ ] Backend builds with no errors
- [ ] Frontend builds with no errors
- [ ] dist/ folders created

## Local Development Server

```bash
# From root directory
npm run dev
```

- [ ] Backend started on http://localhost:3000
- [ ] Frontend started on http://localhost:5173
- [ ] Both can access each other
- [ ] No CORS errors in console

## Frontend Verification

Visit http://localhost:5173

- [ ] Page loads
- [ ] SignUp form visible
- [ ] Login link ready
- [ ] No console errors

## Backend Verification

Visit http://localhost:3000

```json
{
  "name": "MusicApp API",
  "version": "2.0.0",
  "status": "running",
  "features": ["audio-analysis", "scene-generation", "lip-sync", "character-persistence"],
  "endpoints": { ... }
}
```

- [ ] Returns valid JSON response
- [ ] All features listed
- [ ] Status is "running"

Health check: http://localhost:3000/health

```json
{ "status": "ok", "timestamp": "..." }
```

- [ ] Returns status: ok

## Authentication Testing

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!",
    "name": "Test User"
  }'
```

- [ ] User created (or already exists)
- [ ] Returns user object with `id` and `email`

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123!"
  }'
```

- [ ] Returns auth token
- [ ] Token can be used for API calls

Replace `<TOKEN>` with returned token for all subsequent tests.

### Get Current User

```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns user object
- [ ] Name and email match

## Projects API Testing

### Create Project

```bash
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "A test project",
    "audioUrl": "https://example.com/test.mp3",
    "duration": 180,
    "performanceDensity": 0.5,
    "lyrics": "Test lyrics here"
  }'
```

- [ ] Project created with unique ID
- [ ] Returns project object
- [ ] Status is "draft"

Use this `projectId` for testing:
```
PROJECT_ID = <returned id>
```

### List Projects

```bash
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns array of projects
- [ ] Contains the project we just created

### Get Project Details

```bash
curl http://localhost:3000/api/projects/<PROJECT_ID> \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns full project object
- [ ] All fields present (title, duration, etc.)

## Characters API Testing

### Create Character

```bash
curl -X POST http://localhost:3000/api/projects/<PROJECT_ID>/characters \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Character",
    "description": "The main vocalist",
    "isPrimary": true
  }'
```

- [ ] Character created with unique ID
- [ ] Returns character object

### List Characters

```bash
curl http://localhost:3000/api/projects/<PROJECT_ID>/characters \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns array of characters
- [ ] Contains created character

## Storyboard API Testing

### Get Storyboard

```bash
curl http://localhost:3000/api/projects/<PROJECT_ID>/storyboard \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns storyboard object (may be empty)
- [ ] Has lyricsData or empty JSON

### Update Storyboard

```bash
curl -X PUT http://localhost:3000/api/projects/<PROJECT_ID>/storyboard \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "lyricsData": {
      "lines": [
        {"text": "Line 1", "startTime": 0, "endTime": 5},
        {"text": "Line 2", "startTime": 5, "endTime": 10}
      ]
    }
  }'
```

- [ ] Storyboard updated
- [ ] Returns updated storyboard

## Scenes API Testing

### Generate Scenes

First, ensure storyboard has lyrics data (see above).

```bash
curl -X POST http://localhost:3000/api/projects/<PROJECT_ID>/generate-storyboard \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

- [ ] Returns success response
- [ ] Scenes created in database

### List Scenes

```bash
curl http://localhost:3000/api/projects/<PROJECT_ID>/scenes \
  -H "Authorization: Bearer <TOKEN>"
```

- [ ] Returns array of scenes
- [ ] Each scene has storyType, prompt, etc.

## Frontend UI Testing

1. **Login Page**
   - [ ] Load http://localhost:5173
   - [ ] See login form with email and password fields
   - [ ] "Sign Up" link available

2. **Sign Up**
   - [ ] Click "Sign Up" link
   - [ ] Fill in email, password, name
   - [ ] Click sign up button
   - [ ] Redirected to projects page on success

3. **Projects Page**
   - [ ] List of user's projects displayed
   - [ ] No projects initially (empty state)
   - [ ] "New Project" button available

4. **Create Project**
   - [ ] Click "New Project" button
   - [ ] Form appears with:
     - [ ] Title field
     - [ ] Audio URL field
     - [ ] Duration field
     - [ ] Performance density slider
     - [ ] Lyrics textarea
     - [ ] Create button
   - [ ] Fill form and submit
   - [ ] Redirected to project editor

5. **Project Editor**
   - [ ] Shows project title
   - [ ] Scenes/storyboard panel visible
   - [ ] Characters panel visible
   - [ ] Settings accessible
   - [ ] No JavaScript errors

6. **Navigation**
   - [ ] Can navigate between projects
   - [ ] Can logout (blue user menu with email)
   - [ ] Can return to projects list
   - [ ] Logout redirects to login page

## Advanced Features

### Job Queue
```bash
# Check Redis queue (in separate terminal)
redis-cli
> LLEN processing
(should be empty or zero for completed jobs)
```

- [ ] Redis queue working
- [ ] Jobs can be added/processed

### Database Inspection

```bash
cd packages/backend
npx prisma studio
```

- [ ] Prisma Studio opens in browser (usually http://localhost:5555)
- [ ] Can browse all data models
- [ ] Can see created projects and users

### Docker (Optional)

```bash
docker-compose --version
docker-compose up -d
docker-compose ps
```

- [ ] Docker installed
- [ ] Services start without errors
- [ ] All containers running

## Troubleshooting Checklist

If something fails, verify:

- [ ] All services running:
  - PostgreSQL: `psql -U musicapp -d musicapp -c "SELECT 1;"`
  - Redis: `redis-cli ping`
  - Backend: `curl http://localhost:3000/health`
  - Frontend: Visit http://localhost:5173

- [ ] No port conflicts:
  - [ ] Port 3000 free for backend
  - [ ] Port 5173 free for frontend
  - [ ] Port 5432 free for PostgreSQL
  - [ ] Port 6379 free for Redis

- [ ] Environment file correct:
  - [ ] DATABASE_URL points to running PostgreSQL
  - [ ] REDIS_URL points to running Redis
  - [ ] JWT_SECRET set (any value for dev)

- [ ] Dependencies installed:
  - [ ] `npm ls` in root shows no broken deps
  - [ ] node_modules folders exist

- [ ] Database schema:
  - [ ] `npx prisma studio` shows tables
  - [ ] Can insert/query data

## Final Checks

- [ ] All API endpoints working
- [ ] Frontend and backend communicating
- [ ] Can create users
- [ ] Can create projects
- [ ] Can create characters
- [ ] Can update storyboard
- [ ] No unhandled errors
- [ ] Database returning data
- [ ] Job queue operational
- [ ] All builds succeeding

## Next Steps

Once all items are checked:

1. ✅ Read [STARTUP_GUIDE.md](./STARTUP_GUIDE.md#-key-features-to-test)
2. ✅ Read [COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)
3. ✅ Test the full workflow locally
4. 🚀 When ready, follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to Railway

## Need Help?

- Check terminal logs for errors
- See [STARTUP_GUIDE.md Troubleshooting](./STARTUP_GUIDE.md#-troubleshooting)
- Review [MUSIC_VIDEO_PIPELINE.md](./MUSIC_VIDEO_PIPELINE.md) for architecture
- Ensure all prerequisites are installed and running

---

**Congratulations!** If all checks pass, your MusicApp is ready for development and deployment! 🎉
