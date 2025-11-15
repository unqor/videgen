// Videgen Client-Side JavaScript

// Global variables to store project data
let currentProjectId = null;
let currentAudioUrl = null;
let currentAudioDuration = null;
let currentImages = [];

// Generate script from topic
async function generateScript() {
	const topic = document.getElementById("topic").value;
	const language = document.getElementById("language").value;
	const model = document.getElementById("model").value;

	if (!topic || topic.trim().length === 0) {
		showError("Please enter a topic or question");
		return;
	}

	hideError();
	const modelName =
		model === "gemini-2.5-flash" ? "Gemini 2.5 Flash" : "Gemini 2.5 Pro";
	const langName = language === "english" ? "English" : "Indonesian";
	showProgress(`Generating ${langName} script with ${modelName}...`);
	disableButton("generate-script-btn");

	try {
		const res = await fetch("/api/generate-script", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				topic: topic.trim(),
				language: language,
				model: model,
			}),
		});

		if (!res.ok) {
			const error = await res.json();
			throw new Error(error.error || "Failed to generate script");
		}

		const { script } = await res.json();

		// Display the script
		document.getElementById("script").value = script;
		document.getElementById("script-section").classList.remove("hidden");

		hideProgress();
		enableButton("generate-script-btn");
	} catch (error) {
		console.error("Error:", error);
		showError(
			error.message || "Failed to generate script. Please try again.",
		);
		hideProgress();
		enableButton("generate-script-btn");
	}
}

// Generate audio from script
async function generateAudio() {
	const script = document.getElementById("script").value;
	const voice = document.getElementById("voice").value;

	if (!script || script.trim().length === 0) {
		showError("Script cannot be empty");
		return;
	}

	hideError();
	disableButton("generate-audio-btn");

	try {
		showProgress("Generating audio with AI voice...");
		const audioRes = await fetch("/api/generate-audio", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ script: script.trim(), voice }),
		});

		if (!audioRes.ok) {
			const error = await audioRes.json();
			throw new Error(error.error || "Failed to generate audio");
		}

		const { audioUrl, duration, projectId } = await audioRes.json();

		// Store audio and project data for later use
		currentAudioUrl = audioUrl;
		currentAudioDuration = duration;
		currentProjectId = projectId;

		// Display the audio player
		document.getElementById("audio-player").src = audioUrl;
		document.getElementById("audio-section").classList.remove("hidden");

		// Set the regenerate voice selector to match current voice
		document.getElementById("voice-regenerate").value = voice;

		hideProgress();
		enableButton("generate-audio-btn");

		// Scroll to audio section
		document
			.getElementById("audio-section")
			.scrollIntoView({ behavior: "smooth" });
	} catch (error) {
		console.error("Error:", error);
		showError(
			error.message || "Failed to generate audio. Please try again.",
		);
		hideProgress();
		enableButton("generate-audio-btn");
	}
}

// Regenerate audio with different voice
async function regenerateAudio() {
	const script = document.getElementById("script").value;
	const voice = document.getElementById("voice-regenerate").value;

	if (!script || script.trim().length === 0) {
		showError("Script cannot be empty");
		return;
	}

	hideError();
	disableButton("regenerate-audio-btn");

	try {
		showProgress("Regenerating audio with new voice...");
		const audioRes = await fetch("/api/generate-audio", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ script: script.trim(), voice }),
		});

		if (!audioRes.ok) {
			const error = await audioRes.json();
			throw new Error(error.error || "Failed to generate audio");
		}

		const { audioUrl, duration, projectId } = await audioRes.json();

		// Update audio and project data
		currentAudioUrl = audioUrl;
		currentAudioDuration = duration;
		currentProjectId = projectId;

		// Update the audio player
		document.getElementById("audio-player").src = audioUrl;
		document.getElementById("audio-player").load();
		document.getElementById("audio-player").play();

		hideProgress();
		enableButton("regenerate-audio-btn");
	} catch (error) {
		console.error("Error:", error);
		showError(
			error.message || "Failed to regenerate audio. Please try again.",
		);
		hideProgress();
		enableButton("regenerate-audio-btn");
	}
}

// Generate images from script
async function generateImages() {
	const script = document.getElementById("script").value;

	if (!currentProjectId || !currentAudioDuration) {
		showError("Please generate audio first");
		return;
	}

	hideError();
	disableButton("generate-images-btn");

	try {
		showProgress("Generating 4-8 images based on your script...");
		const imagesRes = await fetch("/api/recommend-images", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				script: script.trim(),
				duration: currentAudioDuration,
				projectId: currentProjectId,
			}),
		});

		if (!imagesRes.ok) {
			const error = await imagesRes.json();
			throw new Error(error.error || "Failed to generate images");
		}

		const { images } = await imagesRes.json();

		// Store images
		currentImages = images;

		// Display images
		displayImages(images);

		// Show images section
		document.getElementById("images-section").classList.remove("hidden");

		hideProgress();
		enableButton("generate-images-btn");

		// Scroll to images section
		document
			.getElementById("images-section")
			.scrollIntoView({ behavior: "smooth" });
	} catch (error) {
		console.error("Error:", error);
		showError(
			error.message || "Failed to generate images. Please try again.",
		);
		hideProgress();
		enableButton("generate-images-btn");
	}
}

// Regenerate images with different results
async function regenerateImages() {
	const script = document.getElementById("script").value;

	if (!currentProjectId || !currentAudioDuration) {
		showError("Please generate audio first");
		return;
	}

	hideError();
	disableButton("regenerate-images-btn");

	try {
		showProgress("Regenerating images...");
		const imagesRes = await fetch("/api/recommend-images", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				script: script.trim(),
				duration: currentAudioDuration,
				projectId: currentProjectId,
			}),
		});

		if (!imagesRes.ok) {
			const error = await imagesRes.json();
			throw new Error(error.error || "Failed to regenerate images");
		}

		const { images } = await imagesRes.json();

		// Update stored images
		currentImages = images;

		// Display updated images
		displayImages(images);

		hideProgress();
		enableButton("regenerate-images-btn");
	} catch (error) {
		console.error("Error:", error);
		showError(
			error.message ||
				"Failed to regenerate images. Please try again.",
		);
		hideProgress();
		enableButton("regenerate-images-btn");
	}
}

// Display images in the grid
function displayImages(images) {
	const grid = document.getElementById("images-grid");
	grid.innerHTML = "";

	images.forEach((image, index) => {
		const div = document.createElement("div");
		div.className = "relative group";
		div.innerHTML = `
			<img
				src="${image.imageUrl}"
				alt="${image.imagePrompt}"
				class="w-full h-32 object-cover rounded-lg shadow-md hover:shadow-xl transition"
			/>
			<div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition">
				${index + 1}. ${image.imagePrompt}
			</div>
		`;
		grid.appendChild(div);
	});
}

// Proceed to video generation after images are approved
async function proceedToVideo() {
	if (!currentAudioUrl || !currentImages.length) {
		showError("Please generate audio and images first");
		return;
	}

	hideError();
	disableButton("proceed-video-btn");

	try {
		// Generate video with stored audio and images
		showProgress("Creating your video (this may take 2-3 minutes)...");
		const videoRes = await fetch("/api/generate-video", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				audioUrl: currentAudioUrl,
				images: currentImages,
			}),
		});

		if (!videoRes.ok) {
			const error = await videoRes.json();
			throw new Error(error.error || "Failed to generate video");
		}

		const { videoUrl } = await videoRes.json();

		// Display the video
		document.getElementById("video-player").src = videoUrl;
		document.getElementById("download-btn").href = videoUrl;
		document.getElementById("video-section").classList.remove("hidden");

		hideProgress();
		enableButton("proceed-video-btn");

		// Scroll to video
		document
			.getElementById("video-section")
			.scrollIntoView({ behavior: "smooth" });
	} catch (error) {
		console.error("Error:", error);
		showError(
			error.message || "Failed to generate video. Please try again.",
		);
		hideProgress();
		enableButton("proceed-video-btn");
	}
}

// Reset app to initial state
function resetApp() {
	document.getElementById("topic").value = "";
	document.getElementById("script").value = "";
	document.getElementById("script-section").classList.add("hidden");
	document.getElementById("audio-section").classList.add("hidden");
	document.getElementById("images-section").classList.add("hidden");
	document.getElementById("video-section").classList.add("hidden");
	hideError();
	hideProgress();

	// Reset all project data
	currentProjectId = null;
	currentAudioUrl = null;
	currentAudioDuration = null;
	currentImages = [];

	// Scroll to top
	window.scrollTo({ top: 0, behavior: "smooth" });
}

// UI Helper Functions
function showProgress(message) {
	document.getElementById("status").textContent = message;
	document.getElementById("progress").classList.remove("hidden");
}

function hideProgress() {
	document.getElementById("progress").classList.add("hidden");
}

function showError(message) {
	document.getElementById("error-message").textContent = message;
	document.getElementById("error").classList.remove("hidden");

	// Auto-hide error after 5 seconds
	setTimeout(() => {
		hideError();
	}, 5000);
}

function hideError() {
	document.getElementById("error").classList.add("hidden");
}

function disableButton(buttonId) {
	const btn = document.getElementById(buttonId);
	btn.disabled = true;
	btn.classList.add("opacity-50", "cursor-not-allowed");
}

function enableButton(buttonId) {
	const btn = document.getElementById(buttonId);
	btn.disabled = false;
	btn.classList.remove("opacity-50", "cursor-not-allowed");
}

// Add keyboard shortcuts
document.addEventListener("DOMContentLoaded", () => {
	// Enter key on topic input
	document.getElementById("topic").addEventListener("keypress", (e) => {
		if (e.key === "Enter") {
			generateScript();
		}
	});
});
