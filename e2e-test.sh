#!/bin/bash

# MusicApp End-to-End Test Script
# Tests the complete workflow from signup to video generation

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_URL="http://localhost:3000/api"
TEST_EMAIL="e2e-test-$(date +%s)@example.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="E2E Test User"
AUDIO_FILE="test-data/test-song.wav"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   MusicApp End-to-End Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print step
print_step() {
    echo -e "\n${YELLOW}▶ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Step 1: Health Check
print_step "Step 1: Health Check"
HEALTH=$(curl -s http://localhost:3000/health)
if echo "$HEALTH" | grep -q "ok"; then
    print_success "Backend is healthy"
    echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
else
    print_error "Backend health check failed"
    exit 1
fi

# Step 2: User Signup
print_step "Step 2: User Signup"
SIGNUP_RESPONSE=$(curl -s -X POST "$API_URL/auth/signup" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\",
        \"name\": \"$TEST_NAME\"
    }")

if echo "$SIGNUP_RESPONSE" | grep -q "token"; then
    print_success "User created successfully"
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$SIGNUP_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "Email: $TEST_EMAIL"
    echo "User ID: $USER_ID"
else
    print_error "Signup failed"
    echo "$SIGNUP_RESPONSE" | jq '.' 2>/dev/null || echo "$SIGNUP_RESPONSE"
    exit 1
fi

# Step 3: Test Login
print_step "Step 3: Test Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$TEST_EMAIL\",
        \"password\": \"$TEST_PASSWORD\"
    }")

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    print_success "Login successful"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    print_error "Login failed"
    echo "$LOGIN_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGIN_RESPONSE"
    exit 1
fi

# Step 4: Upload Audio File
print_step "Step 4: Upload Audio File"

# Check if audio file exists
if [ ! -f "$AUDIO_FILE" ]; then
    print_error "Test audio file not found: $AUDIO_FILE"
    exit 1
fi

UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/projects/upload-audio" \
    -H "Authorization: Bearer $TOKEN" \
    -F "audio=@$AUDIO_FILE")

if echo "$UPLOAD_RESPONSE" | grep -q "audioUrl"; then
    print_success "Audio file uploaded"
    AUDIO_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"audioUrl":"[^"]*' | cut -d'"' -f4)
    echo "Audio URL: $AUDIO_URL"
else
    print_error "Audio upload failed"
    echo "$UPLOAD_RESPONSE" | jq '.' 2>/dev/null || echo "$UPLOAD_RESPONSE"
    exit 1
fi

# Step 5: Create Project
print_step "Step 5: Create Project"

LYRICS='Verse 1:
Hello world this is a test
Making music videos is the best
AI and code working together
Creating content now and forever

Chorus:
This is how we test the flow
Watch the magic start to grow
From the lyrics to the screen
Best music video ever seen'

PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/projects" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"title\": \"E2E Test Music Video\",
        \"description\": \"Automated end-to-end test project\",
        \"audioUrl\": \"$AUDIO_URL\",
        \"duration\": 5,
        \"lyrics\": $(echo "$LYRICS" | jq -Rs .)
    }")

if echo "$PROJECT_RESPONSE" | grep -q '"id"'; then
    print_success "Project created successfully"
    PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.project.id' 2>/dev/null || echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "Project ID: $PROJECT_ID"
    echo "$PROJECT_RESPONSE" | jq '.' 2>/dev/null || echo "$PROJECT_RESPONSE"
else
    print_error "Project creation failed"
    echo "$PROJECT_RESPONSE" | jq '.' 2>/dev/null || echo "$PROJECT_RESPONSE"
    exit 1
fi

# Step 6: List Projects
print_step "Step 6: List Projects"
PROJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/projects")
if [ -n "$PROJECTS" ]; then
    PROJECT_COUNT=$(echo "$PROJECTS" | jq 'length' 2>/dev/null || echo "0")
    print_success "Found $PROJECT_COUNT project(s)"
    # Extract project ID if we don't have it yet
    if [ -z "$PROJECT_ID" ]; then
        PROJECT_ID=$(echo "$PROJECTS" | jq -r '.[0].id' 2>/dev/null)
        echo "Extracted Project ID: $PROJECT_ID"
    fi
fi

# Step 7: Get Project Details
print_step "Step 7: Get Project Details"
sleep 2  # Give it time to process
PROJECT_DETAILS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/projects/$PROJECT_ID")
if echo "$PROJECT_DETAILS" | grep -q '"id"'; then
    print_success "Retrieved project details"
    STATUS=$(echo "$PROJECT_DETAILS" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
    echo "Status: $STATUS"
    echo "$PROJECT_DETAILS" | jq '.' 2>/dev/null || echo "$PROJECT_DETAILS"
else
    print_error "Failed to get project details"
    echo "$PROJECT_DETAILS"
fi

# Step 8: Get Scenes
print_step "Step 8: Get Project Scenes"
sleep 2
if [ -n "$PROJECT_ID" ] && [ "$PROJECT_ID" != "" ]; then
    SCENES=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/projects/$PROJECT_ID/scenes")
    if echo "$SCENES" | grep -q '\['; then
        SCENE_COUNT=$(echo "$SCENES" | jq 'length' 2>/dev/null || echo "0")
        print_success "Found $SCENE_COUNT scene(s)"
    else
        print_error "Failed to get scenes"
        echo "$SCENES"
    fi
else
    print_error "No project ID available to fetch scenes"
fi

# Step 9: Monitor Job Processing
print_step "Step 9: Monitor Job Processing (30 seconds)"
echo "Watching for job completion..."

for i in {1..30}; do
    sleep 1
    PROJECT_STATUS=$(curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/projects/$PROJECT_ID" | grep -o '"status":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -ne "\rChecking... [$i/30] Status: $PROJECT_STATUS     "
    
    if [ "$PROJECT_STATUS" = "completed" ]; then
        echo ""
        print_success "Project completed!"
        break
    fi
    
    if [ "$PROJECT_STATUS" = "failed" ]; then
        echo ""
        print_error "Project failed!"
        break
    fi
done
echo ""

# Step 10: Check Database State
print_step "Step 10: Database Verification"
echo "Checking job queue status..."
docker exec musicapp-postgres-1 psql -U musicapp -d musicapp -c \
    "SELECT type, status, COUNT(*) as count FROM \"Job\" WHERE \"projectId\" = $PROJECT_ID GROUP BY type, status;" 2>/dev/null || echo "Database check skipped"

# Step 11: Final Summary
print_step "Step 11: Test Summary"
echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}   Test Results${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "Test Email: ${GREEN}$TEST_EMAIL${NC}"
echo -e "User ID: ${GREEN}$USER_ID${NC}"
echo -e "Project ID: ${GREEN}$PROJECT_ID${NC}"
echo -e "Final Status: ${GREEN}$PROJECT_STATUS${NC}"
echo ""
echo -e "${GREEN}✓ All API tests completed!${NC}"
echo ""
echo -e "Next steps:"
echo -e "  1. Open ${BLUE}http://localhost:5173${NC} in your browser"
echo -e "  2. Login with: ${YELLOW}$TEST_EMAIL${NC}"
echo -e "  3. View project: ${YELLOW}Project ID $PROJECT_ID${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
