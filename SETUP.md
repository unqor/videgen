# Videgen Setup Guide

## Prerequisites

- **Bun** (recommended) or **Node.js 20+**
- API Keys for:
  - Google Gemini (Script Generation, Image Generation & Image Concept Extraction)
  - Google Cloud (Text-to-Speech)
  - Google Veo 3 (Video Generation)

## Installation Steps

### 1. Install Bun (if not already installed)

```bash
curl -fsSL https://bun.sh/install | bash
```

Or use Node.js/npm if you prefer.

### 2. Install Dependencies

```bash
cd videgen
bun install
```

Or with npm:
```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# AI Service API Keys
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key-here
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key-here
GOOGLE_VEO3_API_KEY=your-google-veo3-api-key-here

# Optional: Temporary file storage path
TEMP_DIR=./src/temp
```

### 4. Get API Keys

#### Google Gemini API Key
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy the key

**Note**: Gemini is used for script generation, image generation (gemini-2.5-flash-image), and analyzing scripts to extract visual concepts.

#### Google Cloud Text-to-Speech
1. Go to https://console.cloud.google.com/
2. Enable Text-to-Speech API
3. Create credentials (API Key)
4. Copy the API key

#### Google Veo 3 API Key
1. Go to Google Cloud Console
2. Enable Veo 3 API (when available)
3. Create credentials
4. Copy the API key

**Note**: Google Veo 3 might not be publicly available yet. The current implementation uses a mock video generator. Check `src/services/video.ts` for integration instructions.

### 5. Run the Development Server

```bash
bun run dev
```

Or with npm:
```bash
npm run dev
```

The server will start at http://localhost:3000

### 6. Test the Application

1. Open http://localhost:3000 in your browser
2. Enter a topic (e.g., "How does photosynthesis work?")
3. Click "Generate Script"
4. Review and edit the generated script
5. Select a voice
6. Click "Generate Video"
7. Wait for the video to be created
8. Download your video!

## Project Structure

```
videgen/
├── src/
│   ├── index.ts              # Main Hono.js server
│   ├── services/
│   │   ├── script.ts         # Gemini script generation
│   │   ├── tts.ts            # Google Cloud TTS
│   │   ├── images.ts         # Gemini image generation and concept extraction
│   │   └── video.ts          # Google Veo 3 (mock)
│   ├── public/
│   │   ├── index.html        # Frontend UI
│   │   └── app.js            # Client-side JavaScript
│   └── temp/                 # Temporary files (audio, video)
├── .env                      # Your API keys (not in git)
├── .env.example              # Template for .env
├── package.json
└── tsconfig.json
```

## Building for Production

```bash
bun run build
```

This creates a compiled version in the `dist/` directory.

To run the production build:

```bash
bun start
```

## Deployment

### Deploy to Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables in Railway dashboard

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Add environment variables in Vercel dashboard

## Troubleshooting

### "Module not found" error

Make sure all dependencies are installed:
```bash
bun install
# or
npm install
```

### API Key errors

1. Check that your `.env` file exists
2. Verify all API keys are correct
3. Make sure there are no extra spaces or quotes
4. Restart the server after changing `.env`

### Port already in use

Change the port in `.env`:
```env
PORT=3001
```

### Google Veo 3 not working

The current implementation uses a mock video generator. To integrate the real Google Veo 3 API:

1. Check if you have access to the Veo 3 API
2. Update `src/services/video.ts` with the actual API calls
3. See comments in the file for integration instructions

## Development

### Hot Reload

The dev server supports hot reload. Any changes to TypeScript files will automatically restart the server.

### API Endpoints

- `POST /api/generate-script` - Generate script from topic
- `POST /api/generate-audio` - Generate TTS audio
- `POST /api/recommend-images` - Get image recommendations
- `POST /api/generate-video` - Generate final video
- `GET /health` - Health check

### Testing API Endpoints

```bash
# Test script generation
curl -X POST http://localhost:3000/api/generate-script \
  -H "Content-Type: application/json" \
  -d '{"topic": "How does rain form?"}'

# Test health endpoint
curl http://localhost:3000/health
```

## Cost Estimation

Per video (approximate):
- Google Gemini Flash: ~$0.002 (script generation + image concept extraction)
- Google Gemini Image: ~$0.08-0.16 (4-8 images at $0.02 per image)
- Google Cloud TTS: $0.02
- Google Veo 3: $0.10-0.50

**Total per video**: ~$0.20-0.68 (still very affordable!)

## Next Steps

1. ✅ Set up your environment
2. ✅ Get all API keys
3. ✅ Test the application
4. 🔄 Integrate real Google Veo 3 API (when available)
5. 🎨 Customize the UI
6. 🚀 Deploy to production

## Support

- Check [PLANNING.md](./PLANNING.md) for detailed documentation
- Open an issue on GitHub for bugs
- See [README.md](./README.md) for project overview

---

Happy video generating! 🎬
