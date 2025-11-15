import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
	apiKey: process.env.GOOGLE_GEMINI_API_KEY || "",
});

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
): Promise<ImageRecommendation[]> {
	const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

	if (!unsplashAccessKey) {
		throw new Error("UNSPLASH_ACCESS_KEY not configured");
	}

	try {
		// Step 1: Use Gemini to extract key visual concepts from the script
		const conceptsPrompt = `Analyze this video script and extract 4-5 key visual concepts that would make good background images for each section.

Script: "${script}"

You are an expert at analyzing scripts and identifying visual concepts. Return ONLY a JSON array of image search queries, like:
["rice field with seedlings", "farmer planting rice", "mature rice plants", "rice harvest"]

Return only the JSON array, no additional text or explanation.`;

		const conceptsResponse = await genAI.models.generateContent({
			model: "gemini-2.0-flash-exp",
			contents: [{ role: "user", parts: [{ text: conceptsPrompt }] }],
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

		// Step 2: Fetch images from Unsplash for each concept
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
					images.push({
						imageUrl: data?.urls?.regular,
						imagePrompt: query,
						timestamp: i * segmentDuration,
						duration: segmentDuration,
						order: i + 1,
					});
				} else {
					// Fallback: Use a placeholder image
					images.push({
						imageUrl: `https://via.placeholder.com/1920x1080/4F46E5/FFFFFF?text=${encodeURIComponent(query)}`,
						imagePrompt: query,
						timestamp: i * segmentDuration,
						duration: segmentDuration,
						order: i + 1,
					});
				}
			} catch (error) {
				console.error(`Error fetching image for "${query}":`, error);
				// Use placeholder on error
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
