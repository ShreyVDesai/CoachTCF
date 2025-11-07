# CoachTCF API Documentation

Complete API reference for the CoachTCF backend.

**Base URL**: `http://localhost:3001` (development)

**Authentication**: JWT token in `Authorization` header as `Bearer <token>`

---

## Authentication Endpoints

### POST /api/auth/register

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "Jean Dupont"
}
```

**Validation:**
- `email`: Valid email format, unique
- `password`: Minimum 6 characters
- `name`: Optional, 2-100 characters

**Success Response (201):**
```json
{
  "success": true,
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jean Dupont"
  }
}
```

**Error Responses:**

400 Bad Request - Invalid input
```json
{
  "success": false,
  "error": "Email already exists"
}
```

---

### POST /api/auth/login

Authenticate existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": 1,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "Jean Dupont"
  }
}
```

**Error Responses:**

401 Unauthorized - Invalid credentials
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

---

## Session Endpoints

### POST /api/session/start

Generate a new daily session with AI-generated questions.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date": "2025-11-07"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "sessionId": 42,
  "listeningQuestion": {
    "audioText": "Bonjour, je m'appelle Marie. J'habite à Paris depuis cinq ans...",
    "question": "Où habite Marie?",
    "options": [
      "A. À Lyon",
      "B. À Paris",
      "C. À Marseille",
      "D. À Nice"
    ],
    "correctAnswer": "B"
  },
  "writingPrompt": "Décrivez votre routine matinale en 50-80 mots. Utilisez le présent et au moins deux verbes pronominaux."
}
```

**Notes:**
- One session per user per day (enforced by UNIQUE constraint)
- If session already exists for today, returns existing session
- Questions are AI-generated via SmartInference

**Error Responses:**

401 Unauthorized - Missing or invalid token
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

### POST /api/session/submit

Submit completed session answers for AI evaluation.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "sessionId": 42,
  "listeningAnswer": "B",
  "speechAudioBase64": "data:audio/webm;base64,GkXfo59C...",
  "writingText": "Chaque matin, je me réveille à sept heures. Je me lève tout de suite et je me douche. Ensuite, je prends mon petit-déjeuner..."
}
```

**Field Details:**
- `sessionId`: ID from `/session/start`
- `listeningAnswer`: Selected option (A/B/C/D)
- `speechAudioBase64`: Base64-encoded audio (WebM or MP3)
- `writingText`: User's written response (50-80 words)

**Success Response (200):**
```json
{
  "success": true,
  "resultId": 15,
  "results": {
    "cefrLevel": "B1",
    "listeningScore": 100,
    "pronunciationNotes": "Good overall pronunciation. Focus on the 'r' sound in 'réveille' and 'pronominaux'.",
    "lexicalScore": 75,
    "grammarScore": 85,
    "todayCorrection": "Excellent use of pronominal verbs! To reach B2, try incorporating more time expressions like 'ensuite', 'puis', 'après'.",
    "detailedFeedback": {
      "strengths": [
        "Correct use of reflexive verbs (se réveiller, se lever, se doucher)",
        "Good present tense conjugation",
        "Clear sentence structure"
      ],
      "improvements": [
        "Add more varied vocabulary",
        "Use compound sentences",
        "Include more time markers"
      ]
    }
  }
}
```

**Processing Time:** 5-15 seconds (includes AI evaluation)

**Error Responses:**

400 Bad Request - Invalid input
```json
{
  "success": false,
  "error": "Writing text must be between 50-80 words"
}
```

404 Not Found - Session doesn't exist
```json
{
  "success": false,
  "error": "Session not found"
}
```

---

## Progress Endpoints

### GET /api/progress/:userId

Retrieve user's historical progress data.

**Headers:**
```
Authorization: Bearer <token>
```

**URL Parameters:**
- `userId`: Integer, user's ID

**Query Parameters (optional):**
- `days`: Integer, number of days to retrieve (default: 30)
- `startDate`: ISO date string
- `endDate`: ISO date string

**Example Request:**
```
GET /api/progress/1?days=7
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "userId": 1,
  "totalSessions": 7,
  "currentStreak": 7,
  "averageCEFR": "B1",
  "sessions": [
    {
      "date": "2025-11-07",
      "cefrLevel": "B1",
      "listeningScore": 100,
      "lexicalScore": 75,
      "grammarScore": 85,
      "todayCorrection": "Focus on using more conjunctions..."
    },
    {
      "date": "2025-11-06",
      "cefrLevel": "B1",
      "listeningScore": 75,
      "lexicalScore": 70,
      "grammarScore": 80,
      "todayCorrection": "Great improvement in verb conjugation..."
    }
  ],
  "progressChart": {
    "dates": ["2025-11-01", "2025-11-02", "2025-11-03", ...],
    "lexicalScores": [65, 68, 70, 72, 75, 73, 75],
    "grammarScores": [70, 72, 75, 78, 80, 82, 85],
    "cefrLevels": ["A2", "A2", "B1", "B1", "B1", "B1", "B1"]
  }
}
```

**Error Responses:**

403 Forbidden - Accessing another user's data
```json
{
  "success": false,
  "error": "Access denied"
}
```

---

## Data Models

### User
```typescript
interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  created_at: Date;
}
```

### DailySession
```typescript
interface DailySession {
  id: number;
  user_id: number;
  session_date: Date;
  listening_question: string; // JSON string
  listening_answer: string;
  speech_audio_url: string;
  writing_prompt: string;
  writing_text: string;
  status: 'in_progress' | 'completed';
  created_at: Date;
}
```

### DailyResult
```typescript
interface DailyResult {
  id: number;
  session_id: number;
  cefr_level: string; // A1, A2, B1, B2, C1
  pronunciation_notes: string;
  lexical_score: number; // 0-100
  grammar_score: number; // 0-100
  today_correction: string;
  raw_ai_response: object; // Full GPT response
  created_at: Date;
}
```

---

## Authentication Flow

1. **Register**: `POST /api/auth/register`
   - Server creates user with hashed password
   - Returns JWT token valid for 7 days

2. **Login**: `POST /api/auth/login`
   - Server verifies credentials
   - Returns JWT token

3. **Authenticated Requests**: Include token in header
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. **Token Payload**:
   ```json
   {
     "userId": 1,
     "email": "user@example.com",
     "iat": 1699372800,
     "exp": 1699977600
   }
   ```

---

## Session Workflow

1. **Start Session**: `POST /api/session/start`
   - AI generates listening question + writing prompt
   - Session saved with status: 'in_progress'

2. **User Completes Tasks**:
   - Listens to audio, selects answer
   - Records 2-minute speech
   - Writes 50-80 word response

3. **Submit Session**: `POST /api/session/submit`
   - Audio uploaded to SmartBuckets
   - All data sent to GPT-4o for evaluation
   - Results saved to database
   - Session status: 'completed'

4. **View Progress**: `GET /api/progress/:userId`
   - Retrieve historical data
   - Display charts and trends

---

## Rate Limits

**Development:**
- No rate limits

**Production (recommended):**
- 100 requests/minute per IP
- 1000 requests/hour per user

**SmartInference Limits:**
- 100 requests/minute (Raindrop tier)
- 1M tokens/day

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Auth required |
| 403 | Forbidden - Access denied |
| 404 | Not Found |
| 409 | Conflict - Resource exists |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## Testing with cURL

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

### Start Session
```bash
curl -X POST http://localhost:3001/api/session/start \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"date":"2025-11-07"}'
```

---

## Best Practices

1. **Always include error handling** in client code
2. **Store JWT token** securely (httpOnly cookie or localStorage)
3. **Refresh token** before expiration
4. **Validate input** on client before sending
5. **Handle loading states** (AI evaluation takes time)
6. **Retry logic** for transient failures
7. **Log errors** for debugging

---

## Support

For API issues:
- Check server logs: `backend/` terminal output
- Verify Raindrop services are running
- Test endpoints individually
- Check database connection

For hackathon support:
- Discord: #ai-champion-ship
- Raindrop docs: [provided in starter kit]

