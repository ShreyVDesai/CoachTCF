/**
 * Session routes
 * Handles daily session creation and submission
 */

import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { sessionQueries, resultQueries } from '../utils/database.js';
import { generateDailyContent } from '../services/contentGenerator.js';
import { evaluateSession, transcribeSpeech, validateWritingLength } from '../services/aiService.js';
import { uploadAudio, validateAudioData, mockUploadAudio } from '../services/storageService.js';

const router = express.Router();

// Inject raindrop clients via middleware (set in main app)
let raindropClients = null;

export function setRaindropClients(clients) {
  raindropClients = clients;
}

/**
 * POST /api/session/start
 * Generate and start a new daily session
 */
router.post('/start', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { date } = req.body;

    // Use provided date or today
    const sessionDate = date || new Date().toISOString().split('T')[0];

    // Check if session already exists for today
    const existingSession = await sessionQueries.getTodaySession(userId, sessionDate);
    
    if (existingSession) {
      const listeningQuestion = JSON.parse(existingSession.listening_question);
      
      return res.status(200).json({
        success: true,
        sessionId: existingSession.id,
        listeningQuestion,
        writingPrompt: existingSession.writing_prompt,
        message: 'Continuing existing session for today',
      });
    }

    // Generate new content
    const { listeningQuestion, writingPrompt } = await generateDailyContent(
      raindropClients.smartInference
    );

    // Create session in database
    const session = await sessionQueries.createSession(
      userId,
      sessionDate,
      listeningQuestion,
      writingPrompt
    );

    res.status(200).json({
      success: true,
      sessionId: session.id,
      listeningQuestion,
      writingPrompt,
    });

    console.log('✅ Session started:', session.id);
  } catch (error) {
    console.error('❌ Error starting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start session. Please try again.',
    });
  }
});

/**
 * POST /api/session/submit
 * Submit completed session for evaluation
 */
router.post('/submit', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { sessionId, listeningAnswer, speechAudioBase64, writingText } = req.body;

    // Validation
    if (!sessionId || !listeningAnswer || !speechAudioBase64 || !writingText) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: sessionId, listeningAnswer, speechAudioBase64, writingText',
      });
    }

    // Get session
    const session = await sessionQueries.getSessionById(sessionId);
    
    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    // Verify ownership
    if (session.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    // Check if already completed
    if (session.status === 'completed') {
      const existingResult = await resultQueries.getResultBySessionId(sessionId);
      return res.status(200).json({
        success: true,
        message: 'Session already completed',
        resultId: existingResult?.id,
        results: existingResult,
      });
    }

    // Validate writing length
    const writingValidation = validateWritingLength(writingText, 50, 80);
    if (!writingValidation.valid) {
      return res.status(400).json({
        success: false,
        error: `Writing text must be between 50-80 words. You wrote ${writingValidation.wordCount} words.`,
      });
    }

    // Validate audio
    const audioValidation = validateAudioData(speechAudioBase64);
    if (!audioValidation.valid) {
      return res.status(400).json({
        success: false,
        error: audioValidation.error,
      });
    }

    // Upload audio to SmartBuckets
    let audioUrl;
    try {
      audioUrl = await uploadAudio(
        raindropClients.smartBuckets,
        speechAudioBase64,
        userId,
        sessionId
      );
    } catch (uploadError) {
      console.warn('⚠️  Audio upload failed, using mock URL');
      audioUrl = mockUploadAudio(userId, sessionId);
    }

    // Transcribe speech (mock for now)
    const speechTranscript = await transcribeSpeech(
      raindropClients.smartInference,
      audioUrl
    );

    // Get listening question to check answer
    const listeningQuestion = JSON.parse(session.listening_question);

    // Evaluate session with AI
    const evaluation = await evaluateSession(raindropClients.smartInference, {
      listeningQuestion,
      listeningAnswer,
      listeningCorrectAnswer: listeningQuestion.correctAnswer,
      writingText,
      writingPrompt: session.writing_prompt,
      speechTranscript,
    });

    // Update session
    await sessionQueries.updateSession(
      sessionId,
      listeningAnswer,
      audioUrl,
      writingText
    );

    // Save results
    const result = await resultQueries.createResult(
      sessionId,
      evaluation.cefrLevel,
      evaluation.pronunciationNotes || 'No pronunciation notes available',
      evaluation.lexicalScore,
      evaluation.grammarScore,
      evaluation.todayCorrection,
      evaluation.rawResponse
    );

    res.status(200).json({
      success: true,
      resultId: result.id,
      results: {
        cefrLevel: evaluation.cefrLevel,
        listeningScore: evaluation.listeningScore,
        lexicalScore: evaluation.lexicalScore,
        grammarScore: evaluation.grammarScore,
        pronunciationNotes: evaluation.pronunciationNotes,
        todayCorrection: evaluation.todayCorrection,
        detailedFeedback: evaluation.detailedFeedback,
      },
    });

    console.log('✅ Session submitted and evaluated:', sessionId);
  } catch (error) {
    console.error('❌ Error submitting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit session. Please try again.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

/**
 * GET /api/session/:sessionId
 * Get session details
 */
router.get('/:sessionId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const sessionId = parseInt(req.params.sessionId, 10);

    const session = await sessionQueries.getSessionById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied',
      });
    }

    const result = await resultQueries.getResultBySessionId(sessionId);

    res.status(200).json({
      success: true,
      session: {
        ...session,
        listening_question: JSON.parse(session.listening_question),
      },
      result,
    });
  } catch (error) {
    console.error('❌ Error getting session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get session',
    });
  }
});

export default router;

