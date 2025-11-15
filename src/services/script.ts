import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate an educational script from a topic using OpenAI
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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational script writer specializing in creating clear, engaging explainer video scripts.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const script = completion.choices[0]?.message?.content?.trim();

    if (!script) {
      throw new Error('No script generated from OpenAI');
    }

    return script;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate script with OpenAI');
  }
}
