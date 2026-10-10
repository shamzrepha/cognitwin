'use client';

import React, { useState } from 'react';
import {
  Brain,
  Zap,
  BookOpen,
  Users,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  Globe,
  Radio,
  Flame,
  Key,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface LandingPageProps {
  onOpenAuth: () => void;
  onExploreDemo: () => void;
}

export default function LandingPage({ onOpenAuth, onExploreDemo }: LandingPageProps) {
  const { classes, geminiApiKey, setGeminiApiKey } = useApp();
  const [apiKeyInput, setApiKeyInput] = useState(geminiApiKey);
  const [keySaved, setKeySaved] = useState(false);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiApiKey(apiKeyInput.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                Cogni<span className="text-cyan-400">Twin</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreDemo}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 transition-colors"
            >
              Explore Canonical Class
            </button>
            <button
              onClick={onOpenAuth}
              className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl transition-all shadow-md shadow-indigo-600/30"
            >
              Sign In / Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto flex-1 flex flex-col justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 via-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 mx-auto">
          <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Cognitive Learning &amp; Social Classroom Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          Master Complex Concepts with <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Bayesian Cognitive Digital Twins
          </span>
        </h1>

        <p className="mt-6 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop memorizing static raw exam scores. CogniTwin models your continuous cognitive learning process
          using Hidden Markov Bayesian Knowledge Tracing, per-topic interactive simulation labs, peer study rooms,
          and grounded NotebookLM audio synthesis.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onOpenAuth}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold rounded-2xl text-sm transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2"
          >
            Create Your Account <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onExploreDemo}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/90 hover:bg-slate-850 text-slate-200 border border-slate-800 font-semibold rounded-2xl text-sm transition-all"
          >
            Launch Canonical Ohm’s Law Lab
          </button>
        </div>

        {/* Live Gemini API Key Config Box */}
        <div className="mt-12 max-w-md mx-auto w-full bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-left">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
            <Key className="w-4 h-4" /> Connect Your Google Gemini API Key
          </div>
          <p className="text-[11px] text-slate-400 mb-2.5">
            Inject your Gemini API key to power real-time AI document chunking, interactive simulations, and grounded tutor queries.
          </p>

          <form onSubmit={handleSaveKey} className="flex gap-2">
            <input
              type="password"
              placeholder="Paste AI Studio Gemini Key..."
              value={apiKeyInput}
              onChange={e => setApiKeyInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
            >
              {keySaved ? 'Saved!' : 'Save Key'}
            </button>
          </form>
        </div>
      </section>

      {/* Feature Pillar Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit mb-4">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">In-Class Topic Simulations</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Every topic has its own digital twin. Wire breadboards, test diode burnout limits, and balance circuits to prove empirical understanding.
          </p>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit mb-4">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Bayesian Knowledge Tracing</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Cognitive AI tracks learning probability transitions, separates lucky guesses from true mastery, and adapts curriculum path dynamically.
          </p>
        </div>

        <div className="p-6 bg-slate-900/50 border border-slate-800/80 rounded-2xl">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl w-fit mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">Social Peer Lounges &amp; Chats</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Create ad-hoc study rooms, invite classmates, exchange real-time peer messages, and co-solve complex engineering challenges.
          </p>
        </div>
      </section>
    </div>
  );
}
