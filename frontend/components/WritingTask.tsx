/**
 * Writing Task Component
 * Text input with word count
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface WritingTaskProps {
  prompt: string;
  onComplete: (text: string) => void;
}

export default function WritingTask({ prompt, onComplete }: WritingTaskProps) {
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const minWords = 50;
  const maxWords = 80;
  const isValidLength = wordCount >= minWords && wordCount <= maxWords;

  const handleSubmit = async () => {
    if (!isValidLength) return;
    
    setIsSubmitting(true);
    onComplete(text);
  };

  const getWordCountColor = () => {
    if (wordCount < minWords) return 'text-red-600';
    if (wordCount > maxWords) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>✍️ Writing Task</CardTitle>
        <CardDescription>
          Write 50-80 words in French
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 p-6 rounded-lg">
          <Label className="font-semibold mb-2 block">Prompt:</Label>
          <p className="text-gray-700">{prompt}</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="writing-text">Your Response:</Label>
            <span className={`text-sm font-mono font-semibold ${getWordCountColor()}`}>
              {wordCount} / {minWords}-{maxWords} words
            </span>
          </div>
          
          <Textarea
            id="writing-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écrivez votre réponse ici..."
            rows={10}
            className="font-mono"
          />
          
          <div className="text-xs text-gray-500">
            {wordCount < minWords && (
              <p>Need {minWords - wordCount} more words (minimum {minWords})</p>
            )}
            {wordCount > maxWords && (
              <p className="text-orange-600">
                Too many words! Please remove {wordCount - maxWords} words (maximum {maxWords})
              </p>
            )}
            {isValidLength && (
              <p className="text-green-600">✓ Perfect length!</p>
            )}
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!isValidLength || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? 'Submitting for AI Evaluation...' : 'Submit Session'}
        </Button>

        {!isValidLength && (
          <p className="text-sm text-center text-gray-500">
            💡 Make sure your response is between {minWords}-{maxWords} words
          </p>
        )}
      </CardContent>
    </Card>
  );
}

