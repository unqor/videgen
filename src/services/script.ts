import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

export type Language = "english" | "indonesian";
export type GeminiModel = "gemini-2.5-flash" | "gemini-2.5-pro";

interface ScriptGenerationOptions {
	topic: string;
	language?: Language;
	model?: GeminiModel;
}

/**
 * Generate an educational script from a topic using Google Gemini
 */
export async function generateScript(
	topicOrOptions: string | ScriptGenerationOptions,
): Promise<string> {
	// Handle both old string format and new options format for backwards compatibility
	const options: ScriptGenerationOptions =
		typeof topicOrOptions === "string"
			? {
					topic: topicOrOptions,
					language: "english",
					model: "gemini-2.5-flash",
				}
			: topicOrOptions;

	const { topic, language = "english", model = "gemini-2.5-flash" } = options;

	const prompts = {
		english: `You are an expert educational content creator. Create a clear, engaging, and informative script for a faceless explainer video about the following topic:

"${topic}"

Requirements:
- Keep it concise (30-60 seconds when read aloud)
- Use simple, clear language
- Include an engaging hook at the start
- Explain the topic step-by-step
- End with a brief conclusion
- Write in a conversational, friendly tone
- No need for "Hello" or "Welcome" - jump straight into the content
- Write in ENGLISH

Write ONLY the script narration, no additional formatting or stage directions.`,

		indonesian: `Anda adalah pembuat konten edukatif yang ahli. Buatlah skrip yang jelas, menarik, dan informatif untuk video penjelasan tanpa wajah tentang topik berikut:

"${topic}"

Persyaratan:
- Buat singkat (30-60 detik saat dibacakan)
- Gunakan bahasa yang sederhana dan jelas
- Sertakan pembuka yang menarik di awal
- Jelaskan topik langkah demi langkah
- Akhiri dengan kesimpulan singkat
- Tulis dengan nada percakapan yang ramah
- Tidak perlu "Halo" atau "Selamat datang" - langsung ke konten
- Tulis dalam BAHASA INDONESIA

Tulis HANYA narasi skrip, tanpa format atau petunjuk panggung tambahan.`,
	};

	const prompt = prompts[language];

	try {
		console.log(
			`Generating script with model: ${model}, language: ${language}`,
		);

		// Use the selected Gemini model
		const result = await genAI.models.generateContent({
			model,
			contents: [{ role: "user", parts: [{ text: prompt }] }],
		});

		const script = result.text?.trim();

		if (!script) {
			throw new Error("No script generated from Gemini");
		}

		return script;
	} catch (error) {
		console.error("Gemini API error:", error);
		throw new Error(
			`Failed to generate script with Google Gemini (${model})`,
		);
	}
}
