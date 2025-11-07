/**
 * Daily Session Page
 * Orchestrates listening, speaking, and writing tasks
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { session as sessionApi } from '@/lib/api';
import ListeningTask from '@/components/ListeningTask';
import SpeakingTask from '@/components/SpeakingTask';
import WritingTask from '@/components/WritingTask';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

type TaskType = 'loading' | 'listening' | 'speaking' | 'writing' | 'submitting';

export default function SessionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  const [currentTask, setCurrentTask] = useState<TaskType>('loading');
  const [sessionData, setSessionData] = useState<any>(null);
  const [answers, setAnswers] = useState({
    listeningAnswer: '',
    speechAudioBase64: '',
    writingText: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && !sessionData) {
      startSession();
    }
  }, [user, authLoading]);

  const startSession = async () => {
    try {
      setError('');
      const response = await sessionApi.start();
      
      if (response.success) {
        setSessionData(response);
        setCurrentTask('listening');
      } else {
        setError(response.error || 'Failed to start session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start session');
    }
  };

  const handleListeningComplete = (answer: string) => {
    setAnswers({ ...answers, listeningAnswer: answer });
    setCurrentTask('speaking');
  };

  const handleSpeakingComplete = (audioBase64: string) => {
    setAnswers({ ...answers, speechAudioBase64: audioBase64 });
    setCurrentTask('writing');
  };

  const handleWritingComplete = async (text: string) => {
    setAnswers({ ...answers, writingText: text });
    setCurrentTask('submitting');

    try {
      const response = await sessionApi.submit(sessionData.sessionId, {
        listeningAnswer: answers.listeningAnswer,
        speechAudioBase64: answers.speechAudioBase64,
        writingText: text,
      });

      if (response.success) {
        // Navigate to results with the result data
        router.push(`/results?resultId=${response.resultId}&sessionId=${sessionData.sessionId}`);
      } else {
        setError(response.error || 'Failed to submit session');
        setCurrentTask('writing');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit session');
      setCurrentTask('writing');
    }
  };

  const getProgress = () => {
    switch (currentTask) {
      case 'loading': return 0;
      case 'listening': return 33;
      case 'speaking': return 66;
      case 'writing': return 90;
      case 'submitting': return 100;
      default: return 0;
    }
  };

  const getTaskNumber = () => {
    switch (currentTask) {
      case 'listening': return '1';
      case 'speaking': return '2';
      case 'writing': return '3';
      default: return '';
    }
  };

  if (authLoading || currentTask === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your daily session...</p>
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

  if (currentTask === 'submitting') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold mb-2">Evaluating Your Performance...</h2>
          <p className="text-gray-600">Our AI is analyzing your responses</p>
          <p className="text-sm text-gray-500 mt-2">This may take 10-15 seconds</p>
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
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Exit Session
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-600 min-w-[100px]">
              Task {getTaskNumber()} of 3
            </span>
            <Progress value={getProgress()} className="flex-1" />
            <span className="text-sm text-gray-500 min-w-[50px] text-right">
              {getProgress()}%
            </span>
          </div>
        </div>
      </div>

      {/* Task Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {currentTask === 'listening' && sessionData && (
          <ListeningTask
            question={sessionData.listeningQuestion}
            onComplete={handleListeningComplete}
          />
        )}

        {currentTask === 'speaking' && (
          <SpeakingTask onComplete={handleSpeakingComplete} />
        )}

        {currentTask === 'writing' && sessionData && (
          <WritingTask
            prompt={sessionData.writingPrompt}
            onComplete={handleWritingComplete}
          />
        )}
      </div>
    </main>
  );
}

