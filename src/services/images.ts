import { GoogleGenAI } from "@google/genai";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

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

// Download image from URL
async function downloadImage(url: string, filepath: string): Promise<void> {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to download image: ${response.statusText}`);
	}
	const buffer = await response.arrayBuffer();
	await writeFile(filepath, Buffer.from(buffer));
}

interface ImageRecommendation {
	imageUrl: string;
	imagePrompt: string;
	timestamp: number;
	duration: number;
	order: number;
}

/**
 * Recommend images for the video based on script content
 */
export async function recommendImages(
	script: string,
	duration: number,
	projectId: string,
): Promise<ImageRecommendation[]> {
	const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

	if (!unsplashAccessKey) {
		throw new Error("UNSPLASH_ACCESS_KEY not configured");
	}

	try {
		// Create project directory
		const projectDir = join(TEMP_DIR, projectId);
		await ensureDir(projectDir);

		// Step 1: Use Gemini to extract key visual concepts from the script
		const conceptsPrompt = `Analyze this video script and extract 4-8 key visual concepts that would make good background images for each section.

Script: "${script}"

You are an expert at analyzing scripts and identifying visual concepts. Return ONLY a JSON array of image search queries (4-8 items), like:
["rice field with seedlings", "farmer planting rice", "mature rice plants", "rice harvest"]

Return only the JSON array, no additional text or explanation.`;

		const conceptsResponse = await genAI.models.generateContent({
			model: "gemini-2.0-flash-exp",
			contents: conceptsPrompt,
		});

		const conceptsText = conceptsResponse.text?.trim();
		if (!conceptsText) {
			throw new Error("No concepts generated");
		}

		// Parse the JSON array of search queries
		let searchQueries: string[];
		try {
			searchQueries = JSON.parse(conceptsText);
		} catch {
			// If parsing fails, create default queries
			searchQueries = ["education", "learning", "knowledge", "study"];
		}

		// Ensure we have 4-8 images
		if (searchQueries.length < 4) {
			searchQueries = [
				...searchQueries,
				"education",
				"learning",
				"knowledge",
			];
		}
		if (searchQueries.length > 8) {
			searchQueries = searchQueries.slice(0, 8);
		}

		// Step 2: Fetch and download images from Unsplash
		const images: ImageRecommendation[] = [];
		const segmentDuration = duration / searchQueries.length;

		for (let i = 0; i < searchQueries.length; i++) {
			const query = searchQueries[i];

			try {
				const response = await fetch(
					`https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`,
					{
						headers: {
							Authorization: `Client-ID ${unsplashAccessKey}`,
						},
					},
				);

				if (response.ok) {
					const data: { urls: { regular: string } } =
						await response.json();
					const imageUrl = data?.urls?.regular;

					// Download image and save locally
					const filename = `image-${i + 1}.jpg`;
					const filepath = join(projectDir, filename);
					await downloadImage(imageUrl, filepath);

					// Return local URL
					const localUrl = `/temp/${projectId}/${filename}`;
					images.push({
						imageUrl: localUrl,
						imagePrompt: query,
						timestamp: i * segmentDuration,
						duration: segmentDuration,
						order: i + 1,
					});

					console.log(`Image ${i + 1} saved: ${localUrl}`);
				} else {
					throw new Error("Failed to fetch from Unsplash");
				}
			} catch (error) {
				console.error(`Error fetching image for "${query}":`, error);
				// Create a placeholder
				const filename = `image-${i + 1}-placeholder.txt`;
				const filepath = join(projectDir, filename);
				await writeFile(filepath, query);

				images.push({
					imageUrl: `https://via.placeholder.com/1920x1080/4F46E5/FFFFFF?text=${encodeURIComponent(query)}`,
					imagePrompt: query,
					timestamp: i * segmentDuration,
					duration: segmentDuration,
					order: i + 1,
				});
			}

			// Rate limiting: Wait 100ms between requests
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		return images;
	} catch (error) {
		console.error("Image recommendation error:", error);
		throw new Error("Failed to recommend images");
	}
}
