// Videgen Client-Side JavaScript

// Global variables to store audio data
let currentAudioUrl = null;
let currentAudioDuration = null;

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

		const { audioUrl, duration } = await audioRes.json();

		// Store audio data for later use
		currentAudioUrl = audioUrl;
		currentAudioDuration = duration;

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

		const { audioUrl, duration } = await audioRes.json();

		// Update audio data
		currentAudioUrl = audioUrl;
		currentAudioDuration = duration;

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

// Proceed to video generation after audio is approved
async function proceedToVideo() {
	const script = document.getElementById("script").value;

	if (!currentAudioUrl || !currentAudioDuration) {
		showError("Please generate audio first");
		return;
	}

	hideError();
	disableButton("proceed-video-btn");

	try {
		// Step 1: Get image recommendations
		showProgress("Finding relevant images...");
		const imagesRes = await fetch("/api/recommend-images", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				script: script.trim(),
				duration: currentAudioDuration,
			}),
		});

		if (!imagesRes.ok) {
			const error = await imagesRes.json();
			throw new Error(error.error || "Failed to recommend images");
		}

		const { images } = await imagesRes.json();

		// Step 2: Generate video
		showProgress("Creating your video (this may take 2-3 minutes)...");
		const videoRes = await fetch("/api/generate-video", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ audioUrl: currentAudioUrl, images }),
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
	document.getElementById("video-section").classList.add("hidden");
	hideError();
	hideProgress();

	// Reset audio data
	currentAudioUrl = null;
	currentAudioDuration = null;

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
