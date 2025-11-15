import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { generateScript } from './services/script';
import { generateAudio } from './services/tts';
import { recommendImages } from './services/images';
import { generateVideo } from './services/video';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Serve static files from public directory
app.use('/*', serveStatic({ root: './src/public' }));

// Serve temporary files (audio, video)
app.use('/temp/*', serveStatic({ root: './src' }));

// API Routes

// Generate script from topic
app.post('/api/generate-script', async (c) => {
  try {
    const { topic, language = 'english', model = 'gemini-2.0-flash-exp' } = await c.req.json();

    if (!topic || topic.trim().length === 0) {
      return c.json({ error: 'Topic is required' }, 400);
    }

    const script = await generateScript({ topic: topic.trim(), language, model });
    return c.json({ script });
  } catch (error) {
    console.error('Error generating script:', error);
    return c.json({ error: 'Failed to generate script' }, 500);
  }
});

// Generate audio from script
app.post('/api/generate-audio', async (c) => {
  try {
    const { script, voice } = await c.req.json();

    if (!script || script.trim().length === 0) {
      return c.json({ error: 'Script is required' }, 400);
    }

    const audioUrl = await generateAudio(script, voice || 'en-US-Neural2-J');
    return c.json({ audioUrl, duration: 60 }); // TODO: Calculate actual duration
  } catch (error) {
    console.error('Error generating audio:', error);
    return c.json({ error: 'Failed to generate audio' }, 500);
  }
});

// Get image recommendations
app.post('/api/recommend-images', async (c) => {
  try {
    const { script, duration } = await c.req.json();

    if (!script || script.trim().length === 0) {
      return c.json({ error: 'Script is required' }, 400);
    }

    const images = await recommendImages(script, duration || 60);
    return c.json({ images });
  } catch (error) {
    console.error('Error recommending images:', error);
    return c.json({ error: 'Failed to recommend images' }, 500);
  }
});

// Generate final video
app.post('/api/generate-video', async (c) => {
  try {
    const { audioUrl, images } = await c.req.json();

    if (!audioUrl) {
      return c.json({ error: 'Audio URL is required' }, 400);
    }
    if (!images || images.length === 0) {
      return c.json({ error: 'Images are required' }, 400);
    }

    const videoUrl = await generateVideo(audioUrl, images);
    return c.json({ videoUrl });
  } catch (error) {
    console.error('Error generating video:', error);
    return c.json({ error: 'Failed to generate video' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
const port = parseInt(process.env.PORT || '3000');
console.log(`🎬 Videgen server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};
