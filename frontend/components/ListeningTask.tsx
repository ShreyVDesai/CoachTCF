/**
 * Listening Task Component
 * Multiple choice question with audio
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ListeningTaskProps {
  question: {
    audioText: string;
    question: string;
    options: string[];
    correctAnswer: string;
  };
  onComplete: (answer: string) => void;
}

export default function ListeningTask({ question, onComplete }: ListeningTaskProps) {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const playAudio = () => {
    setIsPlaying(true);
    
    // Use Web Speech API for text-to-speech
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(question.audioText);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      
      utterance.onend = () => setIsPlaying(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback: just show the text
      alert('Audio playback not supported. Text: ' + question.audioText);
      setIsPlaying(false);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswer) {
      onComplete(selectedAnswer);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>🎧 Listening Comprehension</CardTitle>
        <CardDescription>
          Listen to the audio and answer the question
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Audio Player */}
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <Button
            onClick={playAudio}
            disabled={isPlaying}
            size="lg"
            className="mb-2"
          >
            {isPlaying ? '🔊 Playing...' : '▶️ Play Audio'}
          </Button>
          <p className="text-sm text-gray-600">
            Click to listen to the French audio
          </p>
        </div>

        {/* Question */}
        <div>
          <Label className="text-lg font-semibold mb-3 block">
            {question.question}
          </Label>
          
          <div className="space-y-2">
            {question.options.map((option) => {
              const letter = option.charAt(0);
              return (
                <div
                  key={option}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedAnswer === letter
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedAnswer(letter)}
                >
                  <label className="cursor-pointer flex items-center">
                    <input
                      type="radio"
                      name="listening-answer"
                      value={letter}
                      checked={selectedAnswer === letter}
                      onChange={(e) => setSelectedAnswer(e.target.value)}
                      className="mr-3"
                    />
                    <span>{option}</span>
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className="w-full"
          size="lg"
        >
          Continue to Speaking →
        </Button>
      </CardContent>
    </Card>
  );
}

