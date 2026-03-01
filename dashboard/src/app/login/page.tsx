'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isRateLimited = () => {
    if (typeof window === 'undefined') return false;
    const attemptsData = localStorage.getItem('login_attempts');
    if (!attemptsData) return false;
    const { count, timestamp } = JSON.parse(attemptsData);
    if (Date.now() - timestamp < 15 * 60 * 1000 && count >= 5) return true;
    if (Date.now() - timestamp >= 15 * 60 * 1000) localStorage.removeItem('login_attempts');
    return false;
  };

  const trackFailedAttempt = () => {
    if (typeof window === 'undefined') return;
    const attemptsData = localStorage.getItem('login_attempts');
    const current = attemptsData ? JSON.parse(attemptsData) : { count: 0, timestamp: Date.now() };
    localStorage.setItem('login_attempts', JSON.stringify({ count: current.count + 1, timestamp: current.timestamp }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    if (isRateLimited()) {
      setError('Too many failed attempts. Please try again in 15 minutes.');
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      if (typeof window !== 'undefined') localStorage.removeItem('login_attempts');
      router.push('/admin');
    } catch (err) {
      trackFailedAttempt();
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">BaniTalk Admin</h1>
          <p className="text-gray-400">Sign in to your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@banitalk.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">Admin access only • Secure authentication</p>
      </div>
    </div>
  );
}
