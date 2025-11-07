/**
 * Database utility functions for PostgreSQL via Raindrop SmartSQL
 */

import pg from 'pg';
const { Pool } = pg;

let pool = null;

/**
 * Initialize database connection pool
 */
export function initDatabase() {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.RAINDROP_SQL_CONNECTION_STRING;
  
  if (!connectionString) {
    throw new Error('RAINDROP_SQL_CONNECTION_STRING is not defined in environment variables');
  }

  pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
  });

  console.log('✅ Database connection pool initialized');
  return pool;
}

/**
 * Get database pool instance
 */
export function getPool() {
  if (!pool) {
    return initDatabase();
  }
  return pool;
}

/**
 * Execute a query
 */
export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Query executed', { text, duration: `${duration}ms`, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error);
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection() {
  try {
    const result = await query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Database connection successful');
    console.log('   Time:', result.rows[0].current_time);
    console.log('   Version:', result.rows[0].version.split(',')[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Close database pool (for graceful shutdown)
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('✅ Database connection pool closed');
  }
}

// User queries
export const userQueries = {
  /**
   * Create a new user
   */
  async createUser(email, passwordHash, name) {
    const text = `
      INSERT INTO users (email, password_hash, name)
      VALUES ($1, $2, $3)
      RETURNING id, email, name, created_at
    `;
    const result = await query(text, [email, passwordHash, name]);
    return result.rows[0];
  },

  /**
   * Find user by email
   */
  async findByEmail(email) {
    const text = 'SELECT * FROM users WHERE email = $1';
    const result = await query(text, [email]);
    return result.rows[0];
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const text = 'SELECT id, email, name, created_at FROM users WHERE id = $1';
    const result = await query(text, [id]);
    return result.rows[0];
  },
};

// Session queries
export const sessionQueries = {
  /**
   * Create a new session
   */
  async createSession(userId, sessionDate, listeningQuestion, writingPrompt) {
    const text = `
      INSERT INTO daily_sessions 
      (user_id, session_date, listening_question, writing_prompt, status)
      VALUES ($1, $2, $3, $4, 'in_progress')
      RETURNING *
    `;
    const result = await query(text, [userId, sessionDate, JSON.stringify(listeningQuestion), writingPrompt]);
    return result.rows[0];
  },

  /**
   * Get session by ID
   */
  async getSessionById(sessionId) {
    const text = 'SELECT * FROM daily_sessions WHERE id = $1';
    const result = await query(text, [sessionId]);
    return result.rows[0];
  },

  /**
   * Get today's session for user
   */
  async getTodaySession(userId, date) {
    const text = `
      SELECT * FROM daily_sessions 
      WHERE user_id = $1 AND session_date = $2
    `;
    const result = await query(text, [userId, date]);
    return result.rows[0];
  },

  /**
   * Update session with user answers
   */
  async updateSession(sessionId, listeningAnswer, speechAudioUrl, writingText) {
    const text = `
      UPDATE daily_sessions 
      SET listening_answer = $2, speech_audio_url = $3, writing_text = $4, status = 'completed'
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(text, [sessionId, listeningAnswer, speechAudioUrl, writingText]);
    return result.rows[0];
  },

  /**
   * Get user's sessions with pagination
   */
  async getUserSessions(userId, limit = 30) {
    const text = `
      SELECT s.*, r.cefr_level, r.lexical_score, r.grammar_score, r.today_correction
      FROM daily_sessions s
      LEFT JOIN daily_results r ON s.id = r.session_id
      WHERE s.user_id = $1
      ORDER BY s.session_date DESC
      LIMIT $2
    `;
    const result = await query(text, [userId, limit]);
    return result.rows;
  },
};

// Result queries
export const resultQueries = {
  /**
   * Create a new result
   */
  async createResult(sessionId, cefrLevel, pronunciationNotes, lexicalScore, grammarScore, todayCorrection, rawResponse) {
    const text = `
      INSERT INTO daily_results 
      (session_id, cefr_level, pronunciation_notes, lexical_score, grammar_score, today_correction, raw_ai_response)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await query(text, [
      sessionId,
      cefrLevel,
      pronunciationNotes,
      lexicalScore,
      grammarScore,
      todayCorrection,
      JSON.stringify(rawResponse),
    ]);
    return result.rows[0];
  },

  /**
   * Get result by session ID
   */
  async getResultBySessionId(sessionId) {
    const text = 'SELECT * FROM daily_results WHERE session_id = $1';
    const result = await query(text, [sessionId]);
    return result.rows[0];
  },
};

export default {
  initDatabase,
  getPool,
  query,
  testConnection,
  closeDatabase,
  userQueries,
  sessionQueries,
  resultQueries,
};

