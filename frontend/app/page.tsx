/**
 * Landing Page
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="text-2xl font-bold text-blue-600">CoachTCF</div>
          <Link href="/login">
            <Button variant="outline">Login</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Master French with AI
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Practice TCF French exam daily with personalized AI coaching. Get instant feedback on
          your listening, speaking, and writing skills.
        </p>
        <Link href="/login">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started Free
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🎧</div>
            <h3 className="text-xl font-semibold mb-2">Listen</h3>
            <p className="text-gray-600">
              Complete a daily listening comprehension question with realistic French audio
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-semibold mb-2">Speak</h3>
            <p className="text-gray-600">
              Record a 2-minute response and get pronunciation feedback from AI
            </p>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-4xl mb-4">✍️</div>
            <h3 className="text-xl font-semibold mb-2">Write</h3>
            <p className="text-gray-600">
              Write 50-80 words and receive detailed grammar and vocabulary analysis
            </p>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-blue-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why CoachTCF?</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h4 className="font-semibold mb-1">CEFR Level Assessment</h4>
                <p className="text-gray-600">Track your progress from A1 to C1</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h4 className="font-semibold mb-1">Progress Tracking</h4>
                <p className="text-gray-600">Visualize your improvement over time</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <h4 className="font-semibold mb-1">Targeted Feedback</h4>
                <p className="text-gray-600">Get one specific correction daily</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h4 className="font-semibold mb-1">5-6 Minutes Daily</h4>
                <p className="text-gray-600">Quick sessions that fit your schedule</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Improve Your French?</h2>
        <p className="text-xl text-gray-600 mb-8">
          Join thousands of learners practicing daily
        </p>
        <Link href="/login">
          <Button size="lg" className="text-lg px-8 py-6">
            Start Your Journey
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>© 2025 CoachTCF. Built with Raindrop AI & Vultr for LiquidMetal Hackathon.</p>
        </div>
      </footer>
    </main>
  );
}
