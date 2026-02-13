#!/bin/bash
# Quick API demo - Shows a complete workflow

echo "=== Quick API Demo ==="
echo ""

BASE="http://localhost:3000"

# 1. Create account
echo "→ Creating user account..."
SIGNUP=$(curl -s -X POST "$BASE/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"demo1234","name":"Demo User"}')
TOKEN=$(echo "$SIGNUP" | jq -r '.token // empty')

if [ -z "$TOKEN" ]; then
  # Login if user already exists
  echo "  User exists, logging in..."
  LOGIN=$(curl -s -X POST "$BASE/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"demo@test.com","password":"demo1234"}')
  TOKEN=$(echo "$LOGIN" | jq -r '.token')
fi

echo "  ✓ Authenticated"
echo ""

# 2. Create project
echo "→ Creating music video project..."
PROJECT=$(curl -s -X POST "$BASE/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Music Video",
    "description": "A demo project",
    "audioUrl": "https://example.com/song.mp3",
    "duration": 120,
    "lyrics": "Verse one line one\nVerse one line two\nChorus here we go\nChorus sing along\nVerse two begins\nVerse two continues\nFinal chorus time\nEnding of the song",
    "performanceDensity": 0.5
  }')

PID=$(echo "$PROJECT" | jq -r '.project.id')
SCENE_COUNT=$(echo "$PROJECT" | jq -r '.project.scenes | length')
echo "  ✓ Project created: $PID"
echo "  ✓ Auto-generated $SCENE_COUNT scenes"
echo ""

# 3. Add character
echo "→ Adding character..."
CHAR=$(curl -s -X POST "$BASE/api/projects/$PID/characters" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lead Vocalist",
    "description": "Main performing artist",
    "isPrimary": true,
    "bible": {
      "face": "confident performer with charisma",
      "wardrobe_lock": "modern urban style",
      "dos": ["dynamic movements", "engaging camera presence"],
      "donts": ["static shots"]
    }
  }')

CHAR_ID=$(echo "$CHAR" | jq -r '.character.id')
echo "  ✓ Character added: $CHAR_ID"
echo ""

# 4. Get project details
echo "→ Fetching project details..."
DETAILS=$(curl -s "$BASE/api/projects/$PID" \
  -H "Authorization: Bearer $TOKEN")

echo "  Project Status:"
echo "  - Title: $(echo "$DETAILS" | jq -r '.title')"
echo "  - Duration: $(echo "$DETAILS" | jq -r '.duration')s"
echo "  - Format: $(echo "$DETAILS" | jq -r '.format')"
echo "  - Performance Density: $(echo "$DETAILS" | jq -r '.performanceDensity')"
echo "  - Budget Cap: \$$(echo "$DETAILS" | jq -r '.budgetCapUsd')"
echo ""

# 5. Show scene breakdown  
echo "→ Scene breakdown:"
SCENES=$(curl -s "$BASE/api/projects/$PID/scenes" \
  -H "Authorization: Bearer $TOKEN")

echo "$SCENES" | jq -r '.[] | "  Scene \(.order + 1): \(.sceneType) | \(.lyricExcerpt) | Lip-sync: \(if .lipSyncEnabled then "✓" else "✗" end)"'
echo ""

# 6. Storyboard info
echo "→ Storyboard data:"
STORY=$(curl -s "$BASE/api/projects/$PID/storyboard" \
  -H "Authorization: Bearer $TOKEN")

LINE_COUNT=$(echo "$STORY" | jq -r '.lyricsData.lines | length')
WORD_COUNT=$(echo "$STORY" | jq -r '.lyricsData.words | length')
echo "  - Lyric lines: $LINE_COUNT"
echo "  - Words timed: $WORD_COUNT"
echo ""

echo "=== Demo Complete ==="
echo ""
echo "Next steps:"
echo "  1. Add OpenAI API key to .env for real Sora generation"
echo "  2. Use frontend: http://localhost:5173"
echo "  3. Start Python workers for audio processing"
echo ""
echo "Project ID for reference: $PID"
