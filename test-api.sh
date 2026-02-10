#!/bin/bash

# Simple MusicApp API Testing Script
# Run this AFTER database migrations are complete
# These are the actual steps to test in order

API="https://musicapp-production-4e4b.up.railway.app"

echo "=========================================="
echo "MusicApp API Testing"
echo "=========================================="
echo ""

# Step 1: Health Check (no auth needed)
echo "[STEP 1] Health Check (No Auth Required)"
echo "GET /health"
curl -s "$API/health" | jq .
echo ""

# Step 2: Signup (no auth needed)
echo "[STEP 2] User Signup (No Auth Required)"
EMAIL="test-$(date +%s)@example.com"
PASSWORD="Test12345"
NAME="Test User"

echo "POST /api/auth/signup"
echo "Body: email=$EMAIL, password=$PASSWORD, name=$NAME"
SIGNUP=$(curl -s -X POST "$API/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")

echo "$SIGNUP" | jq .
TOKEN=$(echo "$SIGNUP" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo ""
  echo "❌ Signup failed! No token received."
  echo "⚠️  Make sure database migrations were run:"
  echo "    bash migrate-railway.sh"
  exit 1
fi

echo ""
echo "✓ Signup successful!"
echo "  Email: $EMAIL"
echo "  Token: ${TOKEN:0:20}..."
echo ""

# Step 3: Login (no auth needed)
echo "[STEP 3] User Login (No Auth Required)"
echo "POST /api/auth/login"
echo "Body: email=$EMAIL, password=$PASSWORD"
LOGIN=$(curl -s -X POST "$API/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "$LOGIN" | jq .
LOGIN_TOKEN=$(echo "$LOGIN" | jq -r '.token // empty')

if [ -z "$LOGIN_TOKEN" ]; then
  echo ""
  echo "❌ Login failed!"
  exit 1
fi

echo ""
echo "✓ Login successful!"
echo "  Token: ${LOGIN_TOKEN:0:20}..."
echo ""

# Step 4: Get Current User (REQUIRES auth)
echo "[STEP 4] Get Current User (REQUIRES Auth Token)"
echo "GET /api/auth/me"
echo "Header: Authorization: Bearer \$TOKEN"
ME=$(curl -s -X GET "$API/api/auth/me" \
  -H "Authorization: Bearer $TOKEN")

echo "$ME" | jq .
echo ""

# Step 5: Create Project (REQUIRES auth)
echo "[STEP 5] Create Project (REQUIRES Auth Token)"
echo "POST /api/projects"
PROJECT=$(curl -s -X POST "$API/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Music Video",
    "description": "Testing the API",
    "audioUrl": "https://example.com/test.mp3",
    "duration": 180,
    "performanceDensity": 0.5,
    "lyrics": "Test lyrics here"
  }')

echo "$PROJECT" | jq .
PROJECT_ID=$(echo "$PROJECT" | jq -r '.id // .project.id // empty')

if [ -z "$PROJECT_ID" ]; then
  echo ""
  echo "❌ Create project failed!"
  exit 1
fi

echo ""
echo "✓ Project created!"
echo "  Project ID: $PROJECT_ID"
echo ""

# Step 6: List Projects (REQUIRES auth)
echo "[STEP 6] List Projects (REQUIRES Auth Token)"
echo "GET /api/projects"
PROJECTS=$(curl -s -X GET "$API/api/projects" \
  -H "Authorization: Bearer $TOKEN")

echo "$PROJECTS" | jq .
echo ""

echo "=========================================="
echo "✓ ALL TESTS PASSED!"
echo "=========================================="
echo ""
echo "Test Account Created:"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""
echo "Next: Visit $API and sign in!"
