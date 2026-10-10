'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Brain,
  Flame,
  Zap,
  BookOpen,
  Users,
  Trophy,
  LayoutDashboard,
  GraduationCap,
  Sparkles,
  ChevronDown,
  Shield,
  UserPlus,
  LogOut,
  User,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NavbarProps {
  activeTab: 'classes' | 'dashboard' | 'workbench' | 'notebook' | 'room' | 'leaderboard' | 'teacher' | 'admin';
  setActiveTab: (tab: 'classes' | 'dashboard' | 'workbench' | 'notebook' | 'room' | 'leaderboard' | 'teacher' | 'admin') => void;
  onOpenAuth: () => void;
}

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }: NavbarProps) {
  const { currentUser, logoutUser } = useApp();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdmin =
    currentUser?.role === 'admin' ||
    currentUser?.id === 'admin_shamz' ||
    currentUser?.email?.toLowerCase() === 'shamzypre14@gmail.com';

  const isTeacher = currentUser?.role === 'teacher' || isAdmin;

  const handleSignOut = () => {
    setShowProfileMenu(false);
    logoutUser();
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('classes')}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Brain className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
                Cogni<span className="text-cyan-400">Twin</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  AI
                </span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-medium tracking-wide">
                Cognitive Digital Twin LMS
              </span>
            </div>
          </div>

          {/* Center Navigation Links - Strictly Role-Gated & Clean (Simulation Lab is in-class only) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'classes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              My Classes
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              BKT Progress
            </button>

            <button
              onClick={() => setActiveTab('notebook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'notebook'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              NotebookLM
            </button>

            <button
              onClick={() => setActiveTab('room')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'room'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Peer Lounge
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Leaderboard
            </button>

            {/* Teacher Dashboard Tab - STRICTLY Visible to Teachers & Admin */}
            {isTeacher && (
              <button
                onClick={() => setActiveTab('teacher')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'teacher'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-emerald-400/90 hover:text-emerald-300 hover:bg-emerald-500/10'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                Teacher View
              </button>
            )}

            {/* Super Admin Center - STRICTLY Visible ONLY to Shamz / Admin */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeTab === 'admin'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-rose-400 hover:text-rose-300 hover:bg-rose-500/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Admin Center
              </button>
            )}
          </nav>

          {/* Right Action: Profile Popover, Gamification Pills, or Sign In Button */}
          <div className="flex items-center gap-3">
            {!currentUser ? (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign In / Register
              </button>
            ) : (
              <>
                {/* Gamification Pills */}
                <div className="hidden sm:flex items-center gap-2">
                  <div
                    title="Consecutive daily learning streak"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/30 text-xs font-mono font-bold text-orange-400"
                  >
                    <Flame className="w-3.5 h-3.5 fill-orange-400" />
                    {currentUser.streakDays}d
                  </div>
                  <div
                    title="Total Brain XP earned"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs font-mono font-bold text-amber-400"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {currentUser.totalXP} XP
                  </div>
                </div>

                {/* Modern Authenticated User Profile Menu */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                    />
                    <div className="hidden lg:block text-xs pr-1">
                      <span className="font-bold text-white block leading-tight flex items-center gap-1">
                        {currentUser.name}
                        {isAdmin && <Shield className="w-3 h-3 text-rose-400 inline" />}
                      </span>
                      <span className="text-[10px] text-slate-400 capitalize block leading-none">
                        {currentUser.role === 'admin' ? 'Super Admin' : currentUser.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Profile Dropdown Popover (No multi-user switching for normal users!) */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                      {/* User Identity Header */}
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={currentUser.avatar}
                            alt={currentUser.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                              {currentUser.name}
                              {isAdmin && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                                  ADMIN
                                </span>
                              )}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">{currentUser.email}</p>
                            <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                              Role: {currentUser.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI Monthly Token Quota Gauge */}
                      <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 mb-3">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-slate-400 font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-cyan-400" /> Monthly AI Tokens:
                          </span>
                          <span className="font-mono font-bold text-white text-[10px]">
                            {isAdmin
                              ? 'Unlimited'
                              : `${(currentUser.aiTokensUsed || 0).toLocaleString()} / ${(
                                  currentUser.aiTokensQuota || 50000
                                ).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                            style={{
                              width: isAdmin
                                ? '100%'
                                : `${Math.min(
                                    100,
                                    ((currentUser.aiTokensUsed || 0) /
                                      (currentUser.aiTokensQuota || 50000)) *
                                      100
                                  )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Navigation Shortcuts in Profile Popover */}
                      <div className="space-y-1 mb-3">
                        <button
                          onClick={() => {
                            setActiveTab('dashboard');
                            setShowProfileMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                        >
                          <Brain className="w-3.5 h-3.5 text-indigo-400" /> BKT Cognitive Progress
                        </button>

                        {isTeacher && (
                          <button
                            onClick={() => {
                              setActiveTab('teacher');
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors text-left"
                          >
                            <GraduationCap className="w-3.5 h-3.5" /> Teacher Command View
                          </button>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setActiveTab('admin');
                              setShowProfileMenu(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                          >
                            <Shield className="w-3.5 h-3.5" /> Super Admin Center
                          </button>
                        )}
                      </div>

                      {/* Sign Out Action */}
                      <div className="pt-2 border-t border-slate-800">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row (Strictly Role Gated, No Standalone Lab Tab) */}
        <div className="flex md:hidden items-center justify-around py-2.5 border-t border-slate-800/80 text-[11px]">
          <button
            onClick={() => setActiveTab('classes')}
            className={`font-semibold ${activeTab === 'classes' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            Classes
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`font-semibold ${activeTab === 'dashboard' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            BKT
          </button>
          <button
            onClick={() => setActiveTab('notebook')}
            className={`font-semibold ${activeTab === 'notebook' ? 'text-indigo-400' : 'text-slate-400'}`}
          >
            NotebookLM
          </button>
          <button
            onClick={() => setActiveTab('room')}
            className={`font-semibold ${activeTab === 'room' ? 'text-purple-400' : 'text-slate-400'}`}
          >
            Lounge
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`font-semibold ${activeTab === 'leaderboard' ? 'text-amber-400' : 'text-slate-400'}`}
          >
            Rank
          </button>
          {isTeacher && (
            <button
              onClick={() => setActiveTab('teacher')}
              className={`font-semibold ${activeTab === 'teacher' ? 'text-emerald-400' : 'text-slate-400'}`}
            >
              Teacher
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`font-semibold ${activeTab === 'admin' ? 'text-rose-400' : 'text-slate-400'}`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
