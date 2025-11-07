/**
 * CoachTCF Backend Server
 * Express API with Raindrop Platform integration
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase, testConnection, closeDatabase } from './utils/database.js';
import { initRaindrop, createOpenAIFallback } from './config/raindrop.js';
import authRoutes from './routes/auth.js';
import sessionRoutes, { setRaindropClients } from './routes/session.js';
import progressRoutes from './routes/progress.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for audio files
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CoachTCF API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/**
 * Initialize services and start server
 */
async function startServer() {
  try {
    console.log('🚀 Starting CoachTCF Backend...\n');

    // Check environment variables
    console.log('📋 Checking environment variables...');
    const requiredEnvVars = ['JWT_SECRET', 'RAINDROP_SQL_CONNECTION_STRING'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ Missing required environment variables:', missingVars.join(', '));
      console.log('\n💡 Please create backend/.env file with required variables.');
      console.log('   See backend/.env.example for reference.\n');
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.warn('⚠️  Continuing in development mode with limited functionality\n');
      }
    } else {
      console.log('✅ All required environment variables set\n');
    }

    // Initialize database
    console.log('📊 Initializing database connection...');
    initDatabase();
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Database connection failed!');
      console.log('💡 Please check your RAINDROP_SQL_CONNECTION_STRING');
      console.log('   and ensure Raindrop SmartSQL is configured.\n');
      
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      } else {
        console.warn('⚠️  Continuing without database (API will fail)\n');
      }
    } else {
      console.log('');
    }

    // Initialize Raindrop clients
    console.log('☁️  Initializing Raindrop Platform...');
    let raindropClients;
    
    try {
      if (process.env.RAINDROP_API_KEY) {
        raindropClients = initRaindrop();
      } else if (process.env.OPENAI_API_KEY) {
        raindropClients = createOpenAIFallback();
      } else {
        console.warn('⚠️  No AI API key found (RAINDROP_API_KEY or OPENAI_API_KEY)');
        console.log('   AI features will not work!\n');
        
        // Create dummy clients for development
        raindropClients = {
          smartInference: {
            chat: async () => {
              throw new Error('No AI API key configured');
            },
          },
          smartBuckets: {
            upload: async () => 'mock-url',
            getSignedUrl: () => 'mock-url',
          },
        };
      }
      
      setRaindropClients(raindropClients);
      console.log('');
    } catch (error) {
      console.error('❌ Failed to initialize Raindrop:', error.message);
      console.log('');
    }

    // Start server
    app.listen(PORT, () => {
      console.log('✅ Server started successfully!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🎯 CoachTCF API Server`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('📝 API Endpoints:');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   POST /api/session/start');
      console.log('   POST /api/session/submit');
      console.log('   GET  /api/progress/:userId');
      console.log('\n💡 Press Ctrl+C to stop the server\n');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n\n⏹️  Shutting down gracefully...');
  
  await closeDatabase();
  
  console.log('✅ Server stopped\n');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\n⏹️  Shutting down gracefully...');
  
  await closeDatabase();
  
  console.log('✅ Server stopped\n');
  process.exit(0);
});

// Start the server
startServer();

