/**
 * AI Evaluation Service
 * Uses GPT-4o to evaluate user responses (listening, speaking, writing)
 */

/**
 * Evaluate user's complete session
 * @param {Object} smartInference - SmartInference client
 * @param {Object} sessionData - User's answers
 * @returns {Object} Evaluation results
 */
export async function evaluateSession(smartInference, sessionData) {
  const {
    listeningQuestion,
    listeningAnswer,
    listeningCorrectAnswer,
    writingText,
    writingPrompt,
    speechTranscript, // We'll get this from audio processing
  } = sessionData;

  console.log('🤖 Starting AI evaluation...');

  try {
    // Check listening answer
    const listeningScore = listeningAnswer === listeningCorrectAnswer ? 100 : 0;

    // Evaluate writing and speaking together
    const evaluationPrompt = `You are an expert TCF French examiner. Evaluate this French learner's performance.

**WRITING PROMPT:** ${writingPrompt}

**LEARNER'S WRITTEN RESPONSE:**
${writingText}

${speechTranscript ? `**SPEAKING TRANSCRIPTION:**\n${speechTranscript}\n` : ''}

Provide a comprehensive evaluation in JSON format with:
1. CEFR level (A1, A2, B1, B2, or C1)
2. Lexical score (0-100): vocabulary richness and appropriateness
3. Grammar score (0-100): grammatical accuracy and complexity
4. Pronunciation notes (if speaking provided): specific phoneme or prosody issues
5. One specific correction or drill for tomorrow: ONE concrete thing to improve

Return ONLY valid JSON:
{
  "cefrLevel": "B1",
  "lexicalScore": 75,
  "grammarScore": 85,
  "pronunciationNotes": "Good pronunciation overall. Focus on...",
  "todayCorrection": "One specific actionable improvement...",
  "detailedFeedback": {
    "strengths": ["strength1", "strength2"],
    "improvements": ["area1", "area2"]
  }
}`;

    const response = await smartInference.chat({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a professional TCF French examiner with 10+ years of experience. Provide accurate, constructive feedback that helps learners improve.',
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      temperature: 0.3, // Lower for consistent evaluation
      maxTokens: 1000,
    });

    const content = response.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI evaluation response');
    }

    const evaluation = JSON.parse(jsonMatch[0]);

    // Add listening score
    evaluation.listeningScore = listeningScore;

    // Validate structure
    if (!evaluation.cefrLevel || 
        typeof evaluation.lexicalScore !== 'number' ||
        typeof evaluation.grammarScore !== 'number') {
      throw new Error('Invalid evaluation structure from AI');
    }

    console.log('✅ AI evaluation complete:', evaluation.cefrLevel);
    
    return {
      ...evaluation,
      rawResponse: response,
    };

  } catch (error) {
    console.error('❌ Error in AI evaluation:', error);
    
    // Fallback evaluation
    return {
      cefrLevel: 'B1',
      listeningScore: listeningAnswer === listeningCorrectAnswer ? 100 : 0,
      lexicalScore: 70,
      grammarScore: 75,
      pronunciationNotes: 'Unable to evaluate pronunciation at this time. Please try again.',
      todayCorrection: 'Continue practicing daily to see improvement in your French skills.',
      detailedFeedback: {
        strengths: ['Your effort is appreciated!'],
        improvements: ['Keep practicing regularly'],
      },
      rawResponse: { error: error.message },
    };
  }
}

/**
 * Simple transcription of speech (mock for now)
 * In production, use Whisper API or similar
 */
export async function transcribeSpeech(smartInference, audioUrl) {
  console.log('🎤 Transcribing speech...');
  
  try {
    // For hackathon demo, we'll use a mock transcription
    // In production, you'd use Whisper API through SmartInference or OpenAI
    
    // Mock transcription for now
    const mockTranscript = "Je me réveille à sept heures chaque matin. Ensuite, je me lève et je prends ma douche. Après, je prends mon petit-déjeuner avec du café et des croissants.";
    
    console.log('✅ Speech transcribed (mock)');
    return mockTranscript;
    
  } catch (error) {
    console.error('❌ Error transcribing speech:', error);
    return null;
  }
}

/**
 * Calculate word count
 */
export function countWords(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Validate writing text length
 */
export function validateWritingLength(text, min = 50, max = 80) {
  const wordCount = countWords(text);
  return {
    valid: wordCount >= min && wordCount <= max,
    wordCount,
    min,
    max,
  };
}

export default {
  evaluateSession,
  transcribeSpeech,
  countWords,
  validateWritingLength,
};

