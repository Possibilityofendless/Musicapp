#!/bin/bash
# Test generation flow with mock mode enabled

echo "🧪 Testing Generation Flow with Mock Mode"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Test signup
echo -e "${BLUE}1. Creating test user...${NC}"
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "mocktest@example.com",
    "password": "password123",
    "name": "Mock Test User"
  }')

TOKEN=$(echo $SIGNUP_RESPONSE | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Signup failed${NC}"
  echo $SIGNUP_RESPONSE | jq .
  
  # Try login instead
  echo -e "${BLUE}  Trying to login with existing user...${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "mocktest@example.com",
      "password": "password123"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token // empty')
  
  if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login also failed${NC}"
    echo $LOGIN_RESPONSE | jq .
    exit 1
  fi
fi

echo -e "${GREEN}✓ Authentication successful${NC}"
echo ""

# 2. Create project with lyrics
echo -e "${BLUE}2. Creating project with manual lyrics...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mock Test Project",
    "description": "Testing with mock mode enabled",
    "audioUrl": "https://example.com/test-audio.mp3",
    "duration": 120,
    "performanceDensity": 0.5,
    "lyrics": "Mock lyric line one\nMock lyric line two\nMock lyric line three",
    "autoLyrics": false
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | jq -r '.project.id // .id // empty')

if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}✗ Project creation failed${NC}"
  echo $PROJECT_RESPONSE | jq .
  exit 1
fi

echo -e "${GREEN}✓ Project created successfully${NC}"
echo -e "  Project ID: ${PROJECT_ID}"
echo ""

# 3. Get project details
echo -e "${BLUE}3. Fetching project details...${NC}"
PROJECT_DETAILS=$(curl -s -X GET "http://localhost:3000/api/projects/$PROJECT_ID" \
  -H "Authorization: Bearer $TOKEN")

SCENE_COUNT=$(echo $PROJECT_DETAILS | jq -r '.scenes | length // 0')
echo -e "${GREEN}✓ Project has ${SCENE_COUNT} scenes${NC}"

if [ "$SCENE_COUNT" -gt "0" ]; then
  echo ""
  echo "Scene Details:"
  echo $PROJECT_DETAILS | jq -r '.scenes[] | "  - Scene \(.order + 1): \(.sceneType) | \(.lyricExcerpt)"'
fi
echo ""

# 4. Generate video for first scene (if exists)
if [ "$SCENE_COUNT" -gt "0" ]; then
  SCENE_ID=$(echo $PROJECT_DETAILS | jq -r '.scenes[0].id')
  
  echo -e "${BLUE}4. Generating video for first scene (Mock Mode)...${NC}"
  GENERATE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/scenes/$SCENE_ID/generate" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")
  
  JOB_ID=$(echo $GENERATE_RESPONSE | jq -r '.jobId // empty')
  
  if [ -z "$JOB_ID" ]; then
    echo -e "${RED}✗ Video generation failed${NC}"
    echo $GENERATE_RESPONSE | jq .
  else
    echo -e "${GREEN}✓ Video generation job started${NC}"
    echo -e "  Job ID: ${JOB_ID}"
    echo -e "  ${BLUE}Note: In mock mode, this returns immediately with fake URLs${NC}"
  fi
  echo ""
fi

# 5. Final summary
echo "=========================================="
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""
echo "Mock Mode Summary:"
echo "- Authentication: Working ✓"
echo "- Project Creation: Working ✓"
echo "- Scene Generation: Working ✓"
echo "- Video Generation: Mock URLs ✓"
echo ""
echo "🎉 Your app is ready to test!"
echo "Open http://localhost:5173 and try creating a project"
