/**
 * Content Generation Service
 * Generates daily listening questions and writing prompts using AI
 */

/**
 * Generate daily listening comprehension question
 */
export async function generateListeningQuestion(smartInference) {
  const prompt = `Generate a TCF French listening comprehension question for CEFR level B1-B2.

Requirements:
1. Create a short French audio transcript (2-3 sentences, 30-50 words)
2. Make it about everyday topics: travel, work, family, hobbies, daily routines
3. Create ONE multiple-choice question in French about the text
4. Provide 4 answer options (A, B, C, D) in French
5. Mark the correct answer

Return ONLY valid JSON in this exact format:
{
  "audioText": "the French text to be read aloud",
  "question": "question in French",
  "options": ["A. option1", "B. option2", "C. option3", "D. option4"],
  "correctAnswer": "B"
}

Make it natural, conversational French that would appear on the TCF exam.`;

  try {
    const response = await smartInference.chat({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a TCF French exam question generator. Generate realistic, appropriate questions for French learners.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8, // Higher for variety
      maxTokens: 500,
    });

    const content = response.choices[0].message.content;
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const question = JSON.parse(jsonMatch[0]);
    
    // Validate structure
    if (!question.audioText || !question.question || !question.options || !question.correctAnswer) {
      throw new Error('Invalid question structure from AI');
    }

    console.log('✅ Generated listening question');
    return question;
  } catch (error) {
    console.error('❌ Error generating listening question:', error);
    
    // Fallback question
    return {
      audioText: "Bonjour, je m'appelle Marie. J'habite à Paris depuis cinq ans. Je travaille comme professeur de français pour les étrangers. J'aime beaucoup mon métier parce que je rencontre des personnes du monde entier.",
      question: "Où habite Marie?",
      options: [
        "A. À Lyon",
        "B. À Paris",
        "C. À Marseille",
        "D. À Nice",
      ],
      correctAnswer: "B",
    };
  }
}

/**
 * Generate daily writing prompt
 */
export async function generateWritingPrompt(smartInference) {
  const prompt = `Generate a TCF French writing prompt for CEFR level B1-B2.

Requirements:
1. Ask the learner to write 50-80 words in French
2. Topic should be everyday: daily routine, travel, work, hobbies, description
3. Specify use of specific grammar structures (e.g., "use pronominal verbs" or "use past tense")
4. Make it similar to real TCF exam prompts

Return ONLY the prompt text in French, nothing else.`;

  try {
    const response = await smartInference.chat({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a TCF French exam question generator. Generate realistic writing prompts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      maxTokens: 200,
    });

    const writingPrompt = response.choices[0].message.content.trim();
    console.log('✅ Generated writing prompt');
    return writingPrompt;
  } catch (error) {
    console.error('❌ Error generating writing prompt:', error);
    
    // Fallback prompt
    return "Décrivez votre routine matinale en 50-80 mots. Utilisez le présent et au moins deux verbes pronominaux (par exemple: se réveiller, se lever, se doucher, etc.).";
  }
}

/**
 * Generate both listening and writing content for a session
 */
export async function generateDailyContent(smartInference) {
  console.log('🎲 Generating daily content...');
  
  const [listeningQuestion, writingPrompt] = await Promise.all([
    generateListeningQuestion(smartInference),
    generateWritingPrompt(smartInference),
  ]);

  return {
    listeningQuestion,
    writingPrompt,
  };
}

export default {
  generateListeningQuestion,
  generateWritingPrompt,
  generateDailyContent,
};

