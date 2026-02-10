# 🔧 MusicApp - Auth Error Troubleshooting

## ❌ Error: "Unauthorized - No token provided"

This error on **login** suggests the database hasn't been initialized yet.

---

## ✅ Solution: Database Initialization

### The Real Problem
Your **database tables don't exist yet**. When signup/login try to query the database, it fails and returns this error.

### The Fix: Run Database Migrations

Choose **one** option below:

---

## Option 1: Quick Auto-Script (Recommended)

```bash
cd /workspaces/Musicapp

# If you have Railway CLI installed:
bash migrate-railway.sh

# If that doesn't work, try manual below ↓
```

---

## Option 2: Manual Railway CLI

```bash
# Step 1: Login to Railway
railway login
# (Opens browser to authenticate)

# Step 2: Link project
cd /workspaces/Musicapp
railway link
# (Select your "Musicapp" project)

# Step 3: Run migrations
cd packages/backend
railway run npm run prisma:push
```

**Wait 2-3 minutes** for migrations to complete.

---

## Option 3: Via Railway Dashboard

1. Go to https://railway.app
2. Click your **Musicapp** project
3. Click **PostgreSQL** service
4. Look for database connection details
5. Try connecting with a SQL client to verify it exists

---

## ✅ After Migrations: Test Again

Once migrations complete, run:

```bash
bash test-api.sh
```

This will:
1. ✓ Test health check
2. ✓ Create a new user (signup)
3. ✓ Login with that user
4. ✓ Get current user info
5. ✓ Create a test project
6. ✓ List projects

**All should pass!** ✓

---

## 🔍 How to Verify Migrations Worked

### Check 1: Can you see tables?
```bash
# Connect to your Railway PostgreSQL and run:
SELECT table_name FROM information_schema.tables WHERE table_schema='public';
```

Should return 15+ tables (User, Project, Scene, etc.)

### Check 2: Simple API test
```bash
# Try to create a user
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test12345","name":"Test"}'
```

Should return user object with `token`, not error.

---

## 📊 API Testing Workflow

After migrations, test in this order:

### 1. Signup (Creates new user)
```bash
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myemail@example.com",
    "password": "MyPassword123",
    "name": "My Name"
  }'
```

**Response should include:**
```json
{
  "user": {
    "id": "user_xxx",
    "email": "myemail@example.com",
    "name": "My Name"
  },
  "token": "eyJhbGc..."
}
```

### 2. Login (Gets token)
```bash
curl -X POST https://musicapp-production-4e4b.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "myemail@example.com",
    "password": "MyPassword123"
  }'
```

**Response should include token:**
```json
{
  "user": { ... },
  "token": "eyJhbGc..."
}
```

### 3. Use Token (Protected endpoints)
```bash
# Save token from login response
TOKEN="eyJhbGc..."

# Get current user
curl -X GET https://musicapp-production-4e4b.up.railway.app/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "id": "user_xxx",
  "email": "myemail@example.com",
  "name": "My Name"
}
```

---

## 🎯 Quick Decision Tree

> **Do you see "Unauthorized - No token provided" error?**

- ✅ YES → **Database not initialized**
  - Run: `bash migrate-railway.sh`
  - Then retry

- ❌ NO (Different error) → Check specific error message
  - `"Email already in use"` → User exists, try login instead
  - `"Password must be at least 8 characters"` → Use 8+ char password
  - `"Invalid email or password"` → Wrong email/password combo

---

## 💡 Key Points

1. **Signup & Login DON'T need a token** - They're how you get a token
2. **Other endpoints DO need a token** - Pass as `Authorization: Bearer <token>`
3. **Database migrations must run first** - Or signup/login will fail
4. **Use `bash test-api.sh`** - Tests everything in correct order

---

## ✨ Expected Flow

```
1. Run migration (creates tables)
   ↓
2. Signup (creates user, returns token)
   ↓
3. Login (validates user, returns token)
   ↓
4. Use token for all other endpoints
   ↓
5. Create projects, characters, scenes, etc.
```

---

## 🆘 Still Getting Error?

1. **Check migrations ran successfully**
   - Look for: `Migrations applied` in output
   
2. **Check database exists on Railway**
   - Go to Railway dashboard → PostgreSQL service
   - Verify it shows "Online"

3. **Check API logs on Railway**
   - Look for signup/login errors

4. **Try the auto-test script**
   ```bash
   bash test-api.sh
   ```

Let me know what happens! 🚀
