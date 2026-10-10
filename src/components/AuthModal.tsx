'use client';

import React, { useState } from 'react';
import { Shield, User, Mail, Lock, Sparkles, X, ArrowRight, UserCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserRole } from '@/lib/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { registerUser, loginUser, loginWithGoogle, loginWithGithub, loginWithProvider, switchUser, currentUser } = useApp();
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSocialAuth = async (provider: 'google' | 'github' | 'guest') => {
    setIsSocialLoading(provider);
    setErrorMessage('');
    try {
      const res = await loginWithProvider(provider);
      if (res.success) {
        onClose();
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsSocialLoading(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (mode === 'register') {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setErrorMessage('All fields are required.');
        return;
      }

      const res = registerUser(name, email, password, role);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
      onClose();
    } else {
      if (!email.trim()) {
        setErrorMessage('Please enter your email.');
        return;
      }

      const res = loginUser(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
        return;
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'register' ? 'Join CogniTwin AI' : 'Sign in to Your Account'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Real student, teacher, or scholar account on the Bayesian Cognitive platform.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            onClick={() => {
              setMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Real Account
          </button>
          <button
            onClick={() => {
              setMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* 1-Click Social Sign-In Providers */}
        <div className="space-y-2 mb-5">
          <button
            type="button"
            onClick={() => handleSocialAuth('google')}
            disabled={!!isSocialLoading}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSocialLoading === 'google' ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSocialAuth('github')}
            disabled={!!isSocialLoading}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-2.5 transition-all shadow-sm"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>{isSocialLoading === 'github' ? 'Connecting to GitHub...' : 'Continue with GitHub'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800" />
          <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Or with email
          </span>
          <div className="flex-grow border-t border-slate-800" />
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@school.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Select Your Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'student', label: 'Student' },
                  { id: 'teacher', label: 'Teacher' },
                  { id: 'individual', label: 'Scholar' },
                ].map(r => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as UserRole)}
                    className={`py-2 text-xs font-semibold rounded-xl border capitalize transition-all ${
                      role === r.id
                        ? 'bg-indigo-600/20 text-white border-indigo-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-850'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mt-2"
          >
            {mode === 'register' ? 'Complete Registration' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Access */}
        <div className="mt-5 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => handleSocialAuth('guest')}
            className="w-full py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Instant Access as Guest Scholar
          </button>
        </div>
      </div>
    </div>
  );
}
