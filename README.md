# Videgen

> Simple AI-powered video generator - One page, no database, pure simplicity

**Videgen** is a lightweight single-page web app that transforms educational topics into professional explainer videos using AI.

## ✨ Features

- 🎬 **One-Click Video Generation** - From topic to video in minutes
- 🌍 **Multi-Language Support** - Generate scripts in English or Indonesian
- 🤖 **Flexible AI Models** - Choose between Gemini 2.0 Flash (fast) or Gemini 1.5 Pro (quality)
- 🎙️ **AI Narration** - Natural-sounding text-to-speech voices
- ✏️ **Editable Scripts** - Full control over your content
- 🖼️ **Smart Visuals** - AI-recommended images from Unsplash
- 📦 **Zero Setup** - No database, no complex configuration
- 🚀 **Fast & Lightweight** - Built with Hono.js and vanilla JS

## 🛠️ Tech Stack

- **Backend**: Hono.js (TypeScript)
- **Frontend**: HTML/CSS/JavaScript + Tailwind CSS (CDN)
- **Runtime**: Bun or Node.js
- **AI Services**: Google Gemini (2.0 Flash / 1.5 Pro), OpenAI GPT-4, Google Cloud TTS, Google Veo 3, Unsplash
- **Storage**: Temporary files only (no database)

## 🚀 Quick Start

```bash
# 1. Install Bun
curl -fsSL https://bun.sh/install | bash

# 2. Clone and install
git clone https://github.com/yourusername/videgen.git
cd videgen
bun install

# 3. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 4. Run
bun run dev
```

Visit http://localhost:3000

## 📁 Project Structure

```
videgen/
├── src/
│   ├── index.ts          # Main Hono app
│   ├── services/         # AI service integrations
│   ├── public/           # Static HTML/CSS/JS
│   └── temp/             # Temporary video files
├── .env                  # API keys
└── package.json
```

## 🎯 How It Works

1. **Enter Topic** → Type your educational question
2. **Choose Language** → Select English or Indonesian
3. **Select AI Model** → Choose Gemini 2.0 Flash (fast) or 1.5 Pro (quality)
4. **Generate Script** → AI creates a narration script in your chosen language
5. **Edit Script** → Review and customize the text
6. **Generate Video** → AI creates audio, finds images, assembles video
7. **Download** → Get your MP4 file

## 💰 Cost

**Per Video**: ~$0.15-0.55
**Monthly (100 videos)**: ~$15-75

## 📄 License

MIT License

## 🙋 Support

- [Documentation](./PLANNING.md)
- [Issues](https://github.com/yourusername/videgen/issues)

---

Built with ❤️ using Hono.js and AI
