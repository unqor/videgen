# Videgen Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                            │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    Next.js Frontend (Vercel)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  UI Layer    │  │  Components  │  │  State Mgmt  │         │
│  │  (shadcn/ui) │  │  (React)     │  │  (Context)   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ REST API
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                 Hono.js Backend (Railway/Render)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Routes     │  │   Services   │  │  Middleware  │         │
│  │  (API)       │  │  (Business)  │  │  (Auth/etc)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────┬──────────────┬──────────────┬──────────────┬─────────┘
          │              │              │              │
          │              │              │              │
┌─────────▼────┐ ┌───────▼──────┐ ┌───▼────────┐ ┌──▼──────────┐
│  PostgreSQL  │ │   AI APIs    │ │  Storage   │ │ Job Queue   │
│  (Database)  │ │  (External)  │ │  (GCS/S3)  │ │  (BullMQ)   │
│              │ │              │ │            │ │             │
│  - Users     │ │ - OpenAI     │ │ - Videos   │ │ - Async     │
│  - Projects  │ │ - Google TTS │ │ - Audio    │ │   Jobs      │
│  - Videos    │ │ - Veo 3      │ │ - Images   │ │ - Progress  │
│  - Scripts   │ │ - Unsplash   │ │            │ │   Tracking  │
└──────────────┘ └──────────────┘ └────────────┘ └─────────────┘
```

## Data Flow

### Video Creation Flow

```
1. User Input
   ↓
   Topic: "How long to grow rice?"
   ↓
2. Script Generation
   ↓
   API: POST /api/scripts/generate
   Service: ScriptGeneratorService
   AI: OpenAI GPT-4
   ↓
   Generated Script (editable)
   ↓
3. Text-to-Speech
   ↓
   API: POST /api/tts/generate
   Service: TTSService
   AI: Google Cloud TTS
   ↓
   Audio File (.mp3) + Duration
   ↓
4. Image Recommendations
   ↓
   API: POST /api/images/recommend
   Service: ImageRecommenderService
   AI: OpenAI (for prompts) + Unsplash (for images)
   ↓
   Image List + Timestamps
   ↓
5. Video Assembly
   ↓
   API: POST /api/veo3/generate
   Service: Veo3Service
   AI: Google Veo 3
   ↓
   Final Video (.mp4)
   ↓
6. Storage & Delivery
   ↓
   Cloud Storage (GCS/S3)
   ↓
   CDN (CloudFlare)
   ↓
   User Download
```

## Component Architecture

### Frontend Components

```
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx                 # Login page
│   └── register/
│       └── page.tsx                 # Registration page
│
├── (dashboard)/
│   ├── layout.tsx                   # Dashboard shell
│   ├── page.tsx                     # Dashboard home
│   ├── projects/
│   │   ├── page.tsx                 # Projects list
│   │   ├── [id]/
│   │   │   └── page.tsx             # Project detail
│   │   └── new/
│   │       └── page.tsx             # Create project
│   ├── videos/
│   │   ├── page.tsx                 # Videos list
│   │   ├── [id]/
│   │   │   ├── page.tsx             # Video detail
│   │   │   ├── edit/
│   │   │   │   └── page.tsx         # Edit video
│   │   │   └── preview/
│   │   │       └── page.tsx         # Preview video
│   │   └── new/
│   │       └── page.tsx             # Create video wizard
│   └── settings/
│       └── page.tsx                 # User settings
│
└── components/
    ├── ui/                          # shadcn/ui primitives
    │   ├── button.tsx
    │   ├── input.tsx
    │   ├── card.tsx
    │   └── ...
    │
    ├── features/
    │   ├── video-creation/
    │   │   ├── TopicInputForm.tsx
    │   │   ├── ScriptEditor.tsx
    │   │   ├── AudioGenerator.tsx
    │   │   ├── ImageTimeline.tsx
    │   │   └── VideoPreview.tsx
    │   │
    │   ├── project-management/
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProjectList.tsx
    │   │   └── CreateProjectDialog.tsx
    │   │
    │   └── batch-processing/
    │       ├── BatchCreator.tsx
    │       ├── BatchProgress.tsx
    │       └── BatchResults.tsx
    │
    └── layouts/
        ├── Header.tsx
        ├── Sidebar.tsx
        └── Footer.tsx
```

### Backend Services

```
src/
├── routes/
│   ├── videos.ts                    # Video CRUD operations
│   ├── scripts.ts                   # Script generation/editing
│   ├── tts.ts                       # Text-to-speech
│   ├── images.ts                    # Image recommendations
│   ├── veo3.ts                      # Video generation
│   ├── batch.ts                     # Batch processing
│   └── auth.ts                      # Authentication
│
├── services/
│   ├── script-generator.service.ts
│   │   ├── generateScript()
│   │   ├── analyzeScript()
│   │   └── improveScript()
│   │
│   ├── tts.service.ts
│   │   ├── generateAudio()
│   │   ├── previewVoice()
│   │   └── getAvailableVoices()
│   │
│   ├── image-recommender.service.ts
│   │   ├── recommendImages()
│   │   ├── generateImagePrompts()
│   │   ├── fetchImages()
│   │   └── calculateTimestamps()
│   │
│   ├── veo3.service.ts
│   │   ├── generateVideo()
│   │   ├── checkStatus()
│   │   ├── downloadVideo()
│   │   └── cancelGeneration()
│   │
│   ├── video-assembler.service.ts
│   │   ├── assembleVideo()
│   │   ├── addTransitions()
│   │   ├── syncAudio()
│   │   └── renderFinal()
│   │
│   └── storage.service.ts
│       ├── uploadFile()
│       ├── downloadFile()
│       ├── deleteFile()
│       └── generateSignedUrl()
│
├── middleware/
│   ├── auth.ts                      # JWT validation
│   ├── error-handler.ts             # Error handling
│   ├── rate-limit.ts                # Rate limiting
│   └── validate.ts                  # Request validation
│
├── db/
│   ├── client.ts                    # Prisma client
│   └── seed.ts                      # Database seeding
│
└── utils/
    ├── logger.ts                    # Logging utility
    ├── crypto.ts                    # Encryption helpers
    └── queue.ts                     # Job queue setup
```

## Database Schema

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │───┐
│ email       │   │
│ name        │   │
│ password    │   │
└─────────────┘   │
                  │
                  │ 1:N
                  │
         ┌────────▼────────┐
         │    Project      │
         ├─────────────────┤
         │ id              │───┐
         │ userId          │   │
         │ title           │   │
         │ description     │   │
         └─────────────────┘   │
                               │ 1:N
                               │
                      ┌────────▼────────┐
                      │     Video       │
                      ├─────────────────┤
                      │ id              │───┐
                      │ projectId       │   │
                      │ title           │   │
                      │ topic           │   │
                      │ script          │   │
                      │ status          │   │
                      │ audioUrl        │   │
                      │ videoUrl        │   │
                      │ duration        │   │
                      └─────────────────┘   │
                                            │
                ┌───────────────────────────┼───────────────────────┐
                │                           │                       │
                │ 1:N                       │ 1:N                   │
                │                           │                       │
   ┌────────────▼──────────┐   ┌───────────▼──────────┐           │
   │   ScriptSection       │   │  ImageTimestamp      │           │
   ├───────────────────────┤   ├──────────────────────┤           │
   │ id                    │   │ id                   │           │
   │ videoId               │   │ videoId              │           │
   │ order                 │   │ imageUrl             │           │
   │ content               │   │ imagePrompt          │           │
   │ startTime             │   │ timestamp            │           │
   │ endTime               │   │ duration             │           │
   └───────────────────────┘   │ order                │           │
                               └──────────────────────┘           │
                                                                  │
                                                                  │
┌─────────────┐                                                  │
│   ApiKey    │                                                  │
├─────────────┤                                                  │
│ id          │                                                  │
│ userId      │──────────────────────────────────────────────────┘
│ service     │
│ key         │
│ isActive    │
└─────────────┘
```

## API Request/Response Patterns

### Standard Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### Pagination Pattern

```typescript
// Request
GET /api/videos?page=2&limit=10&sort=createdAt&order=desc

// Response
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 45,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

### Long-Running Job Pattern

```typescript
// 1. Initiate Job
POST /api/tts/generate
Response: { "jobId": "job_123", "status": "QUEUED" }

// 2. Poll Status
GET /api/tts/status/job_123
Response: {
  "jobId": "job_123",
  "status": "PROCESSING",
  "progress": 45,
  "estimatedTime": 30
}

// 3. Get Result
GET /api/tts/status/job_123
Response: {
  "jobId": "job_123",
  "status": "COMPLETED",
  "result": {
    "audioUrl": "https://...",
    "duration": 45.8
  }
}
```

## Security Architecture

### Authentication Flow

```
1. User Registration
   ↓
   POST /api/auth/register
   ↓
   Password Hashing (bcrypt)
   ↓
   Store in Database
   ↓
   Send Welcome Email

2. User Login
   ↓
   POST /api/auth/login
   ↓
   Verify Password
   ↓
   Generate JWT (Access + Refresh)
   ↓
   Set httpOnly Cookies
   ↓
   Return User Data

3. Authenticated Request
   ↓
   Extract JWT from Cookie
   ↓
   Verify Signature
   ↓
   Check Expiration
   ↓
   Attach User to Request
   ↓
   Process Request

4. Token Refresh
   ↓
   POST /api/auth/refresh
   ↓
   Verify Refresh Token
   ↓
   Generate New Access Token
   ↓
   Update Cookie
```

### API Key Management

```typescript
// Encryption at Rest
const encryptApiKey = (key: string): string => {
  return crypto.encrypt(key, process.env.ENCRYPTION_KEY);
};

// Decryption for Use
const decryptApiKey = (encrypted: string): string => {
  return crypto.decrypt(encrypted, process.env.ENCRYPTION_KEY);
};

// Usage in Service
const apiKey = decryptApiKey(user.apiKeys.find(k => k.service === 'openai').key);
const response = await openai.chat.completions.create({
  headers: { 'Authorization': `Bearer ${apiKey}` }
});
```

## Scalability Considerations

### Horizontal Scaling

```
┌─────────────────────────────────────────────────┐
│            Load Balancer (Nginx/Vercel)          │
└───────────┬─────────────┬─────────────┬─────────┘
            │             │             │
   ┌────────▼──────┐ ┌────▼──────┐ ┌───▼───────┐
   │  API Server 1 │ │API Server 2│ │API Server3│
   └────────┬──────┘ └────┬──────┘ └───┬───────┘
            │             │             │
            └─────────────┼─────────────┘
                          │
                 ┌────────▼────────┐
                 │  Database Pool  │
                 │  (PostgreSQL)   │
                 └─────────────────┘
```

### Job Queue Architecture

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Producer   │───▶│  Redis Queue │───▶│   Consumer   │
│  (API Server)│    │   (BullMQ)   │    │   (Worker)   │
└──────────────┘    └──────────────┘    └──────────────┘
                           │                     │
                           │                     ▼
                           │            ┌──────────────┐
                           │            │  AI Services │
                           │            │  - OpenAI    │
                           │            │  - Google    │
                           ▼            │  - Veo 3     │
                    ┌──────────────┐    └──────────────┘
                    │   Progress   │
                    │  Tracking DB │
                    └──────────────┘
```

### Caching Strategy

```typescript
// Cache Layers
1. Browser Cache (Frontend)
   - Static assets (CDN)
   - API responses (SWR/React Query)

2. Edge Cache (Vercel/CloudFlare)
   - Public pages
   - Static API routes

3. Application Cache (Redis)
   - User sessions
   - Frequent queries
   - Rate limit counters

4. Database Cache (PostgreSQL)
   - Query result cache
   - Materialized views
```

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured Logging
logger.info('Video generation started', {
  userId: 'user_123',
  videoId: 'vid_456',
  duration: 45.8,
  timestamp: new Date().toISOString()
});

// Error Logging
logger.error('TTS generation failed', {
  error: error.message,
  stack: error.stack,
  videoId: 'vid_456',
  retryCount: 2
});
```

### Metrics Tracking

```typescript
// Business Metrics
- Videos created per day
- Average generation time
- Success/failure rate
- User retention

// Technical Metrics
- API response time
- Database query time
- Job queue length
- Error rate

// AI Service Metrics
- OpenAI token usage
- TTS character count
- Veo 3 API calls
- Cost per video
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    DNS (CloudFlare)                      │
└─────────────┬──────────────────────┬────────────────────┘
              │                      │
              │                      │
     ┌────────▼────────┐    ┌────────▼────────┐
     │  Vercel (CDN)   │    │  Railway/Render │
     │   (Frontend)    │    │    (Backend)    │
     │                 │    │                 │
     │  - Next.js      │    │  - Hono.js      │
     │  - SSR/ISR      │    │  - Workers      │
     │  - Edge Fns     │    │  - Cron Jobs    │
     └─────────────────┘    └────────┬────────┘
                                     │
                            ┌────────┼────────┐
                            │        │        │
                   ┌────────▼──┐ ┌───▼────┐ ┌▼────────┐
                   │    Neon   │ │ Redis  │ │   GCS   │
                   │(PostgreSQL)│ │(Cache) │ │(Storage)│
                   └───────────┘ └────────┘ └─────────┘
```

## Performance Targets

### Frontend
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

### Backend
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Video Generation: < 5 minutes (p95)
- Uptime: 99.9%

### AI Services
- Script Generation: < 10s
- TTS Generation: < 30s
- Image Recommendations: < 5s
- Video Assembly (Veo 3): < 3 minutes

---

This architecture is designed to be:
- **Scalable**: Horizontal scaling for API servers
- **Reliable**: Job queues, retries, error handling
- **Fast**: Caching, CDN, optimized queries
- **Maintainable**: Clean separation of concerns
- **Cost-effective**: Pay-as-you-go infrastructure
