/**
 * Results Page
 * Displays session evaluation results
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { session } from '@/lib/api';
import ResultsCard from '@/components/ResultsCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && sessionId) {
      loadResults();
    }
  }, [user, authLoading, sessionId]);

  const loadResults = async () => {
    if (!sessionId) {
      setError('No session ID provided');
      setIsLoading(false);
      return;
    }

    try {
      const response = await session.get(parseInt(sessionId, 10));
      
      if (response.success && response.result) {
        setResults(response.result);
      } else {
        setError('Failed to load results');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load results');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
          <p className="text-gray-600 mb-4">This session hasn't been evaluated yet.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">CoachTCF</h1>
            <Link href="/dashboard">
              <Button variant="outline">View All Progress</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Results Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Session Complete! 🎉</h2>
          <p className="text-gray-600">Here's your performance evaluation</p>
        </div>

        <ResultsCard
          results={{
            cefrLevel: results.cefr_level,
            listeningScore: 100, // Mock - would need to be calculated
            lexicalScore: results.lexical_score,
            grammarScore: results.grammar_score,
            pronunciationNotes: results.pronunciation_notes,
            todayCorrection: results.today_correction,
            detailedFeedback: results.raw_ai_response?.detailedFeedback || undefined,
          }}
        />

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              📊 View Progress
            </Button>
          </Link>
          <Link href="/session">
            <Button size="lg">
              ➡️ Tomorrow's Session
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

