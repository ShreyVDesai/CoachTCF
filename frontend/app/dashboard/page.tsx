/**
 * Dashboard Page
 * Shows progress overview and statistics
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { progress as progressApi } from '@/lib/api';
import ProgressChart from '@/components/ProgressChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, logout } = useAuth();
  
  const [progressData, setProgressData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadProgress();
    }
  }, [user, authLoading]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      const response = await progressApi.get(user.id, 30);
      
      if (response.success) {
        setProgressData(response);
      } else {
        setError(response.error || 'Failed to load progress');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load progress');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
          <Button onClick={loadProgress}>Try Again</Button>
        </div>
      </div>
    );
  }

  const hasCompletedSessions = progressData && progressData.totalSessions > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              CoachTCF
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">
                Hello, <span className="font-semibold">{user?.name || user?.email}</span>
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your French Learning Dashboard</h1>
          <p className="text-gray-600">Track your progress and keep improving</p>
        </div>

        {/* Start Session CTA */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">Ready for today's session?</h2>
                <p className="text-blue-100">Complete your daily 5-6 minute practice</p>
              </div>
              <Link href="/session">
                <Button size="lg" variant="secondary" className="text-lg px-8">
                  Start Session →
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {hasCompletedSessions ? (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardDescription>Current Streak</CardDescription>
                  <CardTitle className="text-4xl">🔥 {progressData.currentStreak}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {progressData.currentStreak === 1 ? 'day' : 'days'} in a row
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Total Sessions</CardDescription>
                  <CardTitle className="text-4xl">📚 {progressData.totalSessions}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Completed sessions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Current Level</CardDescription>
                  <CardTitle>
                    <Badge className="text-2xl px-6 py-3 bg-green-500">
                      {progressData.averageCEFR}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    CEFR level
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Chart */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Progress Over Time</CardTitle>
                <CardDescription>Vocabulary and grammar scores from last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ProgressChart data={progressData.progressChart} />
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your last 5 completed sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {progressData.sessions.slice(0, 5).map((session: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-semibold">
                            {new Date(session.date).toLocaleDateString('en-US', {
                              month: 'long',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <Badge className="bg-green-500">{session.cefrLevel}</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          Vocabulary: {session.lexicalScore}/100 • Grammar: {session.grammarScore}/100
                        </div>
                      </div>
                      <div className="text-2xl">
                        {session.lexicalScore >= 80 && session.grammarScore >= 80 ? '🌟' : '✅'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-2">No Sessions Yet</h3>
              <p className="text-gray-600 mb-6">
                Start your first daily session to begin tracking your progress
              </p>
              <Link href="/session">
                <Button size="lg">
                  Start Your First Session
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

