# 🚀 MusicApp Railway - Quick Testing Guide

## Current Status

✅ **Backend API**: https://musicapp-production-4e4b.up.railway.app  
✅ **Health Check**: Working (`/health`)  
❌ **Database**: Not initialized - needs migration  

---

## 🔴 Issue: Database Not Initialized

The database schema (tables) don't exist yet. When you try to sign up, it fails with 500 error.

### ✅ Quick Fix (2 minutes)

```bash
# Option A: Use Migration Script (easiest)
cd /workspaces/Musicapp
bash migrate-railway.sh

# Option B: Manual Railway CLI
cd /workspaces/Musicapp/packages/backend
railway login
railway link
railway run npm run prisma:push
```

That's it! Your database will be initialized.

---

## ✅ After Running Migration

Your app will work. Test it:

### 1. Sign Up
```bash
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345","name":"Test"}'
```

### 2. Login
```bash
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345"}'
```

### 3. Visit Frontend
Open: https://musicapp-production-4e4b.up.railway.app

Sign up and start creating music videos! 🎬

---

## 📖 Full Testing Guide

See [RAILWAY_TESTING_GUIDE.md](./RAILWAY_TESTING_GUIDE.md) for:
- Detailed migration steps
- All API endpoint tests
- Frontend testing checklist
- Troubleshooting

---

## ⚡ What Happens After Migration

Your database will have:
- ✅ User table - for accounts
- ✅ Project table - for music videos
- ✅ Scene table - for video clips
- ✅ Character table - for character profiles
- ✅ And 10+ more tables for full functionality

Then signup will work! ✓

---

## 🎯 Next Actions

1. Run: `bash migrate-railway.sh` or use Railway CLI
2. Wait for migrations to complete (1-2 minutes)
3. Test signup at: https://musicapp-production-4e4b.up.railway.app/api/auth/signup
4. Visit frontend and create your first music video!

---

**Questions?** Check [RAILWAY_TESTING_GUIDE.md](./RAILWAY_TESTING_GUIDE.md)
