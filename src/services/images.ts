import { GoogleGenAI } from "@google/genai";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import mime from "mime";

const genAI = new GoogleGenAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

const TEMP_DIR = join(process.cwd(), "src", "temp");

// Ensure directory exists
async function ensureDir(dir: string) {
	if (!existsSync(dir)) {
		await mkdir(dir, { recursive: true });
	}
}

interface ImageRecommendation {
	imageUrl: string;
	imagePrompt: string;
	timestamp: number;
	duration: number;
	order: number;
}

/**
 * Generate images for the video based on script content using Gemini
 */
export async function recommendImages(
	script: string,
	duration: number,
	projectId: string,
): Promise<ImageRecommendation[]> {
	try {
		// Create project directory
		const projectDir = join(TEMP_DIR, projectId);
		await ensureDir(projectDir);

		// Step 1: Use Gemini to extract key visual concepts from the script
		const conceptsPrompt = `Analyze this video script and extract 4-8 key visual concepts that would make good background images for each section.

Script: "${script}"

You are an expert at analyzing scripts and identifying visual concepts. Return ONLY a JSON array of image descriptions (4-8 items), like:
["a lush green rice field with young seedlings in rows", "a farmer carefully planting rice in a flooded paddy field", "mature golden rice plants ready for harvest", "farmers harvesting rice with traditional tools"]

Return only the JSON array, no additional text or explanation.`;

		const conceptsResponse = await genAI.models.generateContent({
			model: "gemini-2.5-flash",
			contents: conceptsPrompt,
			config: {
				responseMimeType: "application/json",
				responseJsonSchema: {
					type: "array",
				},
			},
		});

		const conceptsText = conceptsResponse.text?.trim();
		if (!conceptsText) {
			throw new Error("No concepts generated");
		}

		// Parse the JSON array of image descriptions
		let imagePrompts: string[];
		try {
			imagePrompts = JSON.parse(conceptsText);
		} catch {
			// If parsing fails, create default prompts
			imagePrompts = [
				"educational classroom with students learning",
				"books and learning materials on a desk",
				"teacher explaining concepts on a whiteboard",
				"students studying together in a library",
			];

			console.log(
				`Failed to parse image prompts from response: ${conceptsText}`,
			);
		}

		// Ensure we have 4-8 images
		if (imagePrompts.length < 4) {
			imagePrompts = [
				...imagePrompts,
				"educational scene with books",
				"learning environment",
				"students in classroom",
			];
		}
		if (imagePrompts.length > 8) {
			imagePrompts = imagePrompts.slice(0, 8);
		}

		console.log(imagePrompts);

		// Step 2: Generate images using Gemini
		const images: ImageRecommendation[] = [];
		const segmentDuration = duration / imagePrompts.length;

		for (let i = 0; i < imagePrompts.length; i++) {
			const prompt = imagePrompts[i];

			try {
				console.log(`Generating image ${i + 1}: ${prompt}`);

				// Configure image generation
				const config = {
					responseModalities: ["IMAGE", "TEXT"],
					imageConfig: {
						imageSize: "1K",
					},
				};

				const model = "gemini-2.5-flash-image";
				const contents = [
					{
						role: "user",
						parts: [
							{
								text: `Generate a high-quality, professional image: ${prompt}. Make it suitable for an educational video background.`,
							},
						],
					},
				];

				const response = await genAI.models.generateContentStream({
					model,
					config,
					contents,
				});

				let imageSaved = false;

				for await (const chunk of response) {
					if (
						!chunk.candidates ||
						!chunk.candidates[0].content ||
						!chunk.candidates[0].content.parts
					) {
						continue;
					}

					if (
						chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData
					) {
						const inlineData =
							chunk.candidates[0].content.parts[0].inlineData;
						const fileExtension =
							mime.getExtension(inlineData.mimeType || "") ||
							"png";
						const buffer = Buffer.from(
							inlineData.data || "",
							"base64",
						);

						// Save image file
						const filename = `image-${i + 1}.${fileExtension}`;
						const filepath = join(projectDir, filename);
						await writeFile(filepath, buffer);

						// Add to results
						const localUrl = `/temp/${projectId}/${filename}`;
						images.push({
							imageUrl: localUrl,
							imagePrompt: prompt,
							timestamp: i * segmentDuration,
							duration: segmentDuration,
							order: i + 1,
						});

						imageSaved = true;
						console.log(`Image ${i + 1} saved: ${localUrl}`);
					} else if (chunk.text) {
						console.log(`Gemini response: ${chunk.text}`);
					}
				}

				if (!imageSaved) {
					throw new Error("No image data received from Gemini");
				}
			} catch (error) {
				console.error(`Error generating image for "${prompt}":`, error);

				// Create a placeholder on error
				const filename = `image-${i + 1}-placeholder.txt`;
				const filepath = join(projectDir, filename);
				await writeFile(filepath, `Failed to generate: ${prompt}`);

				images.push({
					imageUrl: `https://via.placeholder.com/1920x1080/4F46E5/FFFFFF?text=${encodeURIComponent(prompt.substring(0, 30))}`,
					imagePrompt: prompt,
					timestamp: i * segmentDuration,
					duration: segmentDuration,
					order: i + 1,
				});
			}

			// Rate limiting: Wait 1 second between requests to avoid API limits
			if (i < imagePrompts.length - 1) {
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}
		}

		return images;
	} catch (error) {
		console.error("Image generation error:", error);
		throw new Error("Failed to generate images");
	}
}
