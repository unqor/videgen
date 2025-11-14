# Videgen - Faceless Education Explainer Video Generator

## Project Overview

**Videgen** is a web application for generating faceless education/explainer videos using AI. It leverages Google Veo 3 API for video generation, AI-powered text-to-speech, and automated content creation.

### Example Use Case
- Input: "How long does it take to plant rice until ready for harvest?"
- Output: Professional explainer video with AI narration and relevant visuals

---

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: React Context API / Zustand
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: Hono.js
- **Runtime**: Node.js / Bun
- **Language**: TypeScript
- **API Style**: RESTful

### AI/ML Services
- **Video Generation**: Google Veo 3 API
- **Text-to-Speech**: Google Cloud Text-to-Speech / ElevenLabs
- **Script Generation**: OpenAI GPT-4 / Anthropic Claude
- **Image Recommendations**: OpenAI DALL-E / Stability AI / Unsplash API

### Database & Storage
- **Database**: PostgreSQL (with Drizzle ORM)
- **File Storage**: Cloud Storage (Google Cloud Storage / AWS S3)
- **Cache**: Redis (optional, for job queuing)

### Infrastructure
- **Deployment**: Vercel (Frontend) + Railway/Render (Backend)
- **Queue System**: BullMQ (for batch processing)
- **Monitoring**: Sentry (error tracking)

---

## Project Structure

```
videgen/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── projects/
│   │   │   ├── videos/
│   │   │   ├── settings/
│   │   │   ├── api/            # API routes (if needed)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/            # shadcn components
│   │   │   ├── features/
│   │   │   │   ├── script-editor/
│   │   │   │   ├── video-preview/
│   │   │   │   ├── image-selector/
│   │   │   │   └── batch-generator/
│   │   │   └── layouts/
│   │   ├── lib/
│   │   │   ├── api-client.ts
│   │   │   ├── utils.ts
│   │   │   └── validations.ts
│   │   ├── hooks/
│   │   ├── styles/
│   │   └── public/
│   │
│   └── api/                    # Hono.js backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── videos.ts
│       │   │   ├── scripts.ts
│       │   │   ├── tts.ts
│       │   │   ├── images.ts
│       │   │   └── batch.ts
│       │   ├── services/
│       │   │   ├── veo3.service.ts
│       │   │   ├── tts.service.ts
│       │   │   ├── script-generator.service.ts
│       │   │   ├── image-recommender.service.ts
│       │   │   └── video-assembler.service.ts
│       │   ├── middleware/
│       │   │   ├── error-handler.ts
│       │   │   ├── cors.ts
│       │   │   └── logger.ts
│       │   ├── db/
│       │   │   ├── index.ts
│       │   │   └── schema.ts
│       │   ├── types/
│       │   ├── utils/
│       │   └── index.ts
│       └── package.json
│
├── packages/
│   └── shared/                 # Shared types and utilities
│       ├── types/
│       └── constants/
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── USER_GUIDE.md
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── package.json                # Root package.json (monorepo)
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## Database Schema

> Using **Drizzle ORM** for type-safe database access. No authentication required - personal use only.

### Projects
```typescript
import { pgTable, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const projects = pgTable('projects', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Videos
```typescript
import { pgTable, text, timestamp, varchar, integer, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { projects } from './projects';

export const videoStatusEnum = pgEnum('video_status', [
  'draft',
  'script_generated',
  'audio_generating',
  'audio_ready',
  'images_selected',
  'video_generating',
  'completed',
  'failed',
]);

export const videos = pgTable('videos', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  projectId: varchar('project_id', { length: 128 }).references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  topic: text('topic').notNull(),
  script: text('script'),
  status: videoStatusEnum('status').default('draft').notNull(),
  audioUrl: text('audio_url'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'), // in seconds
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Script Sections
```typescript
import { pgTable, text, timestamp, varchar, integer, real } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { videos } from './videos';

export const scriptSections = pgTable('script_sections', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  videoId: varchar('video_id', { length: 128 }).references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  order: integer('order').notNull(),
  content: text('content').notNull(),
  startTime: real('start_time'), // in seconds
  endTime: real('end_time'), // in seconds
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Image Timestamps
```typescript
import { pgTable, text, timestamp, varchar, integer, real } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';
import { videos } from './videos';

export const imageTimestamps = pgTable('image_timestamps', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  videoId: varchar('video_id', { length: 128 }).references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  imagePrompt: text('image_prompt'),
  timestamp: real('timestamp').notNull(), // in seconds
  duration: real('duration').notNull(), // how long to show image
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Complete Schema File Example
```typescript
// apps/api/src/db/schema.ts
import { pgTable, text, timestamp, varchar, integer, real, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Enums
export const videoStatusEnum = pgEnum('video_status', [
  'draft',
  'script_generated',
  'audio_generating',
  'audio_ready',
  'images_selected',
  'video_generating',
  'completed',
  'failed',
]);

// Projects table
export const projects = pgTable('projects', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Videos table
export const videos = pgTable('videos', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  projectId: varchar('project_id', { length: 128 }).references(() => projects.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  topic: text('topic').notNull(),
  script: text('script'),
  status: videoStatusEnum('status').default('draft').notNull(),
  audioUrl: text('audio_url'),
  videoUrl: text('video_url'),
  thumbnailUrl: text('thumbnail_url'),
  duration: integer('duration'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Script sections table
export const scriptSections = pgTable('script_sections', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  videoId: varchar('video_id', { length: 128 }).references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  order: integer('order').notNull(),
  content: text('content').notNull(),
  startTime: real('start_time'),
  endTime: real('end_time'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Image timestamps table
export const imageTimestamps = pgTable('image_timestamps', {
  id: varchar('id', { length: 128 }).primaryKey().$defaultFn(() => createId()),
  videoId: varchar('video_id', { length: 128 }).references(() => videos.id, { onDelete: 'cascade' }).notNull(),
  imageUrl: text('image_url').notNull(),
  imagePrompt: text('image_prompt'),
  timestamp: real('timestamp').notNull(),
  duration: real('duration').notNull(),
  order: integer('order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Type exports for TypeScript
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export type Video = typeof videos.$inferSelect;
export type NewVideo = typeof videos.$inferInsert;

export type ScriptSection = typeof scriptSections.$inferSelect;
export type NewScriptSection = typeof scriptSections.$inferInsert;

export type ImageTimestamp = typeof imageTimestamps.$inferSelect;
export type NewImageTimestamp = typeof imageTimestamps.$inferInsert;
```

---

## API Endpoints

### Video Management
```
POST   /api/videos                    # Create new video project
GET    /api/videos                    # List all videos
GET    /api/videos/:id                # Get video details
PATCH  /api/videos/:id                # Update video
DELETE /api/videos/:id                # Delete video
```

### Script Generation
```
POST   /api/scripts/generate          # Generate script from topic
PATCH  /api/scripts/:videoId          # Update script content
GET    /api/scripts/:videoId          # Get script
```

### Text-to-Speech
```
POST   /api/tts/generate              # Generate TTS audio
GET    /api/tts/status/:jobId         # Check TTS generation status
POST   /api/tts/preview               # Preview TTS with sample
```

### Image Recommendations
```
POST   /api/images/recommend          # Get image recommendations
POST   /api/images/timestamps         # Set image timestamps
GET    /api/images/:videoId           # Get images for video
```

### Video Generation
```
POST   /api/veo3/generate             # Generate video with Veo 3
GET    /api/veo3/status/:jobId        # Check video generation status
GET    /api/veo3/download/:videoId    # Download generated video
```

### Batch Processing
```
POST   /api/batch/create              # Create batch job
GET    /api/batch/:batchId            # Get batch status
GET    /api/batch/:batchId/videos     # Get videos in batch
```

---

## User Flow Implementation

### Step 1: Video Topic Input
**Frontend Component**: `VideoCreationForm`
- Input field for video title/topic
- Validation (min/max length)
- Submit button

**API Call**: `POST /api/videos`
**Request**:
```json
{
  "projectId": "proj_123",
  "title": "How to Plant Rice",
  "topic": "How long does it take to plant rice until ready for harvest?"
}
```

**Response**:
```json
{
  "videoId": "vid_456",
  "status": "DRAFT",
  "title": "How to Plant Rice"
}
```

---

### Step 2: Script Generation
**Frontend Component**: `ScriptEditor`
- Loading state while generating
- Rich text editor (TipTap or similar)
- Character/word count
- Save button

**API Call**: `POST /api/scripts/generate`
**Request**:
```json
{
  "videoId": "vid_456",
  "topic": "How long does it take to plant rice until ready for harvest?",
  "style": "educational",
  "length": "medium" // short, medium, long
}
```

**Response**:
```json
{
  "videoId": "vid_456",
  "script": "Rice cultivation is a fascinating agricultural process...",
  "sections": [
    {
      "order": 1,
      "content": "Rice cultivation is a fascinating agricultural process...",
      "estimatedDuration": 5.2
    }
  ],
  "totalDuration": 45.8
}
```

**Backend Logic**:
```typescript
// services/script-generator.service.ts
async generateScript(topic: string, style: string): Promise<string> {
  const prompt = `Generate an educational script about: ${topic}...`;
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });
  return response.choices[0].message.content;
}
```

---

### Step 3: Text-to-Speech Generation
**Frontend Component**: `AudioGenerator`
- Voice selection dropdown
- Preview audio button
- Generate button
- Progress indicator

**API Call**: `POST /api/tts/generate`
**Request**:
```json
{
  "videoId": "vid_456",
  "script": "Rice cultivation is a fascinating...",
  "voice": "en-US-Neural2-J",
  "speed": 1.0
}
```

**Response**:
```json
{
  "jobId": "tts_789",
  "status": "PROCESSING",
  "estimatedTime": 30
}
```

**Polling**: `GET /api/tts/status/:jobId`
**Response**:
```json
{
  "jobId": "tts_789",
  "status": "COMPLETED",
  "audioUrl": "https://storage.../audio.mp3",
  "duration": 45.8
}
```

**Backend Logic**:
```typescript
// services/tts.service.ts
async generateTTS(script: string, voice: string): Promise<string> {
  const client = new TextToSpeechClient();
  const request = {
    input: { text: script },
    voice: { languageCode: 'en-US', name: voice },
    audioConfig: { audioEncoding: 'MP3' }
  };
  const [response] = await client.synthesizeSpeech(request);
  const audioUrl = await uploadToStorage(response.audioContent);
  return audioUrl;
}
```

---

### Step 4: Image Recommendations
**Frontend Component**: `ImageTimestampEditor`
- Timeline view with audio waveform
- Image cards with thumbnails
- Drag & drop to position images
- Edit duration/timing
- Search/replace images

**API Call**: `POST /api/images/recommend`
**Request**:
```json
{
  "videoId": "vid_456",
  "script": "Rice cultivation is a fascinating...",
  "audioDuration": 45.8,
  "numberOfImages": 5
}
```

**Response**:
```json
{
  "recommendations": [
    {
      "timestamp": 0,
      "duration": 8.5,
      "prompt": "Rice field with young seedlings",
      "imageUrl": "https://unsplash.com/...",
      "order": 1
    },
    {
      "timestamp": 8.5,
      "duration": 10.2,
      "prompt": "Farmer planting rice in paddy field",
      "imageUrl": "https://unsplash.com/...",
      "order": 2
    }
  ]
}
```

**Backend Logic**:
```typescript
// services/image-recommender.service.ts
async recommendImages(script: string, duration: number): Promise<ImageRecommendation[]> {
  // 1. Analyze script sections
  const sections = await analyzeScriptSections(script);

  // 2. Generate image prompts for each section
  const prompts = await generateImagePrompts(sections);

  // 3. Calculate timestamps
  const timestamps = calculateTimestamps(sections, duration);

  // 4. Fetch images from Unsplash/DALL-E
  const images = await fetchImages(prompts);

  return images.map((img, idx) => ({
    timestamp: timestamps[idx],
    duration: timestamps[idx + 1] - timestamps[idx],
    prompt: prompts[idx],
    imageUrl: img.url,
    order: idx + 1
  }));
}
```

---

### Step 5: Video Generation
**Frontend Component**: `VideoGenerator`
- Final review panel
- Generate video button
- Progress indicator (%)
- Preview player

**API Call**: `POST /api/veo3/generate`
**Request**:
```json
{
  "videoId": "vid_456",
  "audioUrl": "https://storage.../audio.mp3",
  "images": [
    {
      "imageUrl": "https://unsplash.com/...",
      "timestamp": 0,
      "duration": 8.5,
      "transition": "fade"
    }
  ],
  "resolution": "1920x1080",
  "fps": 30
}
```

**Response**:
```json
{
  "jobId": "veo3_999",
  "status": "QUEUED",
  "estimatedTime": 300
}
```

**Polling**: `GET /api/veo3/status/:jobId`
**Response**:
```json
{
  "jobId": "veo3_999",
  "status": "COMPLETED",
  "videoUrl": "https://storage.../video.mp4",
  "thumbnailUrl": "https://storage.../thumb.jpg",
  "duration": 45.8,
  "fileSize": 52428800
}
```

**Backend Logic**:
```typescript
// services/veo3.service.ts
async generateVideo(params: Veo3Params): Promise<string> {
  // 1. Prepare video generation request
  const veoRequest = {
    audioUrl: params.audioUrl,
    scenes: params.images.map(img => ({
      imageUrl: img.imageUrl,
      startTime: img.timestamp,
      duration: img.duration,
      transition: img.transition
    })),
    resolution: params.resolution,
    fps: params.fps
  };

  // 2. Submit to Google Veo 3 API
  const jobId = await veo3Client.createVideo(veoRequest);

  // 3. Poll for completion (or use webhook)
  const result = await pollForCompletion(jobId);

  // 4. Download and store video
  const videoUrl = await downloadAndStore(result.videoUrl);

  return videoUrl;
}
```

---

## Feature Breakdown

### Phase 1: Core Functionality (MVP)
- [ ] Project setup (Next.js + Hono.js monorepo)
- [ ] Database schema & Drizzle ORM setup
- [ ] Video topic input
- [ ] Script generation (OpenAI integration)
- [ ] Script editor (basic text editing)
- [ ] TTS generation (Google Cloud TTS)
- [ ] Basic video generation (Veo 3 API)
- [ ] Video preview & download

### Phase 2: Image Integration
- [ ] Image recommendation system
- [ ] Timeline editor for image placement
- [ ] Unsplash API integration
- [ ] Image-to-video scene generation
- [ ] Transition effects (fade, slide, zoom)

### Phase 3: Batch Processing
- [ ] Batch video creation UI
- [ ] Job queue system (BullMQ)
- [ ] Progress tracking
- [ ] Batch export options

### Phase 4: Advanced Features
- [ ] Multiple voice options
- [ ] Background music selection
- [ ] Custom branding (logo, colors)
- [ ] Video templates
- [ ] AI-generated images (DALL-E)
- [ ] Analytics dashboard
- [ ] Collaboration features

### Phase 5: Optimization
- [ ] Caching layer (Redis)
- [ ] CDN integration
- [ ] Video compression
- [ ] Rate limiting
- [ ] Error handling & retries
- [ ] Monitoring & logging

---

## UI Component Structure

### shadcn/ui Components Used
```tsx
// Core UI components
- Button
- Input
- Textarea
- Select
- Card
- Dialog
- Tabs
- Progress
- Slider
- Badge
- Toast
- Dropdown Menu
- Popover
- Separator
- Avatar
- Skeleton (loading states)
```

### Custom Components

#### `VideoCreationForm`
```tsx
interface VideoCreationFormProps {
  onSubmit: (data: VideoFormData) => void;
  isLoading: boolean;
}
```

#### `ScriptEditor`
```tsx
interface ScriptEditorProps {
  initialScript: string;
  onChange: (script: string) => void;
  onSave: () => void;
  isSaving: boolean;
}
```

#### `AudioGenerator`
```tsx
interface AudioGeneratorProps {
  script: string;
  onGenerate: (voice: string) => void;
  status: 'idle' | 'generating' | 'completed';
  audioUrl?: string;
}
```

#### `ImageTimestampEditor`
```tsx
interface ImageTimestampEditorProps {
  images: ImageTimestamp[];
  audioDuration: number;
  onChange: (images: ImageTimestamp[]) => void;
}
```

#### `VideoPreview`
```tsx
interface VideoPreviewProps {
  videoUrl: string;
  thumbnailUrl: string;
  duration: number;
  onDownload: () => void;
}
```

---

## Development Workflow

### 1. Initial Setup
```bash
# Create monorepo structure
pnpm init
pnpm add -D turbo

# Create apps
cd apps
npx create-next-app@latest web --typescript --tailwind --app
npm create hono@latest api

# Install dependencies
cd web
pnpm add shadcn-ui @radix-ui/react-* zod react-hook-form
pnpm add lucide-react date-fns clsx tailwind-merge

cd ../api
pnpm add @hono/node-server drizzle-orm postgres
pnpm add @paralleldrive/cuid2
pnpm add -D drizzle-kit
```

### 2. Database Setup
```bash
cd apps/api

# Create database configuration
mkdir -p src/db

# Create drizzle.config.ts at root
cat > drizzle.config.ts << 'EOF'
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
EOF

# Generate migrations
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate
```

### 3. Environment Variables
```env
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000

# apps/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/videgen"
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_API_KEY=
OPENAI_API_KEY=
ELEVENLABS_API_KEY=
UNSPLASH_ACCESS_KEY=
STORAGE_BUCKET=
```

### 4. Run Development Servers
```bash
# Terminal 1: Frontend
cd apps/web
pnpm dev

# Terminal 2: Backend
cd apps/api
pnpm dev
```

---

## Deployment Strategy

### Frontend (Next.js)
- **Platform**: Vercel
- **Build Command**: `cd apps/web && pnpm build`
- **Environment**: Node.js 20.x
- **Features**: Edge functions, ISR, Image optimization

### Backend (Hono.js)
- **Platform**: Railway / Render / Fly.io
- **Build Command**: `cd apps/api && pnpm build`
- **Runtime**: Node.js 20.x / Bun
- **Features**: Auto-scaling, health checks

### Database
- **Platform**: Neon / Railway / Supabase
- **Type**: PostgreSQL 15+
- **Backups**: Daily automated

### Storage
- **Platform**: Google Cloud Storage / AWS S3
- **Access**: CDN (CloudFlare)
- **Lifecycle**: Auto-delete after 90 days (optional)

---

## Security Considerations

> **Note**: This is a personal-use application with no authentication system.

### API Security
- CORS configuration (restrict to localhost/your domain)
- Rate limiting to prevent abuse
- Input validation (Zod schemas)
- Environment variable protection

### Data Privacy
- Secure file storage with signed URLs
- API keys stored in environment variables (never in database)
- Automatic cleanup of old videos/files (optional)

---

## Performance Optimization

### Frontend
- Code splitting (Next.js automatic)
- Image optimization (next/image)
- Lazy loading components
- Service worker for offline support

### Backend
- Connection pooling (PostgreSQL with Drizzle)
- Redis caching for frequent queries
- Background jobs for video processing
- Webhook callbacks instead of polling

### Video Processing
- Queue-based processing
- Retry logic with exponential backoff
- Progress updates via WebSocket
- Chunked uploads for large files

---

## Testing Strategy

### Frontend
- Unit tests: Vitest + Testing Library
- E2E tests: Playwright
- Visual regression: Chromatic

### Backend
- Unit tests: Vitest
- Integration tests: Supertest
- API contract tests: Pact

### CI/CD
- GitHub Actions
- Test on PR
- Auto-deploy on merge to main

---

## Monitoring & Analytics

### Error Tracking
- Sentry for error monitoring
- Custom error boundaries
- Structured logging

### Performance
- Vercel Analytics
- Core Web Vitals monitoring
- API response time tracking

### Business Metrics
- Video generation success rate
- Average processing time
- User engagement metrics

---

## Cost Estimation (Monthly)

### AI Services
- OpenAI GPT-4: ~$0.03 per script (1000 tokens)
- Google TTS: ~$4 per 1M characters
- Google Veo 3: TBD (custom pricing)
- Unsplash: Free tier (50 req/hour)

### Infrastructure
- Vercel: $20 (Pro plan)
- Railway: $5-20 (usage-based)
- Database: $10-25
- Storage: $0.023 per GB
- CDN: Included with Vercel

**Estimated monthly cost for 100 videos**: $50-100

---

## Timeline

### Week 1-2: Foundation
- Project setup (monorepo with Turbo)
- Database schema with Drizzle ORM
- Basic UI components with shadcn/ui

### Week 3-4: Core Features
- Script generation with OpenAI
- TTS integration with Google Cloud
- Video player component
- Basic video generation with Veo 3

### Week 5-6: Image Integration
- Image recommendations
- Timeline editor
- Veo 3 API integration

### Week 7-8: Polish & Testing
- Batch processing
- Error handling
- Testing
- Documentation

### Week 9-10: Deployment
- Production setup
- Performance optimization
- Monitoring
- Launch

---

## Next Steps

1. **Review this plan** and provide feedback
2. **Set up development environment** (install dependencies)
3. **Create database schema** (Drizzle ORM migrations)
4. **Build UI components** (shadcn/ui setup)
5. **Build first user flow** (topic input → script generation)
6. **Integrate AI services** (OpenAI, Google TTS, Veo 3)
7. **Test end-to-end workflow**
8. **Deploy MVP for personal use**

---

## Questions to Resolve

1. **Google Veo 3 API Access**: Do you have API credentials? Is there a waitlist?
2. **Voice Preferences**: Google Cloud TTS vs ElevenLabs? Multiple voices?
3. **Image Sources**: Unsplash only, or also DALL-E/Stable Diffusion?
4. **Batch Processing**: Max videos per batch? Queue priority?
5. **Video Quality**: Max resolution? File size limits?
6. **Deployment**: Self-hosted or cloud? Budget constraints?

---

This plan provides a comprehensive roadmap for building the Videgen app. Let me know which parts you'd like to start with!
