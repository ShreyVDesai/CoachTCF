# CoachTCF - Complete Setup Guide for Beginners

Welcome! This guide will walk you through setting up CoachTCF from scratch. Don't worry if you're new to development - we'll explain everything step by step.

## What You'll Build

CoachTCF is a web application that helps users practice for the TCF French exam with daily AI-powered coaching. Users complete listening, speaking, and writing tasks, then get personalized feedback on their French skills.

## Prerequisites (What You Need Installed)

### 1. Node.js (JavaScript runtime)
- **What it is**: Software that lets you run JavaScript code on your computer
- **How to install**:
  - Go to https://nodejs.org/
  - Download the LTS version (Long Term Support)
  - Run the installer
  - Verify installation: Open terminal/PowerShell and type `node --version`
  - You should see something like `v20.x.x`

### 2. Git (Version control)
- **What it is**: Tool for tracking code changes
- **How to install**:
  - Go to https://git-scm.com/
  - Download and install
  - Verify: Type `git --version` in terminal

### 3. Code Editor (VS Code Recommended)
- **What it is**: Where you'll write and edit code
- **How to install**:
  - Go to https://code.visualstudio.com/
  - Download and install
  - Install recommended extensions:
    - ESLint
    - Prettier
    - TypeScript and JavaScript Language Features

### 4. Accounts You'll Need
- ✅ LiquidMetal Raindrop account (from hackathon - check your email)
- ✅ Vultr account (from hackathon - check your email)

## Step-by-Step Setup

### Step 1: Verify Your Project Structure

Open your terminal/PowerShell and navigate to the CoachTCF folder:

```powershell
cd C:\Users\shrey\Projects\CoachTCF
```

You should see:
```
CoachTCF/
├── frontend/          # Your Next.js web app
├── backend/           # Your API server
└── docs/              # This guide!
```

### Step 2: Configure Raindrop Platform

**This is the most important step!** Raindrop provides your database, file storage, and AI capabilities.

📖 **Follow the detailed guide**: Open `docs/RAINDROP.md` and complete ALL steps.

You'll need to:
1. Create a Raindrop project
2. Enable SmartSQL (database)
3. Enable SmartBuckets (file storage)
4. Enable SmartInference (AI)
5. Copy all credentials to `backend/.env`

⏱️ **Time estimate**: 15-20 minutes

### Step 3: Set Up the Database

Once Raindrop SmartSQL is configured, you need to create the database tables.

1. **Open Raindrop SQL Console**:
   - Go to your Raindrop dashboard
   - Click on your CoachTCF project
   - Go to **SmartSQL** tab
   - Click **"Open SQL Console"**

2. **Run the Schema**:
   - Copy the entire SQL schema from below
   - Paste it into the SQL Console
   - Click **"Execute"** or **"Run"**

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily sessions table
CREATE TABLE daily_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  session_date DATE NOT NULL,
  listening_question TEXT,
  listening_answer TEXT,
  speech_audio_url TEXT,
  writing_prompt TEXT,
  writing_text TEXT,
  status VARCHAR(50) DEFAULT 'in_progress',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, session_date)
);

-- Daily results table
CREATE TABLE daily_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES daily_sessions(id),
  cefr_level VARCHAR(10),
  pronunciation_notes TEXT,
  lexical_score INTEGER,
  grammar_score INTEGER,
  today_correction TEXT,
  raw_ai_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_date ON daily_sessions(user_id, session_date DESC);
CREATE INDEX idx_results_session ON daily_results(session_id);
```

3. **Verify Tables Were Created**:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   You should see: `users`, `daily_sessions`, `daily_results`

### Step 4: Configure Environment Variables

#### Backend Configuration

Create `backend/.env` file (copy from `backend/.env.example`):

```bash
# Copy all your Raindrop credentials here
RAINDROP_API_KEY=your_api_key_from_raindrop
RAINDROP_PROJECT_ID=your_project_id
RAINDROP_SQL_CONNECTION_STRING=postgresql://user:pass@host:5432/coachtcf

RAINDROP_BUCKET_NAME=coach-tcf-audio
RAINDROP_BUCKET_ACCESS_KEY=your_access_key
RAINDROP_BUCKET_SECRET_KEY=your_secret_key
RAINDROP_BUCKET_ENDPOINT=https://storage.raindrop.cloud

JWT_SECRET=create_a_random_string_here_at_least_32_characters_long

PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

**How to generate JWT_SECRET**:
- Windows PowerShell: 
  ```powershell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
  ```
- Or just type 32+ random characters

#### Frontend Configuration

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Step 5: Install Dependencies

Both frontend and backend need their npm packages installed.

**Backend:**
```powershell
cd backend
npm install
```
This installs: express, cors, bcrypt, JWT, PostgreSQL driver, etc.

**Frontend:**
```powershell
cd ../frontend
npm install
```
This installs: React, Next.js, TailwindCSS, shadcn/ui, etc.

### Step 6: Start the Application

You'll need **TWO terminal windows** open.

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
You should see: `Server running on port 3001`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
You should see: `Ready on http://localhost:3000`

### Step 7: Test the Application

1. **Open your browser**: Go to http://localhost:3000
2. **You should see**: CoachTCF landing page
3. **Test registration**:
   - Click "Get Started" or "Sign Up"
   - Enter email: `test@example.com`
   - Enter password: `TestPassword123`
   - Enter name: `Test User`
   - Click "Register"
4. **If successful**: You'll be redirected to the dashboard

## Understanding the Architecture

### Frontend (Next.js)
- **Location**: `frontend/` folder
- **What it does**: The website users see and interact with
- **Pages**:
  - `/` - Landing page
  - `/login` - Login/signup
  - `/dashboard` - Progress overview
  - `/session` - Daily practice session
  - `/results` - Session results

### Backend (Express API)
- **Location**: `backend/` folder
- **What it does**: Handles data, authentication, and AI processing
- **Endpoints**:
  - `POST /api/auth/register` - Create account
  - `POST /api/auth/login` - Login
  - `POST /api/session/start` - Begin daily session
  - `POST /api/session/submit` - Submit answers
  - `GET /api/progress/:userId` - Get user progress

### Database (Raindrop SmartSQL)
- **What it stores**:
  - User accounts (email, password)
  - Daily sessions (questions, answers)
  - Results (scores, feedback)

### File Storage (Raindrop SmartBuckets)
- **What it stores**: Audio recordings from speaking tasks

### AI (Raindrop SmartInference)
- **What it does**: 
  - Generates daily questions
  - Evaluates user responses
  - Provides personalized feedback

## Common Issues & Solutions

### Issue: "Cannot connect to database"
**Solution**:
- Check `RAINDROP_SQL_CONNECTION_STRING` in `.env`
- Verify database is running in Raindrop dashboard
- Test connection in Raindrop SQL Console

### Issue: "API key invalid"
**Solution**:
- Verify `RAINDROP_API_KEY` is correct
- Check it's not expired in dashboard
- Regenerate if necessary

### Issue: "Port 3000 already in use"
**Solution**:
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process_id> /F
```

### Issue: "Module not found"
**Solution**:
```powershell
# Reinstall dependencies
rm -rf node_modules
rm package-lock.json
npm install
```

### Issue: Audio recording doesn't work
**Solution**:
- Browser must use HTTPS or localhost
- Check browser permissions for microphone
- Try different browser (Chrome recommended)

## Development Workflow

### Making Changes

1. **Edit code** in VS Code
2. **Save file** (Ctrl+S)
3. **Backend**: Automatically restarts (watch mode)
4. **Frontend**: Automatically refreshes in browser
5. **Test your changes**

### Testing API Endpoints

Use a tool like **Thunder Client** (VS Code extension):

1. Install Thunder Client in VS Code
2. Create new request
3. Test registration:
   - Method: POST
   - URL: http://localhost:3001/api/auth/register
   - Body (JSON):
     ```json
     {
       "email": "test@test.com",
       "password": "password123",
       "name": "Test User"
     }
     ```
4. Click "Send"
5. Should get response with `userId` and `token`

## Next Steps

1. ✅ Complete Raindrop setup
2. ✅ Run database schema
3. ✅ Configure .env files
4. ✅ Start backend and frontend
5. ✅ Test basic functionality
6. 🔧 Customize and enhance features
7. 🚀 Deploy to production (Vultr)
8. 📹 Create demo video
9. 📝 Submit to hackathon

## Getting Help

- **Raindrop Issues**: Check `docs/RAINDROP.md` troubleshooting
- **Code Issues**: Check error messages in terminal
- **Hackathon Support**: Join the Discord #ai-champion-ship channel
- **Documentation**: See `docs/API.md` for API details

## Resources

- Next.js Docs: https://nextjs.org/docs
- Express Guide: https://expressjs.com/
- Raindrop Docs: [Check hackathon resources]
- PostgreSQL Tutorial: https://www.postgresql.org/docs/

Good luck building CoachTCF! 🚀🇫🇷

