# Quick API Reference Card

## 🚀 Getting Started (30 seconds)

```bash
# Backend running on: http://localhost:3000
# Frontend running on: http://localhost:5173

# Test it's working
curl http://localhost:3000/health
```

## 🔐 Authentication

```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"you@email.com","password":"yourpass123","name":"Your Name"}'

# Login (get token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"you@email.com","password":"yourpass123"}'
```

## 📝 Projects

```bash
TOKEN="your-jwt-token-here"

# Create project (auto-generates scenes!)
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My Video",
    "audioUrl": "https://example.com/song.mp3",
    "duration": 180,
    "lyrics": "Line 1\nLine 2\nLine 3",
    "performanceDensity": 0.5
  }'

# List projects
curl http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN"

# Get project
curl http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"

# Delete project
curl -X DELETE http://localhost:3000/api/projects/PROJECT_ID \
  -H "Authorization: Bearer $TOKEN"
```

## 🎭 Characters

```bash
# Add character
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/characters \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lead Singer",
    "description": "Main vocalist",
    "isPrimary": true,
    "bible": {
      "face": "young performer",
      "wardrobe_lock": "casual style",
      "dos": ["dynamic moves"],
      "donts": ["static shots"]
    }
  }'

# List characters
curl http://localhost:3000/api/projects/PROJECT_ID/characters \
  -H "Authorization: Bearer $TOKEN"
```

## 🎬 Scenes

```bash
# Get scenes (auto-generated with project)
curl http://localhost:3000/api/projects/PROJECT_ID/scenes \
  -H "Authorization: Bearer $TOKEN"
```

## 📋 Storyboard

```bash
# Create storyboard
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/storyboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "beatGrid": {"bpm": 120, "beats": []},
    "sections": [{"name": "verse1", "startTime": 0, "endTime": 30}]
  }'

# Get storyboard
curl http://localhost:3000/api/projects/PROJECT_ID/storyboard \
  -H "Authorization: Bearer $TOKEN"
```

## 🎬 Video Stitching & Download

```bash
# Stitch scenes into final video
curl -X POST http://localhost:3000/api/projects/PROJECT_ID/stitch \
  -H "Authorization: Bearer $TOKEN"

# Get final video download URL
curl http://localhost:3000/api/projects/PROJECT_ID/download \
  -H "Authorization: Bearer $TOKEN"

# Download the video directly
VIDEO_URL=$(curl -s http://localhost:3000/api/projects/PROJECT_ID/download \
  -H "Authorization: Bearer $TOKEN" | jq -r '.video.url')
curl -o my-music-video.mp4 "$VIDEO_URL"
```

## 🎯 Quick Test Scripts

```bash
# Run full test suite
./test-api-complete.sh

# Run quick demo
./demo-api.sh
```

## 💡 Pro Tips

1. **Auto-generate everything:** Just provide lyrics + duration, system creates scenes automatically
2. **Performance density:** 0.5 = 50% scenes with lip-sync
3. **Scene types:** System auto-assigns "performance" (lip-sync) or "broll" (backdrop)
4. **Word timing:** Automatically calculated for lip-sync
5. **Character bible:** Guides Sora on character consistency

## 📊 What Gets Auto-Generated

When you create a project with lyrics:
- ✅ 1 scene per lyric line
- ✅ Timing calculated per line/word
- ✅ Prompts generated for Sora
- ✅ Lip-sync scenes selected (based on density)
- ✅ Storyboard with lyric data
- ✅ Scene ordering

## 🔥 Example: Create Video in 3 API Calls

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test1234"}' | jq -r '.token')

# 2. Create project (8 lines = 8 scenes auto-generated)
PROJECT=$(curl -s -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Vibes",
    "audioUrl": "https://example.com/song.mp3",
    "duration": 180,
    "lyrics": "Walking on sunshine\nFeeling so fine\nSummer in the air\nWithout a care\nDancing through the day\nIn our own way\nMusic all around\nLove is what we found",
    "performanceDensity": 0.5
  }')

# 3. Get the fully structured project with scenes
echo $PROJECT | jq .

# Done! 8 scenes ready for Sora generation 🎉
```

## 🌐 Service Status

Check if everything is running:
```bash
curl http://localhost:3000/health          # Backend
curl http://localhost:5173                  # Frontend
docker compose ps                           # Database services
```
