import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

/**
 * Generate an educational script from a topic using Google Gemini Flash
 */
export async function generateScript(topic: string): Promise<string> {
  const prompt = `You are an expert educational content creator. Create a clear, engaging, and informative script for a faceless explainer video about the following topic:

"${topic}"

Requirements:
- Keep it concise (30-60 seconds when read aloud)
- Use simple, clear language
- Include an engaging hook at the start
- Explain the topic step-by-step
- End with a brief conclusion
- Write in a conversational, friendly tone
- No need for "Hello" or "Welcome" - jump straight into the content

Write ONLY the script narration, no additional formatting or stage directions.`;

  try {
    // Use Gemini Flash model for fast, efficient generation
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const script = response.text().trim();

    if (!script) {
      throw new Error('No script generated from Gemini');
    }

    return script;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate script with Google Gemini');
  }
}
