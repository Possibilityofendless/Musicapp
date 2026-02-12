#!/bin/bash
set -e

API_BASE="http://localhost:3000/api"

echo "🎬 Testing Full Pipeline with Test Video Fallback"
echo "=================================================="

# 1. Signup/Login
echo -e "\n✅ Step 1: Creating user..."
USER_EMAIL="test-$(date +%s)@example.com"
USER_PASSWORD="Password123!"

SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\",\"name\":\"Test User\"}")

TOKEN=$(echo "$SIGNUP_RESPONSE" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo "Signup failed, trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')
fi

echo "Token: ${TOKEN:0:20}..."

# 2. Create minimal project with 3 scenes
echo -e "\n✅ Step 2: Creating project with 3 scenes..."
PROJECT_PAYLOAD='{
  "title": "Quick Test Video",
  "lyrics": "Line 1\nLine 2\nLine 3",
  "mood": "cinematic",
  "targetDuration": 9
}'

PROJECT_RESPONSE=$(curl -s -X POST "$API_BASE/projects" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$PROJECT_PAYLOAD")

PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id')
echo "Project ID: $PROJECT_ID"

# 3. Wait for scene generation
echo -e "\n✅ Step 3: Waiting for scenes to generate..."
for i in {1..30}; do
  PROJECT_STATUS=$(curl -s "$API_BASE/projects/$PROJECT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  SCENE_COUNT=$(echo "$PROJECT_STATUS" | jq -r '.scenes | length')
  echo "Scenes created: $SCENE_COUNT"
  
  if [ "$SCENE_COUNT" -ge 3 ]; then
    echo "✅ All 3 scenes created!"
    break
  fi
  
  sleep 3
done

# 4. Wait for all videos to be generated
echo -e "\n✅ Step 4: Waiting for video generation..."
for i in {1..60}; do
  PROJECT_STATUS=$(curl -s "$API_BASE/projects/$PROJECT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  COMPLETED=$(echo "$PROJECT_STATUS" | jq -r '[.scenes[].selectedVersionId] | map(select(. != null)) | length')
  echo "Videos generated: $COMPLETED / 3"
  
  if [ "$COMPLETED" -ge 3 ]; then
    echo "✅ All videos generated!"
    break
  fi
  
  sleep 3
done

# 5. Trigger stitching
echo -e "\n✅ Step 5: Triggering final stitch..."
STITCH_RESPONSE=$(curl -s -X POST "$API_BASE/projects/$PROJECT_ID/stitch" \
  -H "Authorization: Bearer $TOKEN")

echo "$STITCH_RESPONSE" | jq '.'

# 6. Wait for stitching to complete
echo -e "\n✅ Step 6: Waiting for stitch job..."
for i in {1..30}; do
  PROJECT_STATUS=$(curl -s "$API_BASE/projects/$PROJECT_ID" \
    -H "Authorization: Bearer $TOKEN")
  
  FINAL_VIDEO=$(echo "$PROJECT_STATUS" | jq -r '.finalVideoUrl // empty')
  
  if [ -n "$FINAL_VIDEO" ]; then
    echo "✅ Final video ready: $FINAL_VIDEO"
    break
  fi
  
  sleep 3
done

echo -e "\n🎉 Test complete! Check project $PROJECT_ID"
echo "Project URL: http://localhost:5173/projects/$PROJECT_ID"
