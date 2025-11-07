/**
 * Progress routes
 * Retrieve user progress and statistics
 */

import express from 'express';
import { authenticateToken, authorizeUser } from '../middleware/auth.js';
import { sessionQueries } from '../utils/database.js';

const router = express.Router();

/**
 * GET /api/progress/:userId
 * Get user's progress data
 */
router.get('/:userId', authenticateToken, authorizeUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const days = parseInt(req.query.days, 10) || 30;

    // Get user's sessions with results
    const sessions = await sessionQueries.getUserSessions(userId, days);

    // Calculate statistics
    const completedSessions = sessions.filter(s => s.status === 'completed');
    const totalSessions = completedSessions.length;

    // Calculate current streak
    let currentStreak = 0;
    if (sessions.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (let i = 0; i < sessions.length; i++) {
        const sessionDate = new Date(sessions[i].session_date);
        sessionDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - sessionDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === i && sessions[i].status === 'completed') {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate average CEFR level
    const cefrLevels = completedSessions
      .filter(s => s.cefr_level)
      .map(s => s.cefr_level);
    
    const averageCEFR = cefrLevels.length > 0
      ? mostCommon(cefrLevels)
      : 'N/A';

    // Format sessions for response
    const formattedSessions = completedSessions.map(s => ({
      date: s.session_date,
      cefrLevel: s.cefr_level,
      listeningScore: s.listening_answer ? (
        s.listening_answer === JSON.parse(s.listening_question).correctAnswer ? 100 : 0
      ) : null,
      lexicalScore: s.lexical_score,
      grammarScore: s.grammar_score,
      todayCorrection: s.today_correction,
    }));

    // Prepare chart data
    const progressChart = {
      dates: formattedSessions.map(s => s.date).reverse(),
      lexicalScores: formattedSessions.map(s => s.lexicalScore).reverse(),
      grammarScores: formattedSessions.map(s => s.grammarScore).reverse(),
      cefrLevels: formattedSessions.map(s => s.cefrLevel).reverse(),
    };

    res.status(200).json({
      success: true,
      userId,
      totalSessions,
      currentStreak,
      averageCEFR,
      sessions: formattedSessions,
      progressChart,
    });

    console.log('✅ Progress retrieved for user:', userId);
  } catch (error) {
    console.error('❌ Error getting progress:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve progress',
    });
  }
});

/**
 * GET /api/progress/:userId/summary
 * Get quick summary statistics
 */
router.get('/:userId/summary', authenticateToken, authorizeUser, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);

    const sessions = await sessionQueries.getUserSessions(userId, 30);
    const completedSessions = sessions.filter(s => s.status === 'completed');

    // Calculate averages
    const avgLexical = completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.lexical_score || 0), 0) /
          completedSessions.length
        )
      : 0;

    const avgGrammar = completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((sum, s) => sum + (s.grammar_score || 0), 0) /
          completedSessions.length
        )
      : 0;

    const latestCEFR = completedSessions.length > 0
      ? completedSessions[0].cefr_level
      : 'N/A';

    res.status(200).json({
      success: true,
      summary: {
        totalSessions: completedSessions.length,
        averageLexicalScore: avgLexical,
        averageGrammarScore: avgGrammar,
        currentCEFRLevel: latestCEFR,
      },
    });
  } catch (error) {
    console.error('❌ Error getting summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve summary',
    });
  }
});

/**
 * Helper: Find most common element in array
 */
function mostCommon(arr) {
  const counts = {};
  let maxCount = 0;
  let mostCommonItem = arr[0];

  for (const item of arr) {
    counts[item] = (counts[item] || 0) + 1;
    if (counts[item] > maxCount) {
      maxCount = counts[item];
      mostCommonItem = item;
    }
  }

  return mostCommonItem;
}

export default router;

