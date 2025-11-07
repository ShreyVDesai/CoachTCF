# Raindrop Platform Setup Guide

This guide will walk you through setting up LiquidMetal's Raindrop Platform for CoachTCF.

## Prerequisites

- LiquidMetal Raindrop account (you should have received $500 in credits from the hackathon)
- Basic understanding of cloud platforms
- Email access for verification

## Step 1: Access Raindrop Dashboard

1. Go to the LiquidMetal Raindrop dashboard
2. Log in with your hackathon credentials
3. You should see your credit balance ($500)

## Step 2: Create a New Project

1. Click **"Create New Project"** or **"+ New Project"**
2. Name: `CoachTCF`
3. Description: `Daily TCF French Exam AI Coach with SmartSQL, SmartBuckets, and SmartInference`
4. Click **"Create"**
5. Copy your **Project ID** - you'll need this for the `.env` file

## Step 3: Enable SmartSQL (Database)

### What is SmartSQL?
SmartSQL is Raindrop's managed PostgreSQL database service. It handles all database operations with automatic scaling.

### Setup Steps:

1. In your CoachTCF project dashboard, go to **"SmartSQL"** tab
2. Click **"Enable SmartSQL"**
3. Choose configuration:
   - **Instance Size**: Small (sufficient for hackathon/demo)
   - **Region**: Choose closest to you for best performance
4. Click **"Create Database"**
5. Wait 2-3 minutes for provisioning
6. Once ready, you'll see:
   - **Database Host**: `something.raindrop.cloud`
   - **Port**: `5432`
   - **Database Name**: `coachtcf`
   - **Username**: (auto-generated)
   - **Password**: (click "Show" to reveal)
7. **IMPORTANT**: Copy the full connection string. It should look like:
   ```
   postgresql://username:password@host:5432/coachtcf
   ```
8. Save this in `backend/.env` as `RAINDROP_SQL_CONNECTION_STRING`

### Test Your Database Connection:

1. In Raindrop dashboard, click **"Open SQL Console"**
2. Run a test query:
   ```sql
   SELECT version();
   ```
3. You should see PostgreSQL version info

## Step 4: Enable SmartBuckets (Object Storage)

### What is SmartBuckets?
SmartBuckets is Raindrop's S3-compatible object storage for files. We'll use it to store user audio recordings.

### Setup Steps:

1. Go to **"SmartBuckets"** tab in your project
2. Click **"Create Bucket"**
3. Bucket name: `coach-tcf-audio` (must be lowercase, no spaces)
4. Region: Same as your SmartSQL for better performance
5. Access: **Private** (only your backend can access)
6. Click **"Create"**
7. You'll receive:
   - **Bucket Name**: `coach-tcf-audio`
   - **Access Key ID**: (copy this)
   - **Secret Access Key**: (copy this - only shown once!)
   - **Endpoint URL**: `https://storage.raindrop.cloud`
8. Save these credentials securely

### Add to .env:
```
RAINDROP_BUCKET_NAME=coach-tcf-audio
RAINDROP_BUCKET_ACCESS_KEY=your_access_key
RAINDROP_BUCKET_SECRET_KEY=your_secret_key
RAINDROP_BUCKET_ENDPOINT=https://storage.raindrop.cloud
```

## Step 5: Enable SmartInference (AI Models)

### What is SmartInference?
SmartInference gives you access to AI models like GPT-4o through Raindrop's unified API. This is what we'll use for evaluating user responses.

### Setup Steps:

1. Go to **"SmartInference"** tab
2. Click **"Enable SmartInference"**
3. Available models will be listed. Ensure you have access to:
   - **GPT-4o** (for multimodal evaluation - audio + text)
   - **GPT-4** (backup)
4. Click **"Generate API Key"**
5. Copy your **SmartInference API Key**
6. **Rate Limits**: Check your limits
   - Hackathon accounts typically get: 100 requests/minute
   - 1M tokens per day per model (as mentioned in hackathon info)

### Add to .env:
```
RAINDROP_API_KEY=your_smartinference_api_key
```

### Test SmartInference:

Use the Raindrop dashboard playground:
1. Go to **"SmartInference Playground"**
2. Select **GPT-4o**
3. Enter test prompt:
   ```
   Evaluate this French sentence: "Je suis étudiant."
   Provide CEFR level and grammar notes.
   ```
4. Click **"Run"**
5. You should get a response in ~2-3 seconds

## Step 6: Configure Your Backend .env File

Now create `backend/.env` with all your credentials:

```bash
# Raindrop Platform Configuration
RAINDROP_API_KEY=sk_raindrop_your_api_key_here
RAINDROP_PROJECT_ID=proj_abc123xyz
RAINDROP_SQL_CONNECTION_STRING=postgresql://user:pass@host.raindrop.cloud:5432/coachtcf

# SmartBuckets Configuration
RAINDROP_BUCKET_NAME=coach-tcf-audio
RAINDROP_BUCKET_ACCESS_KEY=your_bucket_access_key
RAINDROP_BUCKET_SECRET_KEY=your_bucket_secret_key
RAINDROP_BUCKET_ENDPOINT=https://storage.raindrop.cloud

# Authentication
JWT_SECRET=your_super_secret_random_string_here_min_32_chars

# Server Configuration
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

## Step 7: Verify All Services

In the Raindrop dashboard, you should see:
- ✅ SmartSQL: `coachtcf` database (running)
- ✅ SmartBuckets: `coach-tcf-audio` bucket (active)
- ✅ SmartInference: API key active

## Troubleshooting

### Issue: Can't connect to SmartSQL
- Verify connection string format
- Check if database is "Running" status in dashboard
- Ensure no firewall blocking port 5432

### Issue: SmartBuckets upload fails
- Verify bucket name matches exactly (lowercase)
- Check access keys are correct
- Ensure bucket is set to "Private" with backend credentials

### Issue: SmartInference API errors
- Check API key is active
- Verify you haven't exceeded rate limits
- Ensure model name is correct: "gpt-4o" (not "gpt-4o-mini")

## Next Steps

Once Raindrop is configured:
1. ✅ Run the database schema SQL (see `docs/SETUP.md`)
2. ✅ Start the backend server
3. ✅ Test API endpoints
4. ✅ Start building!

## Support

- Raindrop Documentation: [docs.raindrop.ai]
- Hackathon Discord: #ai-champion-ship channel
- Office Hours: Check hackathon schedule

## Cost Tracking

Monitor your credit usage in the Raindrop dashboard:
- **SmartSQL**: ~$0.10/hour for small instance
- **SmartBuckets**: ~$0.02/GB storage + transfer
- **SmartInference**: ~$0.01/1K tokens (GPT-4o)

Your $500 credit should be more than enough for development and demo!

