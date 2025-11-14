# Videgen

> AI-powered faceless education explainer video generator

**Videgen** transforms educational topics into professional explainer videos using AI. Simply enter a topic, and Videgen generates a script, narration, visuals, and a complete video—all automatically.

## ✨ Features

- 🎬 **Automated Video Generation** - From topic to video in minutes
- 🎙️ **AI Narration** - Natural-sounding text-to-speech voices
- 🖼️ **Smart Visuals** - AI-recommended images with perfect timing
- ✏️ **Script Editor** - Full control over your content
- 📦 **Batch Processing** - Generate multiple videos at once
- 🎨 **Modern UI** - Beautiful, intuitive interface with shadcn/ui

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Modern utility-first styling
- **shadcn/ui** - Beautiful, accessible components

### Backend
- **Hono.js** - Fast, lightweight web framework
- **PostgreSQL** - Reliable relational database
- **Drizzle ORM** - Type-safe database toolkit

### AI Services
- **Google Veo 3** - Advanced video generation
- **Google Cloud TTS** - Natural text-to-speech
- **OpenAI GPT-4** - Script generation
- **Unsplash API** - High-quality stock images

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ or Bun
- PostgreSQL 15+
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/videgen.git
cd videgen

# Install dependencies
pnpm install

# Set up environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local

# Configure your API keys in .env files

# Run database migrations
cd apps/api
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Start development servers
cd ../..
pnpm dev
```

The app will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 📖 User Flow

1. **Enter Topic** - Type your educational question or topic
2. **Review Script** - AI generates a script that you can edit
3. **Generate Narration** - Choose a voice and create audio
4. **Select Visuals** - Review AI-recommended images and timing
5. **Create Video** - Generate your final explainer video
6. **Download & Share** - Export and distribute your video

## 🏗️ Project Structure

```
videgen/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Hono.js backend
├── packages/
│   └── shared/       # Shared types and utilities
├── docs/             # Documentation
└── PLANNING.md       # Detailed project plan
```

## 📚 Documentation

- [Project Planning](./PLANNING.md) - Complete technical plan
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Deployment Guide](./docs/DEPLOYMENT.md) - How to deploy
- [User Guide](./docs/USER_GUIDE.md) - End-user documentation

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Project planning and architecture
- [ ] Core video generation workflow
- [ ] Script generation and editing
- [ ] TTS integration
- [ ] Basic video output

### Phase 2: Enhanced Features
- [ ] Image recommendations and timeline editor
- [ ] Multiple voice options
- [ ] Video templates
- [ ] Batch processing

### Phase 3: Advanced
- [ ] Custom branding
- [ ] Background music
- [ ] Collaboration features
- [ ] Analytics dashboard

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## 📄 License

MIT License - see LICENSE file for details

## 🙋 Support

- [Documentation](./docs/)
- [Issue Tracker](https://github.com/yourusername/videgen/issues)
- [Discussions](https://github.com/yourusername/videgen/discussions)

## 🌟 Example

**Input:**
> "How long does it take to plant rice until ready for harvest?"

**Output:**
A 60-second explainer video with:
- Professional AI narration
- Relevant rice farming imagery
- Smooth transitions and timing
- Ready to upload and share

---

Built with ❤️ using Next.js, Hono.js, and Google Veo 3
