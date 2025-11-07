-- CoachTCF Database Schema
-- Run this in Raindrop SmartSQL Console after setting up your database

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Daily sessions table
CREATE TABLE IF NOT EXISTS daily_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS daily_results (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES daily_sessions(id) ON DELETE CASCADE,
  cefr_level VARCHAR(10),
  pronunciation_notes TEXT,
  lexical_score INTEGER CHECK (lexical_score >= 0 AND lexical_score <= 100),
  grammar_score INTEGER CHECK (grammar_score >= 0 AND grammar_score <= 100),
  today_correction TEXT,
  raw_ai_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON daily_sessions(user_id, session_date DESC);
CREATE INDEX IF NOT EXISTS idx_results_session ON daily_results(session_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verify tables were created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

