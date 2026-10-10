'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Users,
  Lock,
  Globe,
  Share2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Classroom } from '@/lib/types';
import ElectronicsWorkbench from './ElectronicsWorkbench';
import NotebookStudio from './NotebookStudio';

export default function ClassroomsHub() {
  const {
    currentUser,
    classes,
    activeClassId,
    setActiveClassId,
    createClassroom,
    enrollInClass,
    joinClassByCode,
    approveStudentInClass,
  } = useApp();

  const [activeView, setActiveView] = useState<'catalog' | 'class_details' | 'topic_sim'>('catalog');
  const [selectedKcId, setSelectedKcId] = useState<string>('kc-ohms-law');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Create Class Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];
  const isEnrolled = activeClass?.enrolledStudentIds?.includes(currentUser?.id || '');
  const isTeacher = activeClass?.teacherId === currentUser?.id || currentUser?.role === 'admin';

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newClass = createClassroom(name, subject, topic, isPublic, requiresApproval, description);
    setShowCreateModal(false);
    setActiveClassId(newClass.id);
    setActiveView('class_details');
    setName('');
    setSubject('');
    setDescription('');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinClassByCode(joinCodeInput);
    setStatusMessage(res.message);
    setJoinCodeInput('');
    setTimeout(() => setStatusMessage(''), 3000);
  };

  const copyClassLink = () => {
    if (!activeClass) return;
    navigator.clipboard?.writeText(`${window.location.origin}?classCode=${activeClass.code}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Classrooms &amp; Curriculum Hub
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              Udemy + NotebookLM Model
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Browse public classes, join private teacher classrooms, or provision a new curriculum.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView !== 'catalog' && (
            <button
              onClick={() => setActiveView('catalog')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              ← All Classes
            </button>
          )}

          {(currentUser?.role === 'teacher' || currentUser?.role === 'admin') && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Create New Class
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
          {statusMessage}
        </div>
      )}

      {/* VIEW 1: Catalog of Classes */}
      {activeView === 'catalog' && (
        <div className="space-y-6">
          {/* Quick Join By Code Strip */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white">Have a private invite code?</h3>
              <p className="text-xs text-slate-400">Enter the 6-character code provided by your instructor.</p>
            </div>
            <form onSubmit={handleJoinByCode} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. OHM-402"
                value={joinCodeInput}
                onChange={e => setJoinCodeInput(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 uppercase font-mono w-32 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Join
              </button>
            </form>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map(c => {
              const enrolled = c.enrolledStudentIds?.includes(currentUser?.id || '');
              return (
                <div
                  key={c.id}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {c.code}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          c.isPublic
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                        }`}
                      >
                        {c.isPublic ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {c.isPublic ? 'Public Class' : 'Private (Approval Req.)'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{c.name}</h4>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {c.subject} • Instructor: {c.teacherName}
                    </span>

                    <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{c.knowledgeComponents?.length || 0} Topics &amp; Labs</span>
                      <span>{c.enrolledStudentIds?.length || 0} Students</span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveClassId(c.id);
                        setActiveView('class_details');
                      }}
                      className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      {enrolled ? 'Enter Classroom' : 'View Syllabus & Enroll'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: Inside a Specific Classroom */}
      {activeView === 'class_details' && activeClass && (
        <div className="space-y-6">
          {/* Class Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-xs">
                    {activeClass.code}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeClass.subject}
                  </span>
                  {activeClass.requiresApproval && (
                    <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Private (Approval Required)
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white">{activeClass.name}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Instructor: <strong className="text-white">{activeClass.teacherName}</strong> • Enrolled: {activeClass.enrolledStudentIds?.length || 0} students
                </p>
              </div>

              {/* Share & Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={copyClassLink}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Link Copied' : 'Share Class Link'}
                </button>

                {!isEnrolled ? (
                  <button
                    onClick={() => enrollInClass(activeClass.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Enroll in Class
                  </button>
                ) : (
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    ✓ Enrolled Student
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pending Approval List for Teacher */}
          {isTeacher && activeClass.pendingStudentIds && activeClass.pendingStudentIds.length > 0 && (
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-purple-200 mb-2">Pending Enrollment Requests ({activeClass.pendingStudentIds.length}):</h4>
              <div className="flex flex-wrap gap-2">
                {activeClass.pendingStudentIds.map(studentId => (
                  <div key={studentId} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-slate-300">Student ID: {studentId}</span>
                    <button
                      onClick={() => approveStudentInClass(activeClass.id, studentId)}
                      className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                    >
                      Approve
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus & In-Class Topic Simulations List */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Class Curriculum &amp; Per-Topic Simulations
            </h3>
            <p className="text-xs text-slate-400">
              Each unit has its own dedicated digital twin simulation where you practicalize what you learn.
            </p>

            <div className="space-y-3">
              {activeClass.knowledgeComponents.map(kc => (
                <div
                  key={kc.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                        {kc.code}
                      </span>
                      <span className="text-xs text-slate-400">{kc.unit}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{kc.title}</h4>
                    <p className="text-xs text-slate-300">{kc.description}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        setSelectedKcId(kc.id);
                        setActiveView('topic_sim');
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Zap className="w-3.5 h-3.5" /> Simulate This Topic
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Class Study Material & NotebookLM Studio */}
          <div className="pt-4">
            <NotebookStudio />
          </div>
        </div>
      )}

      {/* VIEW 3: In-Class Topic Simulation Lab */}
      {activeView === 'topic_sim' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <button
              onClick={() => setActiveView('class_details')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 font-semibold"
            >
              ← Back to Classroom Syllabus
            </button>
            <span className="text-xs text-cyan-400 font-mono">
              In-Class Topic Simulation Sandbox
            </span>
          </div>

          <ElectronicsWorkbench />
        </div>
      )}

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create New Classroom</h3>
            <p className="text-xs text-slate-400 mb-5">
              Set up a public or private course. AI will automatically build prerequisite topic maps and simulation labs.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Analog Electronics & Filters"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Electrical Engineering"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium block mb-1">Initial Topic</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. RC Filters & Time Constants"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Course Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain learning outcomes and real-world relevance..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={e => setIsPublic(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Public Classroom</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={e => setRequiresApproval(e.target.checked)}
                    className="rounded accent-indigo-600"
                  />
                  <span>Requires Teacher Approval</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Launch Classroom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
