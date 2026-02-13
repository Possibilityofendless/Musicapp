#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"
TEST_EMAIL="apitest-$(date +%s)@example.com"
TEST_PASSWORD="testpass123"

echo -e "${YELLOW}=== MusicApp API Test Suite ===${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}[1] Testing Health Check...${NC}"
HEALTH=$(curl -s "${BASE_URL}/health")
if echo "$HEALTH" | grep -q "ok"; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "$HEALTH" | jq .
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Root Endpoint
echo -e "${YELLOW}[2] Testing Root Endpoint...${NC}"
ROOT=$(curl -s "${BASE_URL}/")
if echo "$ROOT" | grep -q "imaginalllthat"; then
    echo -e "${GREEN}✓ Root endpoint passed${NC}"
    echo "$ROOT" | jq .
else
    echo -e "${RED}✗ Root endpoint failed${NC}"
fi
echo ""

# Test 3: Signup
echo -e "${YELLOW}[3] Testing User Signup...${NC}"
SIGNUP=$(curl -s -X POST "${BASE_URL}/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"API Test User\"}")

if echo "$SIGNUP" | grep -q "token"; then
    echo -e "${GREEN}✓ Signup successful${NC}"
    TOKEN=$(echo "$SIGNUP" | jq -r '.token')
    USER_ID=$(echo "$SIGNUP" | jq -r '.user.id')
    echo "User ID: $USER_ID"
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Signup failed${NC}"
    echo "$SIGNUP" | jq .
    exit 1
fi
echo ""

# Test 4: Login
echo -e "${YELLOW}[4] Testing User Login...${NC}"
LOGIN=$(curl -s -X POST "${BASE_URL}/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")

if echo "$LOGIN" | grep -q "token"; then
    echo -e "${GREEN}✓ Login successful${NC}"
    TOKEN=$(echo "$LOGIN" | jq -r '.token')
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "$LOGIN" | jq .
    exit 1
fi
echo ""

# Test 5: List Projects (should be empty)
echo -e "${YELLOW}[5] Testing List Projects (empty)...${NC}"
PROJECTS=$(curl -s "${BASE_URL}/api/projects" \
  -H "Authorization: Bearer $TOKEN")
echo "$PROJECTS" | jq .
echo ""

# Test 6: Create Project (with manual lyrics)
echo -e "${YELLOW}[6] Testing Create Project...${NC}"
CREATE_PROJECT=$(curl -s -X POST "${BASE_URL}/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API Test Music Video",
    "description": "Testing project creation via API",
    "audioUrl": "https://example.com/test-song.mp3",
    "duration": 180,
    "lyrics": "Walking down the street\nFeeling so free\nDancing in the moonlight\nJust you and me\nMusic plays so sweet\nHearts in harmony\nThis is where we meet\nOur destiny",
    "performanceDensity": 0.5
  }')

if echo "$CREATE_PROJECT" | grep -q "id"; then
    echo -e "${GREEN}✓ Project created successfully${NC}"
    PROJECT_ID=$(echo "$CREATE_PROJECT" | jq -r '.project.id // .id')
    echo "Project ID: $PROJECT_ID"
    echo "$CREATE_PROJECT" | jq .
else
    echo -e "${RED}✗ Project creation failed${NC}"
    echo "$CREATE_PROJECT" | jq .
    exit 1
fi
echo ""

# Test 7: Get Project Details
echo -e "${YELLOW}[7] Testing Get Project Details...${NC}"
PROJECT=$(curl -s "${BASE_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROJECT" | grep -q "$PROJECT_ID"; then
    echo -e "${GREEN}✓ Project details retrieved${NC}"
    echo "$PROJECT" | jq .
else
    echo -e "${RED}✗ Failed to get project details${NC}"
fi
echo ""

# Test 8: List Projects (should have 1)
echo -e "${YELLOW}[8] Testing List Projects (with data)...${NC}"
PROJECTS_LIST=$(curl -s "${BASE_URL}/api/projects" \
  -H "Authorization: Bearer $TOKEN")

PROJECT_COUNT=$(echo "$PROJECTS_LIST" | jq 'length')
if [ "$PROJECT_COUNT" -ge 1 ]; then
    echo -e "${GREEN}✓ Projects listed successfully (count: $PROJECT_COUNT)${NC}"
    echo "$PROJECTS_LIST" | jq .
else
    echo -e "${RED}✗ Projects list not as expected${NC}"
fi
echo ""

# Test 9: Create Character
echo -e "${YELLOW}[9] Testing Create Character...${NC}"
CREATE_CHAR=$(curl -s -X POST "${BASE_URL}/api/projects/${PROJECT_ID}/characters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Singer",
    "description": "The lead vocalist for the music video",
    "isPrimary": true,
    "bible": {
      "face": "young woman with long hair",
      "wardrobe_lock": "casual streetwear",
      "dos": ["energetic performances", "dynamic movements"],
      "donts": ["static poses"]
    }
  }')

if echo "$CREATE_CHAR" | grep -q "id"; then
    echo -e "${GREEN}✓ Character created successfully${NC}"
    CHAR_ID=$(echo "$CREATE_CHAR" | jq -r '.id')
    echo "Character ID: $CHAR_ID"
    echo "$CREATE_CHAR" | jq .
else
    echo -e "${RED}✗ Character creation failed${NC}"
    echo "$CREATE_CHAR" | jq .
fi
echo ""

# Test 10: List Characters
echo -e "${YELLOW}[10] Testing List Characters...${NC}"
CHARS=$(curl -s "${BASE_URL}/api/projects/${PROJECT_ID}/characters" \
  -H "Authorization: Bearer $TOKEN")
echo "$CHARS" | jq .
echo ""

# Test 11: Update Project Settings
echo -e "${YELLOW}[11] Testing Update Project...${NC}"
UPDATE_PROJECT=$(curl -s -X PUT "${BASE_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated API Test Video",
    "description": "Updated description via API",
    "performanceDensity": 0.7
  }')

if echo "$UPDATE_PROJECT" | grep -q "id"; then
    echo -e "${GREEN}✓ Project updated successfully${NC}"
    echo "$UPDATE_PROJECT" | jq .
else
    echo -e "${RED}✗ Project update failed${NC}"
    echo "$UPDATE_PROJECT" | jq .
fi
echo ""

# Test 12: Create Multiple Scenes
echo -e "${YELLOW}[12] Testing Create Scenes...${NC}"
CREATE_SCENES=$(curl -s -X PUT "${BASE_URL}/api/projects/${PROJECT_ID}/scenes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "lyricSnippet": "Walking down the street",
      "prompt": "Young woman walking confidently down a city street at sunset",
      "characterId": "'"$CHAR_ID"'",
      "needsLipSync": true
    },
    {
      "lyricSnippet": "Feeling so free",
      "prompt": "Wide shot of city skyline with person in foreground",
      "characterId": "'"$CHAR_ID"'",
      "needsLipSync": false
    },
    {
      "lyricSnippet": "Dancing in the moonlight",
      "prompt": "Person dancing under moonlight in an urban park",
      "characterId": "'"$CHAR_ID"'",
      "needsLipSync": true
    }
  ]')

if echo "$CREATE_SCENES" | grep -q "scenes"; then
    echo -e "${GREEN}✓ Scenes created successfully${NC}"
    SCENE_COUNT=$(echo "$CREATE_SCENES" | jq '.scenes | length')
    echo "Scene count: $SCENE_COUNT"
    echo "$CREATE_SCENES" | jq '.scenes[] | {sequenceOrder, lyricSnippet, needsLipSync}'
else
    echo -e "${RED}✗ Scene creation failed${NC}"
    echo "$CREATE_SCENES" | jq .
fi
echo ""

# Test 13: Get Scenes
echo -e "${YELLOW}[13] Testing Get Scenes...${NC}"
SCENES=$(curl -s "${BASE_URL}/api/projects/${PROJECT_ID}/scenes" \
  -H "Authorization: Bearer $TOKEN")
echo "$SCENES" | jq .
echo ""

# Test 14: Create Storyboard
echo -e "${YELLOW}[14] Testing Create Storyboard...${NC}"
CREATE_STORYBOARD=$(curl -s -X POST "${BASE_URL}/api/projects/${PROJECT_ID}/storyboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "beatGrid": {
      "bpm": 120,
      "beats": [
        {"time": 0.0, "strength": 1.0},
        {"time": 0.5, "strength": 0.8},
        {"time": 1.0, "strength": 1.0}
      ]
    },
    "sections": [
      {"name": "intro", "startTime": 0.0, "endTime": 10.0, "type": "instrumental"},
      {"name": "verse1", "startTime": 10.0, "endTime": 40.0, "type": "vocals"}
    ]
  }')

if echo "$CREATE_STORYBOARD" | grep -q "id"; then
    echo -e "${GREEN}✓ Storyboard created successfully${NC}"
    echo "$CREATE_STORYBOARD" | jq .
else
    echo -e "${RED}✗ Storyboard creation failed${NC}"
    echo "$CREATE_STORYBOARD" | jq .
fi
echo ""

# Test 15: Get Storyboard
echo -e "${YELLOW}[15] Testing Get Storyboard...${NC}"
STORYBOARD=$(curl -s "${BASE_URL}/api/projects/${PROJECT_ID}/storyboard" \
  -H "Authorization: Bearer $TOKEN")
echo "$STORYBOARD" | jq .
echo ""

# Test 16: Delete Project
echo -e "${YELLOW}[16] Testing Delete Project...${NC}"
DELETE=$(curl -s -X DELETE "${BASE_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE" | grep -q "deleted" || echo "$DELETE" | grep -q "success"; then
    echo -e "${GREEN}✓ Project deleted successfully${NC}"
    echo "$DELETE" | jq .
else
    echo -e "${RED}✗ Project deletion might have failed${NC}"
    echo "$DELETE"
fi
echo ""

# Test 17: Verify Deletion
echo -e "${YELLOW}[17] Verifying Project Deletion...${NC}"
DELETED_CHECK=$(curl -s "${BASE_URL}/api/projects/${PROJECT_ID}" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETED_CHECK" | grep -q "not found" || echo "$DELETED_CHECK" | grep -q "error"; then
    echo -e "${GREEN}✓ Project successfully deleted${NC}"
else
    echo -e "${YELLOW}⚠ Project might still exist${NC}"
fi
echo ""

# Test 18: Unauthorized Access
echo -e "${YELLOW}[18] Testing Unauthorized Access...${NC}"
UNAUTH=$(curl -s "${BASE_URL}/api/projects")
if echo "$UNAUTH" | grep -q "Unauthorized" || echo "$UNAUTH" | grep -q "token"; then
    echo -e "${GREEN}✓ Unauthorized access properly blocked${NC}"
else
    echo -e "${RED}✗ Security issue: unauthorized access allowed${NC}"
fi
echo "$UNAUTH"
echo ""

# Summary
echo -e "${YELLOW}=== Test Summary ===${NC}"
echo -e "${GREEN}✓ All critical API endpoints tested${NC}"
echo -e "Backend URL: ${BASE_URL}"
echo -e "Test User: ${TEST_EMAIL}"
echo -e "Project ID: ${PROJECT_ID}"
echo ""
