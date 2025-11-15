import { writeFile } from 'fs/promises';
import { join } from 'path';

/**
 * Generate audio from script using Google Cloud Text-to-Speech
 * For now, this is a mock implementation. You'll need to integrate the actual Google Cloud TTS API.
 */
export async function generateAudio(script: string, voice: string): Promise<string> {
  const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_CLOUD_API_KEY not configured');
  }

  try {
    // Call Google Cloud Text-to-Speech API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: script },
          voice: {
            languageCode: 'en-US',
            name: voice,
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Google TTS API error:', error);
      throw new Error('Failed to generate audio');
    }

    const data = await response.json();
    const audioContent = data.audioContent;

    if (!audioContent) {
      throw new Error('No audio content received from Google TTS');
    }

    // Save audio file to temp directory
    const tempDir = process.env.TEMP_DIR || './src/temp';
    const filename = `audio-${Date.now()}.mp3`;
    const filepath = join(tempDir, filename);

    // Decode base64 and write to file
    const audioBuffer = Buffer.from(audioContent, 'base64');
    await writeFile(filepath, audioBuffer);

    // Return URL path
    return `/temp/${filename}`;
  } catch (error) {
    console.error('TTS generation error:', error);
    throw new Error('Failed to generate audio with Google Cloud TTS');
  }
}
