# Videgen Quick Start Guide

Get Videgen up and running in under 10 minutes!

## Prerequisites

Before you begin, make sure you have:

- **Node.js 20+** or **Bun** installed
- **PostgreSQL 15+** running locally or in the cloud
- **pnpm** (recommended) - `npm install -g pnpm`
- **Git** for version control

## Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/videgen.git
cd videgen

# Install dependencies
pnpm install
```

## Step 2: Environment Setup

### Backend Configuration

Create `apps/api/.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/videgen"

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET="your-super-secret-jwt-key-here"

# OpenAI API Key (for script generation)
OPENAI_API_KEY="sk-..."

# Google Cloud (for TTS)
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_API_KEY="..."

# Google Veo 3 (for video generation)
GOOGLE_VEO3_API_KEY="..."

# ElevenLabs (optional, for better TTS)
ELEVENLABS_API_KEY="..."

# Unsplash (for images)
UNSPLASH_ACCESS_KEY="..."

# Cloud Storage
STORAGE_PROVIDER="gcs" # or "s3"
STORAGE_BUCKET="videgen-videos"
GCS_PROJECT_ID="your-project-id"
GCS_KEY_FILE="./credentials.json"

# Redis (optional, for job queue)
REDIS_URL="redis://localhost:6379"

# Server
PORT=3001
NODE_ENV="development"
```

### Frontend Configuration

Create `apps/web/.env.local`:

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## Step 3: Database Setup

```bash
# Navigate to backend
cd apps/api

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev --name init

# (Optional) Seed database with sample data
pnpm prisma db seed
```

## Step 4: Start Development Servers

### Option A: Using Turbo (Recommended)

From the root directory:

```bash
# Start both frontend and backend
pnpm dev
```

### Option B: Manual Start

Terminal 1 - Backend:
```bash
cd apps/api
pnpm dev
```

Terminal 2 - Frontend:
```bash
cd apps/web
pnpm dev
```

## Step 5: Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Prisma Studio**: `cd apps/api && pnpm prisma studio`

## Step 6: Create Your First Video

1. **Register an Account**
   - Navigate to http://localhost:3000/register
   - Create your account

2. **Create a Project**
   - Click "New Project"
   - Give it a name (e.g., "Educational Videos")

3. **Generate a Video**
   - Click "Create Video"
   - Enter topic: "How long does it take to plant rice until ready for harvest?"
   - Click "Generate Script"
   - Review and edit the generated script
   - Click "Generate Voice"
   - Review AI-recommended images
   - Click "Generate Video"
   - Wait 2-3 minutes for video generation
   - Download your video!

---

## Common Issues & Solutions

### Issue: Database Connection Error

```
Error: Can't reach database server at `localhost:5432`
```

**Solution**: Make sure PostgreSQL is running
```bash
# macOS (Homebrew)
brew services start postgresql

# Ubuntu/Debian
sudo service postgresql start

# Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
```

### Issue: API Key Errors

```
Error: Invalid API key for OpenAI
```

**Solution**:
1. Check that your `.env` file exists and has the correct keys
2. Verify your API keys are valid and have sufficient credits
3. Restart the backend server after changing `.env`

### Issue: Module Not Found

```
Error: Cannot find module '@prisma/client'
```

**Solution**:
```bash
cd apps/api
pnpm install
pnpm prisma generate
```

### Issue: Port Already in Use

```
Error: Port 3000 is already in use
```

**Solution**:
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3002 pnpm dev
```

---

## Project Structure Overview

```
videgen/
├── apps/
│   ├── web/              # Next.js frontend (port 3000)
│   │   ├── app/          # App Router pages
│   │   ├── components/   # React components
│   │   └── lib/          # Utilities
│   │
│   └── api/              # Hono.js backend (port 3001)
│       ├── src/
│       │   ├── routes/   # API endpoints
│       │   ├── services/ # Business logic
│       │   └── db/       # Database client
│       └── prisma/       # Database schema
│
├── packages/
│   └── shared/           # Shared types
│
├── PLANNING.md           # Detailed project plan
├── ARCHITECTURE.md       # System architecture
└── ROADMAP.md           # Development roadmap
```

---

## Development Workflow

### 1. Making Changes to Frontend

```bash
cd apps/web

# Add a new component
mkdir -p components/features/my-feature
touch components/features/my-feature/MyComponent.tsx

# Add shadcn component
pnpm dlx shadcn@latest add button

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### 2. Making Changes to Backend

```bash
cd apps/api

# Add a new route
touch src/routes/my-route.ts

# Update database schema
# Edit prisma/schema.prisma, then:
pnpm prisma migrate dev --name add_my_table
pnpm prisma generate

# Run type checking
pnpm type-check
```

### 3. Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e
```

### 4. Database Management

```bash
cd apps/api

# Open Prisma Studio (GUI for database)
pnpm prisma studio

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Generate migration without applying
pnpm prisma migrate dev --create-only

# Apply migrations in production
pnpm prisma migrate deploy
```

---

## API Endpoints Quick Reference

### Authentication
```
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login
POST   /api/auth/refresh     # Refresh token
POST   /api/auth/logout      # Logout
```

### Videos
```
GET    /api/videos           # List all videos
POST   /api/videos           # Create new video
GET    /api/videos/:id       # Get video details
PATCH  /api/videos/:id       # Update video
DELETE /api/videos/:id       # Delete video
```

### Script Generation
```
POST   /api/scripts/generate # Generate script from topic
```

### Text-to-Speech
```
POST   /api/tts/generate     # Generate audio
GET    /api/tts/status/:id   # Check status
```

### Video Generation
```
POST   /api/veo3/generate    # Generate video
GET    /api/veo3/status/:id  # Check status
```

---

## Useful Commands

```bash
# Install new dependency
pnpm add <package>                    # Add to root
pnpm add <package> --filter web       # Add to frontend
pnpm add <package> --filter api       # Add to backend

# Build for production
pnpm build

# Start production server
pnpm start

# Clean all node_modules and build artifacts
pnpm clean

# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm type-check

# View build size analysis
cd apps/web && pnpm analyze
```

---

## Getting Help

- **Documentation**: See `/docs` folder
- **Issues**: Check existing issues or create a new one
- **Discussions**: Join our GitHub Discussions
- **API Docs**: http://localhost:3001/docs (when server is running)

---

## Next Steps

1. ✅ Read the [PLANNING.md](./PLANNING.md) for detailed feature specs
2. ✅ Check the [ARCHITECTURE.md](./ARCHITECTURE.md) to understand system design
3. ✅ Review the [ROADMAP.md](./ROADMAP.md) to see what's coming next
4. ✅ Start building! Pick a task from Phase 1 and get coding

---

**Happy coding! 🚀**

If you encounter any issues, please check the troubleshooting section or open an issue on GitHub.
