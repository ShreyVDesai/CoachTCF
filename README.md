# CoachTCF - Daily TCF French Exam AI Coach

<div align="center">

![CoachTCF Logo](https://img.shields.io/badge/CoachTCF-French%20AI%20Coach-blue?style=for-the-badge)
[![Built for LiquidMetal Hackathon](https://img.shields.io/badge/Hackathon-LiquidMetal%20AI-purple?style=for-the-badge)](https://liquidmetal.devpost.com)
[![Powered by Raindrop](https://img.shields.io/badge/Powered%20by-Raindrop%20AI-green?style=for-the-badge)](https://raindrop.ai)
[![Hosted on Vultr](https://img.shields.io/badge/Hosted%20on-Vultr-orange?style=for-the-badge)](https://vultr.com)

**Master French with AI-Powered Daily Practice**

[Demo Video](#) • [Documentation](docs/) • [API Reference](docs/API.md)

</div>

---

## 🎯 What is CoachTCF?

CoachTCF is an AI-powered daily French learning platform that helps users prepare for the TCF (Test de Connaissance du Français) exam. Complete a 5-6 minute daily session with listening, speaking, and writing tasks, then receive personalized AI feedback on your performance.

### ✨ Key Features

- 🎧 **Daily Listening Practice**: AI-generated French comprehension questions
- 🎤 **Speech Recording**: Record 2-minute responses with pronunciation feedback
- ✍️ **Writing Evaluation**: Get detailed grammar and vocabulary analysis
- 📊 **CEFR Level Tracking**: Monitor your progress from A1 to C1
- 📈 **Progress Dashboard**: Visualize improvement over time with charts
- 🎯 **Targeted Feedback**: Receive one specific correction daily to focus on

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- ⚛️ Next.js 14 (App Router)
- 🎨 TailwindCSS + shadcn/ui
- 📊 Recharts for data visualization
- 🎙️ MediaRecorder API for audio recording

**Backend:**
- 🚀 Node.js + Express
- 🗄️ PostgreSQL via Raindrop SmartSQL
- 🪣 Raindrop SmartBuckets (audio storage)
- 🤖 Raindrop SmartInference (GPT-4o)

**Hosting:**
- 🌐 Vultr Cloud Compute (Frontend)
- ☁️ Raindrop Platform (Backend)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Raindrop Platform account (from hackathon)
- Vultr account (from hackathon)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/coachtcf.git
   cd coachtcf
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Raindrop Platform:**
   - Follow the detailed guide: [docs/RAINDROP.md](docs/RAINDROP.md)
   - Enable SmartSQL, SmartBuckets, and SmartInference
   - Copy credentials to `backend/.env`

5. **Set up the database:**
   - Open Raindrop SmartSQL Console
   - Run the schema from `backend/schema.sql`

6. **Configure environment variables:**

   **Backend** (`backend/.env`):
   ```env
   RAINDROP_API_KEY=your_key
   RAINDROP_PROJECT_ID=your_project_id
   RAINDROP_SQL_CONNECTION_STRING=postgresql://...
   RAINDROP_BUCKET_NAME=coach-tcf-audio
   JWT_SECRET=your_secret
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

7. **Start the development servers:**

   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```

   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

8. **Open the app:**
   - Navigate to http://localhost:3000
   - Create an account and start your first session!

---

## 📖 Documentation

- 📘 [Complete Setup Guide](docs/SETUP.md) - Step-by-step beginner-friendly guide
- 🌧️ [Raindrop Integration](docs/RAINDROP.md) - Configure Raindrop Platform
- 📡 [API Reference](docs/API.md) - Complete API documentation

---

## 🎬 User Flow

1. **Register/Login** → Create account with email and password
2. **Dashboard** → View progress, stats, and current streak
3. **Start Session** → Begin daily 5-6 minute practice
   - **Listening Task** (1 min): Answer French comprehension question
   - **Speaking Task** (2 min): Record audio response
   - **Writing Task** (2 min): Write 50-80 words in French
4. **AI Evaluation** (10-15 sec): GPT-4o analyzes all responses
5. **Results** → View CEFR level, scores, and personalized feedback
6. **Progress Tracking** → See improvement over time

---

## 🏆 Hackathon Integration

### LiquidMetal Requirements ✅

- ✅ **Raindrop SmartSQL**: User data and session storage
- ✅ **Raindrop SmartBuckets**: Audio file storage
- ✅ **Raindrop SmartInference**: GPT-4o for content generation and evaluation
- ✅ **Vultr Services**: Frontend hosting on Vultr Cloud Compute
- ✅ **Built with AI Coding Assistant**: Claude Code & Cursor

### Categories

- 🏆 **Best Overall Idea**: AI-powered language learning with personalized feedback
- 🎯 **Best Small Startup Agents**: Perfect for solo language learners
- 🌍 **Best AI Solution for Public Good**: Making quality French education accessible
- 💡 **Best AI App by a Solopreneur**: Built for independent learners

---

## 📊 Project Structure

```
CoachTCF/
├── frontend/                # Next.js 14 App
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── login/          # Authentication
│   │   ├── dashboard/      # Progress overview
│   │   ├── session/        # Daily practice
│   │   └── results/        # Session results
│   ├── components/
│   │   ├── ui/             # shadcn/ui components
│   │   ├── AuthForm.tsx
│   │   ├── ListeningTask.tsx
│   │   ├── SpeakingTask.tsx
│   │   ├── WritingTask.tsx
│   │   ├── ResultsCard.tsx
│   │   └── ProgressChart.tsx
│   └── lib/
│       ├── api.ts          # API client
│       └── auth-context.tsx
│
├── backend/                 # Express API
│   ├── src/
│   │   ├── index.js        # Server entry
│   │   ├── config/
│   │   │   └── raindrop.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── session.js
│   │   │   └── progress.js
│   │   ├── services/
│   │   │   ├── aiService.js
│   │   │   ├── contentGenerator.js
│   │   │   └── storageService.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── utils/
│   │       └── database.js
│   └── schema.sql
│
└── docs/
    ├── SETUP.md            # Beginner setup guide
    ├── RAINDROP.md         # Raindrop integration
    └── API.md              # API documentation
```

---

## 🎨 Features in Detail

### 🎧 Listening Task

- AI-generated French audio via text-to-speech
- Multiple-choice questions (A, B, C, D)
- Topics: daily life, work, travel, hobbies
- CEFR B1-B2 level

### 🎤 Speaking Task

- Browser-based audio recording (MediaRecorder API)
- 2-minute maximum duration
- Real-time timer and progress bar
- WebM audio format

### ✍️ Writing Task

- 50-80 word requirement with live word count
- Real-time validation
- Grammar and vocabulary focus
- French language prompts

### 🤖 AI Evaluation

- GPT-4o multimodal analysis
- CEFR level assessment (A1-C1)
- Pronunciation feedback
- Lexical variety score (0-100)
- Grammar complexity score (0-100)
- ONE targeted correction for tomorrow

### 📊 Progress Dashboard

- Current streak tracking
- Total sessions completed
- Current CEFR level
- Interactive line charts (Recharts)
- Recent session history
- Score trends over time

---

## 🔐 Security

- Password hashing with bcrypt (10 rounds)
- JWT token authentication (7-day expiry)
- Protected API routes
- User data isolation
- CORS configuration
- Input validation and sanitization

---

## 🚀 Deployment

### Backend (Raindrop Platform)

1. Deploy to Raindrop using their CLI or dashboard
2. Set environment variables in Raindrop project settings
3. Verify database connection
4. Test API endpoints

### Frontend (Vultr)

1. Create Vultr Cloud Compute instance
2. Install Node.js and npm
3. Clone repository and install dependencies
4. Build Next.js: `npm run build`
5. Start with PM2: `pm2 start npm --name "coachtcf" -- start`
6. Configure nginx reverse proxy
7. Set up SSL with Let's Encrypt

---

## 🧪 Testing

See [Testing Guide](docs/SETUP.md#testing-strategy) for details on:
- Manual API testing
- Frontend flow testing
- Audio recording verification
- AI evaluation testing
- End-to-end user flow

---

## 🤝 Contributing

This project was built for the LiquidMetal AI Champion Ship hackathon. While primarily a competition entry, suggestions and feedback are welcome!

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🎖️ Acknowledgments

- **LiquidMetal AI** for hosting the hackathon
- **Raindrop Platform** for SmartSQL, SmartBuckets, and SmartInference
- **Vultr** for cloud hosting credits
- **Cerebras**, **ElevenLabs**, **Netlify**, **WorkOS**, **Stripe**, **Searchable**, **Cloudflare** for sponsor support

---

## 📧 Contact

Built by [Your Name]

- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com
- Hackathon Project: [Devpost Link](#)

---

<div align="center">

**Built with ❤️ for the LiquidMetal AI Champion Ship Hackathon**

Made with Next.js • Express • Raindrop AI • Vultr

</div>
