/**
 * Results Card Component
 * Displays session evaluation results
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ResultsCardProps {
  results: {
    cefrLevel: string;
    listeningScore: number;
    lexicalScore: number;
    grammarScore: number;
    pronunciationNotes: string;
    todayCorrection: string;
    detailedFeedback?: {
      strengths?: string[];
      improvements?: string[];
    };
  };
}

export default function ResultsCard({ results }: ResultsCardProps) {
  const getCEFRColor = (level: string) => {
    switch (level) {
      case 'A1': return 'bg-gray-500';
      case 'A2': return 'bg-blue-500';
      case 'B1': return 'bg-green-500';
      case 'B2': return 'bg-yellow-500';
      case 'C1': return 'bg-purple-500';
      case 'C2': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  return (
    <div className="space-y-6">
      {/* CEFR Level */}
      <Card>
        <CardHeader>
          <CardTitle>Your CEFR Level</CardTitle>
          <CardDescription>Current French proficiency level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <Badge className={`text-3xl px-8 py-4 ${getCEFRColor(results.cefrLevel)}`}>
              {results.cefrLevel}
            </Badge>
            <p className="text-sm text-gray-500 mt-4">
              {results.cefrLevel === 'A1' && 'Beginner'}
              {results.cefrLevel === 'A2' && 'Elementary'}
              {results.cefrLevel === 'B1' && 'Intermediate'}
              {results.cefrLevel === 'B2' && 'Upper Intermediate'}
              {results.cefrLevel === 'C1' && 'Advanced'}
              {results.cefrLevel === 'C2' && 'Proficient'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Scores */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Scores</CardTitle>
          <CardDescription>Your scores for today's session</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Listening Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">🎧 Listening</span>
              <span className={`font-bold ${getScoreColor(results.listeningScore)}`}>
                {results.listeningScore}/100
              </span>
            </div>
            <Progress value={results.listeningScore} className="h-2" />
          </div>

          {/* Lexical Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">📚 Vocabulary</span>
              <span className={`font-bold ${getScoreColor(results.lexicalScore)}`}>
                {results.lexicalScore}/100
              </span>
            </div>
            <Progress value={results.lexicalScore} className="h-2" />
          </div>

          {/* Grammar Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">📝 Grammar</span>
              <span className={`font-bold ${getScoreColor(results.grammarScore)}`}>
                {results.grammarScore}/100
              </span>
            </div>
            <Progress value={results.grammarScore} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Pronunciation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>🎤 Pronunciation Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{results.pronunciationNotes}</p>
        </CardContent>
      </Card>

      {/* Today's Correction */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle>🎯 Focus for Tomorrow</CardTitle>
          <CardDescription>One specific thing to improve</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium text-blue-900">{results.todayCorrection}</p>
        </CardContent>
      </Card>

      {/* Detailed Feedback */}
      {results.detailedFeedback && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.detailedFeedback.strengths && results.detailedFeedback.strengths.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ Strengths:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {results.detailedFeedback.strengths.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {results.detailedFeedback.improvements && results.detailedFeedback.improvements.length > 0 && (
              <div>
                <h4 className="font-semibold text-orange-700 mb-2">📈 Areas to Improve:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {results.detailedFeedback.improvements.map((item, index) => (
                    <li key={index} className="text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

