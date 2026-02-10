#!/bin/bash

# MusicApp Production Testing Script
# Test deployed API at: https://musicapp-production-4e4b.up.railway.app

set -e

BASE_URL="https://musicapp-production-4e4b.up.railway.app"
API_URL="${BASE_URL}/api"

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}MusicApp Production Testing${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}[1/8] Testing Health Check...${NC}"
HEALTH=$(curl -s "${BASE_URL}/health")
if echo "$HEALTH" | grep -q "ok"; then
  echo -e "${GREEN}✓ Health check passed${NC}"
  echo "  Response: $HEALTH"
else
  echo -e "${RED}✗ Health check failed${NC}"
  exit 1
fi

# Test 2: API Status
echo -e "\n${YELLOW}[2/8] Getting API Status...${NC}"
STATUS=$(curl -s "${BASE_URL}/")
echo -e "${GREEN}✓ API Status:${NC}"
echo "$STATUS" | jq .

# Test 3: User Registration
echo -e "\n${YELLOW}[3/8] Testing User Registration...${NC}"
TEST_EMAIL="test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Test User"

SIGNUP_RESPONSE=$(curl -s -X POST "${API_URL}/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\",
    \"name\": \"${TEST_NAME}\"
  }")

if echo "$SIGNUP_RESPONSE" | grep -q "id\|email"; then
  USER_ID=$(echo "$SIGNUP_RESPONSE" | jq -r '.id // .user.id // .userId' 2>/dev/null)
  echo -e "${GREEN}✓ User registration successful${NC}"
  echo "  Email: $TEST_EMAIL"
  echo "  User ID: ${USER_ID:-<returned>}"
  echo "  Response: $(echo $SIGNUP_RESPONSE | jq . 2>/dev/null | head -5)"
else
  echo -e "${RED}✗ User registration failed${NC}"
  echo "  Response: $SIGNUP_RESPONSE"
  exit 1
fi

# Test 4: User Login
echo -e "\n${YELLOW}[4/8] Testing User Login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"${TEST_EMAIL}\",
    \"password\": \"${TEST_PASSWORD}\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
  TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token' 2>/dev/null)
  echo -e "${GREEN}✓ Login successful${NC}"
  echo "  Token: ${TOKEN:0:20}... (truncated)"
else
  echo -e "${RED}✗ Login failed${NC}"
  echo "  Response: $LOGIN_RESPONSE"
  exit 1
fi

# Test 5: Get Current User
echo -e "\n${YELLOW}[5/8] Testing Get Current User...${NC}"
USER_RESPONSE=$(curl -s -X GET "${API_URL}/auth/me" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$USER_RESPONSE" | grep -q "email"; then
  echo -e "${GREEN}✓ Get current user successful${NC}"
  echo "$USER_RESPONSE" | jq .
else
  echo -e "${RED}✗ Get current user failed${NC}"
  echo "  Response: $USER_RESPONSE"
  exit 1
fi

# Test 6: Create Project
echo -e "\n${YELLOW}[6/8] Testing Create Project...${NC}"
PROJECT_RESPONSE=$(curl -s -X POST "${API_URL}/projects" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Music Video",
    "description": "API test project",
    "audioUrl": "https://example.com/test.mp3",
    "duration": 180,
    "performanceDensity": 0.5,
    "lyrics": "Test lyrics for the video"
  }')

if echo "$PROJECT_RESPONSE" | grep -q "id"; then
  PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id // .project.id' 2>/dev/null)
  echo -e "${GREEN}✓ Create project successful${NC}"
  echo "  Project ID: $PROJECT_ID"
  echo "  Response: $(echo $PROJECT_RESPONSE | jq . 2>/dev/null | head -10)"
else
  echo -e "${RED}✗ Create project failed${NC}"
  echo "  Response: $PROJECT_RESPONSE"
  exit 1
fi

# Test 7: List Projects
echo -e "\n${YELLOW}[7/8] Testing List Projects...${NC}"
LIST_RESPONSE=$(curl -s -X GET "${API_URL}/projects" \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$LIST_RESPONSE" | grep -q "id\|\[\]"; then
  echo -e "${GREEN}✓ List projects successful${NC}"
  PROJECT_COUNT=$(echo "$LIST_RESPONSE" | jq '.projects | length' 2>/dev/null || echo "?")
  echo "  Found $PROJECT_COUNT project(s)"
  echo "  Response: $(echo $LIST_RESPONSE | jq . 2>/dev/null | head -10)"
else
  echo -e "${RED}✗ List projects failed${NC}"
  echo "  Response: $LIST_RESPONSE"
  exit 1
fi

# Test 8: Create Character
echo -e "\n${YELLOW}[8/8] Testing Create Character...${NC}"
CHAR_RESPONSE=$(curl -s -X POST "${API_URL}/projects/${PROJECT_ID}/characters" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Character",
    "description": "The main vocalist",
    "isPrimary": true
  }')

if echo "$CHAR_RESPONSE" | grep -q "id\|name"; then
  echo -e "${GREEN}✓ Create character successful${NC}"
  echo "  Response: $(echo $CHAR_RESPONSE | jq . 2>/dev/null | head -5)"
else
  echo -e "${RED}✗ Create character failed${NC}"
  echo "  Response: $CHAR_RESPONSE"
  exit 1
fi

# Summary
echo -e "\n${BLUE}========================================${NC}"
echo -e "${GREEN}✓ ALL TESTS PASSED!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Test Summary:"
echo "  • Health Check: ✓"
echo "  • API Status: ✓"
echo "  • Registration: ✓"
echo "  • Login: ✓"
echo "  • Get User: ✓"
echo "  • Create Project: ✓"
echo "  • List Projects: ✓"
echo "  • Create Character: ✓"
echo ""
echo "Test Credentials Created:"
echo "  Email: $TEST_EMAIL"
echo "  Password: $TEST_PASSWORD"
echo "  Token: ${TOKEN:0:20}..."
echo ""
echo "Project Created:"
echo "  ID: $PROJECT_ID"
echo ""
echo "Next Steps:"
echo "  1. Visit: https://musicapp-production-4e4b.up.railway.app"
echo "  2. Sign in with: $TEST_EMAIL / $TEST_PASSWORD"
echo "  3. Create and edit music videos!"
echo ""
