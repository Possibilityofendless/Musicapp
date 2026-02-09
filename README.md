# MusicApp 🎬

AI-powered music video generator with Sora integration and advanced lip-sync capabilities.

## Features

- 🎥 **Video Generation**: Generate scenes using OpenAI's Sora API
- 💋 **Lip-Sync**: Automatic lip-sync detection and optional post-processing
- 🎵 **Audio Analysis**: Vocal extraction and forced phoneme alignment
- 🎨 **Scene Editing**: Drag-to-reorder scenes with customizable settings
- 📊 **Job Queue**: Background processing with Redis job queues
- 🗄️ **Database**: PostgreSQL with Prisma ORM for data persistence
- 🔐 **Authentication**: User signup/login with JWT token authentication

## Tech Stack

### Frontend
- React 18 with TypeScript
- Zustand for state management
- Tailwind CSS for styling
- Vite for bundling

### Backend
- Node.js + Express
- Prisma ORM
- PostgreSQL database
- Bull job queue with Redis
- OpenAI API integration

### Infrastructure
- Docker & Docker Compose
- Python workers for audio processing
- FFmpeg for video processing

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- FFmpeg (for video processing)
- OpenAI API key (for Sora access)

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone and setup
git clone <repo-url>
cd Musicapp

# Run setup script
bash setup.sh

# Or manually:
cp .env.example .env
docker-compose up -d
```

The setup script will:
1. Copy `.env.example` to `.env`
2. Start all Docker containers
3. Run database migrations
4. Initialize the system

### Option 2: Local Development

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your settings

# Start PostgreSQL and Redis (using Docker)
docker-compose up postgres redis -d

# Run migrations
npm run prisma:push -w backend

# Start development servers
npm run dev
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and update the following:

```env
# Required
DATABASE_URL=postgresql://musicapp:musicapp_dev@localhost:5432/musicapp
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=sk-your-key-here

# Optional (defaults provided)
PORT=3000
USE_SORA_MOCK=true  # Use mock data for testing
SORA_POLL_INTERVAL=60000
NODE_ENV=development
```

See `.env.example` for all available options.

## Project Structure

```
packages/
├── backend/          # Express server + job processing
│   ├── src/
│   │   ├── routes/   # API endpoints
│   │   ├── services/ # Sora API integration
│   │   ├── workers/  # Job processors
│   │   └── lib/      # Utilities (video stitching, audio processing)
│   └── prisma/       # Database schema & migrations
├── frontend/         # React UI
│   ├── src/
│   │   ├── pages/    # Route pages
│   │   ├── components/ # Reusable components
│   │   └── lib/      # API client & utilities
│   └── styles/       # CSS utilities
└── workers/          # Python workers (future)
```

## Database

### Migrations

Prisma is configured to automatically sync the schema with the database. To make changes:

```bash
# Update schema.prisma, then:
npm run prisma:push -w backend      # Push to DB
npm run prisma:generate -w backend  # Generate Prisma client

# For version-controlled migrations (production):
npm run prisma:migrate -w backend   # Create migration files
```

### Schema Overview

- **User**: User accounts (multi-user support ready)
- **Project**: Music video projects with metadata
- **Storyboard**: Lyrics and timing data
- **Scene**: Individual video clips (performance or B-roll)
- **VocalSegment**: Extracted vocal audio with phoneme alignment
- **GeneratedVideo**: Video outputs (Sora raw, post-processed, final)
- **ProcessingJob**: Background job tracking

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `GET /api/auth/me` - Get current user (requires auth token)

### Projects
- `GET /api/projects` - List all projects (requires auth)
- `POST /api/projects` - Create project (requires auth)
- `GET /api/projects/:id` - Get project details (requires auth)
- `PATCH /api/projects/:id` - Update project (requires auth)
- `DELETE /api/projects/:id` - Delete project (requires auth)
- `POST /api/projects/:id/generate` - Start video generation (requires auth)
- `GET /api/projects/:id/jobs` - Get processing jobs (requires auth)

### Scenes
- `GET /api/projects/:id/scenes` - List scenes (requires auth)
- `PATCH /api/scenes/:id` - Update scene (requires auth)
- `DELETE /api/scenes/:id` - Delete scene (requires auth)
- `POST /api/projects/:id/scenes/reorder` - Reorder scenes (requires auth)

## Authentication

### Overview
The application uses JWT (JSON Web Token) based authentication. Users must sign up for an account and authenticate before accessing projects.

### How It Works
1. User signs up with email and password (password is bcrypt hashed)
2. Backend generates JWT token valid for 7 days
3. Frontend stores token in localStorage
4. All authenticated requests include `Authorization: Bearer {token}` header
5. Backend validates token before processing requests

### Demo Credentials
For quick testing:
- **Email**: `demo@example.com`
- **Password**: `password123`

These are created automatically when the database is seeded.

### Security Notes
- Passwords are hashed with bcryptjs (salt rounds: 10)
- JWT secret should be changed in production (see `.env`)
- Tokens expire after 7 days (configurable in auth routes)
- All project endpoints require valid authentication

## Development

### Running Services

```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose down
```

### Available npm Scripts

```bash
# Frontend
npm run dev -w frontend          # Dev server
npm run build -w frontend        # Production build
npm run preview -w frontend      # Preview build

# Backend
npm run dev -w backend           # Dev server with hot reload
npm run build -w backend         # Compile TypeScript
npm run start -w backend         # Run compiled app
npm run prisma:push -w backend   # Sync schema to DB
npm run prisma:generate -w backend # Generate Prisma client
```

## Video Generation Workflow

1. **Create Project**: User uploads audio and lyrics
2. **Generate Scenes**: AI creates storyboard with scene descriptions
3. **Generate Videos**: Each scene sent to Sora API for video generation
4. **Post-Processing**: Optional lip-sync alignment and audio sync
5. **Stitch Videos**: Combine scenes into final output
6. **Export**: Final video available for download

### Job Types

- `generate_scenes`: Break lyrics into scenes
- `vocal_extraction`: Extract vocals from audio
- `forced_alignment`: Align phonemes to audio
- `lip_sync_post_process`: Generate video with Sora
- `stitch_final`: Combine scenes into final video
- `quality_check`: Verify mouth visibility

## Features (Future)

- [ ] Cloud storage integration (S3)
- [ ] Social login (Google/GitHub OAuth)
- [ ] Advanced lip-sync post-processing with AI
- [ ] Video preview and timeline editor
- [ ] Batch project processing
- [ ] Analytics dashboard
- [ ] Advanced lip-sync post-processing
- [ ] Style transfer & character customization
- [ ] Batch video generation
- [ ] Video timeline editor
- [ ] Real-time preview
- [ ] Export presets (YouTube, TikTok, etc.)

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
docker-compose logs postgres

# Reset database
docker-compose down -v
docker-compose up
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml or .env
# Or kill existing process:
lsof -ti:5432,6379,3000,5173 | xargs kill -9
```

### Sora API Errors
```bash
# Enable mock mode in .env:
USE_SORA_MOCK=true

# Check API key is valid
# Verify OpenAI account has Sora access
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally: `npm run dev`
4. Submit a pull request

## License

MIT

## Support

For issues and questions, create an issue on GitHub or contact the team.