// Videgen Client-Side JavaScript

// Generate script from topic
async function generateScript() {
  const topic = document.getElementById('topic').value;

  if (!topic || topic.trim().length === 0) {
    showError('Please enter a topic or question');
    return;
  }

  hideError();
  showProgress('Generating script with AI...');
  disableButton('generate-script-btn');

  try {
    const res = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topic.trim() })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to generate script');
    }

    const { script } = await res.json();

    // Display the script
    document.getElementById('script').value = script;
    document.getElementById('script-section').classList.remove('hidden');

    hideProgress();
    enableButton('generate-script-btn');
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Failed to generate script. Please try again.');
    hideProgress();
    enableButton('generate-script-btn');
  }
}

// Generate complete video
async function generateVideo() {
  const script = document.getElementById('script').value;
  const voice = document.getElementById('voice').value;

  if (!script || script.trim().length === 0) {
    showError('Script cannot be empty');
    return;
  }

  hideError();
  disableButton('generate-video-btn');

  try {
    // Step 1: Generate audio
    showProgress('Generating audio with AI voice...');
    const audioRes = await fetch('/api/generate-audio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: script.trim(), voice })
    });

    if (!audioRes.ok) {
      const error = await audioRes.json();
      throw new Error(error.error || 'Failed to generate audio');
    }

    const { audioUrl, duration } = await audioRes.json();

    // Step 2: Get image recommendations
    showProgress('Finding relevant images...');
    const imagesRes = await fetch('/api/recommend-images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: script.trim(), duration })
    });

    if (!imagesRes.ok) {
      const error = await imagesRes.json();
      throw new Error(error.error || 'Failed to recommend images');
    }

    const { images } = await imagesRes.json();

    // Step 3: Generate video
    showProgress('Creating your video (this may take 2-3 minutes)...');
    const videoRes = await fetch('/api/generate-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl, images })
    });

    if (!videoRes.ok) {
      const error = await videoRes.json();
      throw new Error(error.error || 'Failed to generate video');
    }

    const { videoUrl } = await videoRes.json();

    // Display the video
    document.getElementById('video-player').src = videoUrl;
    document.getElementById('download-btn').href = videoUrl;
    document.getElementById('video-section').classList.remove('hidden');

    hideProgress();
    enableButton('generate-video-btn');

    // Scroll to video
    document.getElementById('video-section').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error:', error);
    showError(error.message || 'Failed to generate video. Please try again.');
    hideProgress();
    enableButton('generate-video-btn');
  }
}

// Reset app to initial state
function resetApp() {
  document.getElementById('topic').value = '';
  document.getElementById('script').value = '';
  document.getElementById('script-section').classList.add('hidden');
  document.getElementById('video-section').classList.add('hidden');
  hideError();
  hideProgress();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// UI Helper Functions
function showProgress(message) {
  document.getElementById('status').textContent = message;
  document.getElementById('progress').classList.remove('hidden');
}

function hideProgress() {
  document.getElementById('progress').classList.add('hidden');
}

function showError(message) {
  document.getElementById('error-message').textContent = message;
  document.getElementById('error').classList.remove('hidden');

  // Auto-hide error after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  document.getElementById('error').classList.add('hidden');
}

function disableButton(buttonId) {
  const btn = document.getElementById(buttonId);
  btn.disabled = true;
  btn.classList.add('opacity-50', 'cursor-not-allowed');
}

function enableButton(buttonId) {
  const btn = document.getElementById(buttonId);
  btn.disabled = false;
  btn.classList.remove('opacity-50', 'cursor-not-allowed');
}

// Add keyboard shortcuts
document.addEventListener('DOMContentLoaded', () => {
  // Enter key on topic input
  document.getElementById('topic').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      generateScript();
    }
  });
});
