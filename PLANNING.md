# Videgen - Simple Faceless Video Generator

## Project Overview

**Videgen** is a single-page web application for generating faceless education/explainer videos using AI. Simple, fast, and no database required.

### Example Use Case
- Input: "How long does it take to plant rice until ready for harvest?"
- Output: Professional explainer video with AI narration and relevant visuals

---

## Technology Stack

### Frontend
- **HTML/CSS** - Simple, minimal UI
- **Vanilla JavaScript** - No framework overhead
- **Tailwind CSS** - Utility-first styling via CDN

### Backend
- **Hono.js** - Lightweight, fast web framework
- **Runtime**: Bun or Node.js
- **Language**: TypeScript

### AI/ML Services
- **Video Generation**: Google Veo 3 API
- **Text-to-Speech**: Google Cloud Text-to-Speech
- **Script Generation**: OpenAI GPT-4
- **Image Search**: Unsplash API

### Storage
- **Temporary Storage**: Local filesystem or temp directory
- **No Database** - Videos generated on-demand, not persisted

---

## Project Structure

```
videgen/
├── src/
│   ├── index.ts              # Main Hono app
│   ├── services/
│   │   ├── script.ts         # Script generation
│   │   ├── tts.ts            # Text-to-speech
│   │   ├── images.ts         # Image recommendations
│   │   └── video.ts          # Video generation (Veo 3)
│   ├── public/
│   │   ├── index.html        # Single page UI
│   │   ├── app.js            # Client-side JS
│   │   └── styles.css        # Optional custom styles
│   └── temp/                 # Temporary files (gitignored)
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

---

## Single Page UI

### Features
- Simple form for video topic input
- Real-time progress updates
- Inline script editor (textarea)
- Voice selection dropdown
- Video preview player
- Download button

### UI Flow
```
┌─────────────────────────────────────┐
│     Videgen - Video Generator        │
├─────────────────────────────────────┤
│                                     │
│  📝 Enter your topic:               │
│  ┌────────────────────────────────┐│
│  │ How long does rice take to...  ││
│  └────────────────────────────────┘│
│                                     │
│  [Generate Script]                  │
│                                     │
│  ✏️ Edit Script:                    │
│  ┌────────────────────────────────┐│
│  │ Rice cultivation is a...       ││
│  │                                ││
│  │ (editable)                     ││
│  └────────────────────────────────┘│
│                                     │
│  🎤 Voice: [English (Neural)]  ▼   │
│                                     │
│  [Generate Video]                   │
│                                     │
│  ⏳ Progress: Generating audio... │
│                                     │
│  🎬 Video Preview:                  │
│  ┌────────────────────────────────┐│
│  │      [▶️ Video Player]          ││
│  └────────────────────────────────┘│
│                                     │
│  [Download MP4]                     │
│                                     │
└─────────────────────────────────────┘
```

---

## API Endpoints

All served from single Hono.js app:

```
GET    /                      # Serve index.html
POST   /api/generate-script   # Generate script from topic
POST   /api/generate-audio    # Generate TTS audio
POST   /api/recommend-images  # Get image recommendations
POST   /api/generate-video    # Generate final video
GET    /api/status/:jobId     # Check generation status
GET    /api/download/:videoId # Download generated video
```

---

## Implementation Details

### Main App (src/index.ts)

```typescript
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import { generateScript } from './services/script';
import { generateAudio } from './services/tts';
import { recommendImages } from './services/images';
import { generateVideo } from './services/video';

const app = new Hono();

// Serve static files
app.use('/*', serveStatic({ root: './src/public' }));

// API endpoints
app.post('/api/generate-script', async (c) => {
  const { topic } = await c.req.json();
  const script = await generateScript(topic);
  return c.json({ script });
});

app.post('/api/generate-audio', async (c) => {
  const { script, voice } = await c.req.json();
  const audioUrl = await generateAudio(script, voice);
  return c.json({ audioUrl });
});

app.post('/api/recommend-images', async (c) => {
  const { script, duration } = await c.req.json();
  const images = await recommendImages(script, duration);
  return c.json({ images });
});

app.post('/api/generate-video', async (c) => {
  const { audioUrl, images } = await c.req.json();
  const videoUrl = await generateVideo(audioUrl, images);
  return c.json({ videoUrl });
});

export default app;
```

### Frontend (src/public/index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Videgen - Video Generator</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen py-8">
  <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
    <h1 class="text-3xl font-bold mb-8 text-center">🎬 Videgen</h1>

    <!-- Step 1: Topic Input -->
    <div class="mb-6">
      <label class="block text-sm font-medium mb-2">Enter your topic:</label>
      <input
        type="text"
        id="topic"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="How long does it take to plant rice until ready for harvest?"
      />
      <button
        onclick="generateScript()"
        class="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Generate Script
      </button>
    </div>

    <!-- Step 2: Script Editor -->
    <div id="script-section" class="hidden mb-6">
      <label class="block text-sm font-medium mb-2">Edit Script:</label>
      <textarea
        id="script"
        rows="10"
        class="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
      ></textarea>

      <div class="mt-3">
        <label class="block text-sm font-medium mb-2">Voice:</label>
        <select id="voice" class="px-4 py-2 border rounded-lg">
          <option value="en-US-Neural2-J">English (Male)</option>
          <option value="en-US-Neural2-F">English (Female)</option>
        </select>
      </div>

      <button
        onclick="generateVideo()"
        class="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Generate Video
      </button>
    </div>

    <!-- Step 3: Progress -->
    <div id="progress" class="hidden mb-6">
      <div class="text-center py-4">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        <p id="status" class="mt-2 text-gray-600"></p>
      </div>
    </div>

    <!-- Step 4: Video Preview -->
    <div id="video-section" class="hidden">
      <h2 class="text-xl font-semibold mb-4">Your Video</h2>
      <video id="video-player" controls class="w-full rounded-lg mb-4"></video>
      <a
        id="download-btn"
        download="video.mp4"
        class="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        Download Video
      </a>
    </div>
  </div>

  <script src="/app.js"></script>
</body>
</html>
```

### Client JavaScript (src/public/app.js)

```javascript
async function generateScript() {
  const topic = document.getElementById('topic').value;
  if (!topic) return alert('Please enter a topic');

  showProgress('Generating script...');

  const res = await fetch('/api/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic })
  });

  const { script } = await res.json();
  document.getElementById('script').value = script;
  document.getElementById('script-section').classList.remove('hidden');
  hideProgress();
}

async function generateVideo() {
  const script = document.getElementById('script').value;
  const voice = document.getElementById('voice').value;

  showProgress('Generating audio...');

  // Step 1: Generate audio
  const audioRes = await fetch('/api/generate-audio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script, voice })
  });
  const { audioUrl } = await audioRes.json();

  showProgress('Finding images...');

  // Step 2: Get image recommendations
  const imagesRes = await fetch('/api/recommend-images', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ script, duration: 60 })
  });
  const { images } = await imagesRes.json();

  showProgress('Creating video...');

  // Step 3: Generate video
  const videoRes = await fetch('/api/generate-video', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioUrl, images })
  });
  const { videoUrl } = await videoRes.json();

  // Show video
  document.getElementById('video-player').src = videoUrl;
  document.getElementById('download-btn').href = videoUrl;
  document.getElementById('video-section').classList.remove('hidden');
  hideProgress();
}

function showProgress(message) {
  document.getElementById('status').textContent = message;
  document.getElementById('progress').classList.remove('hidden');
}

function hideProgress() {
  document.getElementById('progress').classList.add('hidden');
}
```

---

## Environment Variables

```env
# AI Service API Keys
OPENAI_API_KEY=sk-...
GOOGLE_CLOUD_API_KEY=...
GOOGLE_VEO3_API_KEY=...
UNSPLASH_ACCESS_KEY=...

# Server
PORT=3000
NODE_ENV=development

# Temp storage path (optional)
TEMP_DIR=./src/temp
```

---

## Installation & Setup

```bash
# 1. Install Bun (or use Node.js)
curl -fsSL https://bun.sh/install | bash

# 2. Clone and install
git clone https://github.com/yourusername/videgen.git
cd videgen
bun install

# 3. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 4. Run
bun run dev
```

Visit http://localhost:3000

---

## Package.json

```json
{
  "name": "videgen",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --hot src/index.ts",
    "build": "bun build src/index.ts --outdir dist --target bun",
    "start": "bun dist/index.js"
  },
  "dependencies": {
    "hono": "^4.0.0",
    "@hono/node-server": "^1.8.0",
    "openai": "^4.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
```

---

## Deployment

### Option 1: Vercel/Netlify (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Railway (Container)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

### Option 3: VPS (Self-hosted)
```bash
# SSH to server
ssh user@your-server.com

# Clone and setup
git clone https://github.com/yourusername/videgen.git
cd videgen
bun install
bun run build

# Run with PM2
pm2 start dist/index.js --name videgen
```

---

## Features

### Current
- ✅ Single page interface
- ✅ Script generation (OpenAI)
- ✅ Text-to-speech (Google Cloud TTS)
- ✅ Image recommendations (Unsplash)
- ✅ Video generation (Google Veo 3)
- ✅ Real-time progress updates
- ✅ Video preview and download

### Future (Optional)
- [ ] Multiple voice options
- [ ] Custom image upload
- [ ] Background music
- [ ] Video templates
- [ ] History (localStorage)

---

## Cost Estimation

### Per Video
- OpenAI GPT-4: ~$0.03 (script)
- Google Cloud TTS: ~$0.02 (audio)
- Google Veo 3: ~$0.10-0.50 (video)
- Unsplash: Free (50 requests/hour)

**Total: ~$0.15-0.55 per video**

### Monthly (100 videos)
- AI Services: $15-55
- Hosting (Railway/Vercel): $0-20
- **Total: ~$15-75/month**

---

## Development Workflow

```bash
# Start dev server with hot reload
bun run dev

# Test API endpoints
curl -X POST http://localhost:3000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{"topic": "How to plant rice"}'

# Build for production
bun run build

# Run production build
bun start
```

---

## File Size Limits

- Max script length: 5000 characters
- Max audio duration: 5 minutes
- Max video duration: 5 minutes
- Max video file size: 100MB

---

## Next Steps

1. ✅ Set up Hono.js app
2. ✅ Create single page UI
3. ✅ Implement script generation
4. ✅ Integrate Google Cloud TTS
5. ✅ Add Unsplash image search
6. ✅ Integrate Google Veo 3
7. ✅ Add download functionality
8. ✅ Deploy to production

---

This simplified version removes all complexity while maintaining the core functionality. No database, no complex setup - just one file to rule them all! 🚀
