# 🚀 CoachTCF - Your Next Steps

Congratulations! The CoachTCF application is fully built. Here's your step-by-step guide to complete the hackathon submission.

---

## ✅ What's Complete

- ✅ Next.js frontend with all pages and components
- ✅ Express backend with all API endpoints
- ✅ Database schema ready
- ✅ Authentication system (JWT)
- ✅ AI services (content generation + evaluation)
- ✅ Audio recording functionality
- ✅ Progress tracking with charts
- ✅ Complete documentation
- ✅ Deployment guides
- ✅ Devpost submission template

---

## 📋 Remaining Tasks (In Order)

### 1. Configure Raindrop Platform (30-45 minutes)

**Follow:** `docs/RAINDROP.md`

#### Steps:
1. Log into LiquidMetal Raindrop dashboard (check hackathon email for credentials)
2. Create new project "CoachTCF"
3. Enable **SmartSQL**:
   - Choose "Small" instance
   - Wait 2-3 minutes for provisioning
   - Copy connection string
4. Enable **SmartBuckets**:
   - Create bucket: `coach-tcf-audio`
   - Copy access keys (save immediately, only shown once!)
5. Enable **SmartInference**:
   - Generate API key
   - Verify GPT-4o access
6. Copy ALL credentials to a safe place

**Credentials you'll need:**
```
RAINDROP_API_KEY=...
RAINDROP_PROJECT_ID=...
RAINDROP_SQL_CONNECTION_STRING=postgresql://...
RAINDROP_BUCKET_NAME=coach-tcf-audio
RAINDROP_BUCKET_ACCESS_KEY=...
RAINDROP_BUCKET_SECRET_KEY=...
RAINDROP_BUCKET_ENDPOINT=...
```

---

### 2. Set Up Database Schema (5 minutes)

**Follow:** `docs/SETUP.md` (Step 3)

#### Steps:
1. In Raindrop dashboard, go to SmartSQL tab
2. Click "Open SQL Console"
3. Copy entire contents of `backend/schema.sql`
4. Paste into console
5. Click "Execute" or "Run"
6. Verify tables created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```
   Should show: `users`, `daily_sessions`, `daily_results`

---

### 3. Configure Environment Variables (5 minutes)

#### Backend (`backend/.env`):

Create file: `backend/.env` (copy from `.env.example` if it exists)

```bash
# Raindrop Platform Configuration
RAINDROP_API_KEY=your_api_key_from_step_1
RAINDROP_PROJECT_ID=your_project_id_from_step_1
RAINDROP_SQL_CONNECTION_STRING=your_connection_string_from_step_1

# SmartBuckets Configuration
RAINDROP_BUCKET_NAME=coach-tcf-audio
RAINDROP_BUCKET_ACCESS_KEY=your_access_key_from_step_1
RAINDROP_BUCKET_SECRET_KEY=your_secret_key_from_step_1
RAINDROP_BUCKET_ENDPOINT=https://storage.raindrop.cloud

# Authentication (generate a random 32+ character string)
JWT_SECRET=your_random_secret_here_min_32_characters

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Generate JWT_SECRET:**
- Windows PowerShell:
  ```powershell
  -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
  ```
- Mac/Linux:
  ```bash
  openssl rand -base64 32
  ```

#### Frontend (`frontend/.env.local`):

Create file: `frontend/.env.local`

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

### 4. Test Locally (20-30 minutes)

#### Start Backend:
```powershell
cd backend
npm run dev
```

Should see:
```
✅ Server started successfully!
🎯 CoachTCF API Server
📍 URL: http://localhost:3001
```

#### Start Frontend (new terminal):
```powershell
cd frontend
npm run dev
```

Should see:
```
✓ Ready on http://localhost:3000
```

#### Test Complete Flow:
1. Open http://localhost:3000
2. Click "Get Started"
3. Register a new account
4. Start a session
5. Complete all three tasks:
   - Listen to audio, answer question
   - Record 2-minute speech
   - Write 50-80 words
6. Wait for AI evaluation (10-15 seconds)
7. View results
8. Check dashboard for progress

**If everything works:** ✅ Ready to deploy!

**If something fails:** Check:
- Backend terminal for errors
- Frontend terminal for errors
- Browser console (F12) for errors
- Environment variables are correct
- Database connection works

---

### 5. Deploy to Production (60-90 minutes)

**Follow:** `docs/DEPLOYMENT.md`

#### 5a. Deploy Backend to Raindrop (30 minutes)

**Via Dashboard:**
1. Log into Raindrop
2. Go to CoachTCF project
3. Click "Deploy" tab
4. Upload `backend/` folder or connect GitHub
5. Set environment variables (same as local, but update `FRONTEND_URL`)
6. Deploy
7. Copy backend URL (e.g., `https://coachtcf.raindrop.app`)

**Test:**
```bash
curl https://coachtcf.raindrop.app/health
```

#### 5b. Deploy Frontend to Vultr (60 minutes)

**Create Server:**
1. Log into Vultr dashboard
2. Deploy new server:
   - Ubuntu 22.04 LTS
   - $6/month plan (2GB RAM)
   - Choose nearest region
3. Copy IP address

**Set Up Server (SSH):**
```bash
ssh root@your-vultr-ip

# Install Node.js, PM2, Nginx
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx
npm install -g pm2

# Clone and build
cd /var/www
git clone https://github.com/yourusername/coachtcf.git
cd coachtcf/frontend
npm install

# Create .env.local
nano .env.local
# Add: NEXT_PUBLIC_API_URL=https://coachtcf.raindrop.app

# Build
npm run build

# Start with PM2
pm2 start npm --name "coachtcf-frontend" -- start
pm2 save
pm2 startup

# Configure Nginx (see docs/DEPLOYMENT.md)
```

**Optional: Set up domain + SSL**
- Point domain to Vultr IP
- Install Certbot
- Get SSL certificate

**Access:** http://your-vultr-ip or https://your-domain.com

---

### 6. Record Demo Video (60-90 minutes)

**Follow:** `docs/DEVPOST.md` (Demo Video Script section)

#### Tools:
- **Screen Recording:** OBS Studio (free) or Loom
- **Editing:** DaVinci Resolve (free) or iMovie

#### Script (3 minutes):
1. **Intro (15s):** What is CoachTCF
2. **Registration (10s):** Quick signup
3. **Listening Task (30s):** Show AI-generated question
4. **Speaking Task (30s):** Record audio
5. **Writing Task (30s):** Write response
6. **Results (45s):** Show scores, CEFR level, feedback
7. **Dashboard (15s):** Progress charts, streak
8. **Tech Stack (15s):** Raindrop + Vultr

#### Tips:
- Write out exactly what you'll say
- Do 2-3 practice runs
- Use good lighting and microphone
- Show features in action (not just talking)
- Add captions/subtitles
- Max 3 minutes

#### Upload:
- YouTube (Unlisted or Public)
- Title: "CoachTCF - AI French Coach | LiquidMetal Hackathon"
- Add description with links

---

### 7. Submit to Devpost (30 minutes)

**Follow:** `docs/DEVPOST.md` (Submission Steps section)

1. **Go to:** https://liquidmetal.devpost.com
2. **Click:** "Submit Project"
3. **Fill in:**
   - Project name: CoachTCF
   - Tagline: Master French daily with AI-powered TCF exam coaching
   - Description: (Copy from `docs/DEVPOST.md`)
   - Video URL: Your YouTube link
   - GitHub: https://github.com/yourusername/coachtcf
   - Live Demo: Your Vultr URL
   - Built With: next-js, react, node-js, raindrop-ai, vultr, gpt-4o, etc.

4. **Select Categories:**
   - Best Overall Idea
   - Best Small Startup Agents
   - Best AI Solution for Public Good
   - Best AI App by a Solopreneur

5. **Add Screenshots** (5-8):
   - Landing page
   - Login
   - Listening task
   - Speaking task
   - Writing task
   - Results
   - Dashboard

6. **Review & Submit**

**Deadline:** December 7, 2025 @ 11:45pm PST

---

## 🎯 Quick Reference Commands

### Local Development

**Backend:**
```powershell
cd backend
npm run dev
```

**Frontend:**
```powershell
cd frontend
npm run dev
```

**Database Console:**
- Open Raindrop dashboard → SmartSQL → Open Console

### Testing API

```bash
# Health check
curl http://localhost:3001/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\",\"name\":\"Test User\"}"
```

---

## 📚 Documentation Quick Links

- **Setup Guide:** `docs/SETUP.md`
- **Raindrop Config:** `docs/RAINDROP.md`
- **API Reference:** `docs/API.md`
- **Deployment:** `docs/DEPLOYMENT.md`
- **Devpost Submission:** `docs/DEVPOST.md`

---

## ❓ Troubleshooting

### Backend won't start

**Check:**
- `.env` file exists in `backend/`
- All environment variables are set
- Database connection string is correct
- Port 3001 is not in use

**Fix:**
```powershell
cd backend
# Check env vars
cat .env

# Test database
# (In Raindrop SQL console)
SELECT version();
```

### Frontend won't connect to backend

**Check:**
- Backend is running
- `NEXT_PUBLIC_API_URL` in `frontend/.env.local` is correct
- No CORS errors in browser console (F12)

**Fix:**
```powershell
cd frontend
# Check env
cat .env.local

# Should be: NEXT_PUBLIC_API_URL=http://localhost:3001

# Restart frontend
npm run dev
```

### AI evaluation fails

**Check:**
- `RAINDROP_API_KEY` is set
- SmartInference is enabled in Raindrop
- You have available credits

**Test:**
- In Raindrop dashboard → SmartInference → Playground
- Try a test prompt

### Audio recording doesn't work

**Check:**
- Using HTTPS or localhost (required for microphone access)
- Browser permissions granted
- Try Chrome (best compatibility)

---

## ✅ Final Checklist

Before submitting to Devpost:

- [ ] Raindrop configured (SmartSQL, SmartBuckets, SmartInference)
- [ ] Database schema created
- [ ] Environment variables set (both backend and frontend)
- [ ] Tested locally (complete user flow works)
- [ ] Backend deployed to Raindrop
- [ ] Frontend deployed to Vultr
- [ ] Production deployment tested
- [ ] Demo video recorded and uploaded
- [ ] GitHub repo is public with README
- [ ] Screenshots prepared
- [ ] Devpost form filled out completely
- [ ] Project submitted before deadline

---

## 🎉 You're Ready!

Everything is built and documented. Just follow the steps above in order, and you'll have a complete, working, deployed application ready for the hackathon.

**Estimated Total Time:** 4-6 hours for configuration, deployment, and submission

**Need Help?**
- Check documentation in `docs/` folder
- Review error messages carefully
- Test each step before moving to next
- Hackathon Discord: #ai-champion-ship

---

## 🏆 Good Luck!

You've built something amazing. Now it's time to share it with the world!

**Remember:** The deadline is **December 7, 2025 @ 11:45pm PST**

🇫🇷 **Bonne chance!** (Good luck!)

---

<div align="center">

**Built with ❤️ for the LiquidMetal AI Champion Ship Hackathon**

Powered by Raindrop AI • Hosted on Vultr • Made with Next.js & Express

</div>

