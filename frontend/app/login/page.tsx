/**
 * Login/Signup Page
 */

'use client';

import Link from 'next/link';
import AuthForm from '@/components/AuthForm';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          ← CoachTCF
        </Link>
      </div>
      
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-100px)]">
        <AuthForm />
      </div>
    </main>
  );
}

