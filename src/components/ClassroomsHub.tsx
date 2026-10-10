'use client';

import React, { useState, useMemo } from 'react';
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
  Search,
  Play,
  CheckCircle2,
  Filter,
  GraduationCap,
  Calendar,
  Code,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Classroom, KnowledgeComponent } from '@/lib/types';
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
    studentProgress,
  } = useApp();

  const [activeView, setActiveView] = useState<'catalog' | 'class_details' | 'topic_sim'>('catalog');
  const [selectedKc, setSelectedKc] = useState<KnowledgeComponent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'enrolled' | 'public' | 'private'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Create Class Form State
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('Electronics & Cyber-Physical Systems');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);

  const activeClass = classes.find(c => c.id === activeClassId) || classes[0];
  const isEnrolled = activeClass?.enrolledStudentIds?.includes(currentUser?.id || '');
  const isTeacher =
    activeClass?.teacherId === currentUser?.id ||
    currentUser?.role === 'admin' ||
    currentUser?.role === 'teacher';

  // Real-time Class Search & Filter logic (SunRoot UX)
  const filteredClasses = useMemo(() => {
    return classes.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.subject.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.teacherName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (categoryFilter === 'enrolled') {
        return c.enrolledStudentIds?.includes(currentUser?.id || '');
      }
      if (categoryFilter === 'public') {
        return c.isPublic;
      }
      if (categoryFilter === 'private') {
        return !c.isPublic || c.requiresApproval;
      }
      return true;
    });
  }, [classes, searchQuery, categoryFilter, currentUser]);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newClass = createClassroom(
      name,
      subject,
      topic || name,
      isPublic,
      requiresApproval,
      description || `A comprehensive curriculum on ${name}. Topics include digital twin simulations and BKT mastery labs.`
    );
    setShowCreateModal(false);
    setActiveClassId(newClass.id);
    setActiveView('class_details');
    setName('');
    setDescription('');
    setStatusMessage(`Class "${newClass.name}" created successfully! Code: ${newClass.code}`);
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const res = joinClassByCode(joinCodeInput);
    setStatusMessage(res.message);
    setJoinCodeInput('');
    setTimeout(() => setStatusMessage(''), 4000);
  };

  const copyClassLink = () => {
    if (!activeClass) return;
    navigator.clipboard?.writeText(`${window.location.origin}?classCode=${activeClass.code}`);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const openTopicSimulation = (kc: KnowledgeComponent) => {
    setSelectedKc(kc);
    setActiveView('topic_sim');
  };

  return (
    <div className="space-y-6">
      {/* Hub Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Classrooms &amp; Curriculum Directory
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono">
              SunRoot Architecture
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Search classes, join with invite codes, or dive into per-topic digital twin simulations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeView !== 'catalog' && (
            <button
              onClick={() => setActiveView('catalog')}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors"
            >
              ← Back to Class Directory
            </button>
          )}

          {isTeacher && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> + Create New Class
            </button>
          )}
        </div>
      </div>

      {statusMessage && (
        <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* VIEW 1: Directory Catalog with Search Bar (SunRoot Model) */}
      {activeView === 'catalog' && (
        <div className="space-y-6">
          {/* Search, Filter & Quick Code Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search Input Bar */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
              <input
                type="text"
                placeholder="Search classes by name, subject, topic, instructor, or code..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-slate-500 hover:text-white px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Join By Invite Code */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center justify-between gap-2 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 pl-2">Join Code:</span>
              <form onSubmit={handleJoinByCode} className="flex gap-2 flex-1 max-w-[200px]">
                <input
                  type="text"
                  placeholder="e.g. ELEC-01"
                  value={joinCodeInput}
                  onChange={e => setJoinCodeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-slate-500 uppercase font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            {[
              { id: 'all', label: 'All Classes' },
              { id: 'enrolled', label: 'My Enrolled Classes' },
              { id: 'public', label: 'Public Classes' },
              { id: 'private', label: 'Private (Approval Req.)' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setCategoryFilter(f.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                  categoryFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
            <span className="text-xs text-slate-500 ml-auto font-mono">
              Showing {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}
            </span>
          </div>

          {/* Classes Grid */}
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">No classes match your search</h3>
              <p className="text-xs text-slate-500 mt-1">
                Try searching for a different subject or reset your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClasses.map(c => {
                const enrolled = c.enrolledStudentIds?.includes(currentUser?.id || '');
                const isClassTeacher = c.teacherId === currentUser?.id;
                const isPending = c.pendingStudentIds?.includes(currentUser?.id || '');

                return (
                  <div
                    key={c.id}
                    className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between shadow-md"
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
                        {c.subject} • Instructor: <strong className="text-slate-300">{c.teacherName}</strong>
                      </span>

                      <p className="text-xs text-slate-300 mt-3 line-clamp-3 leading-relaxed">
                        {c.description}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 text-cyan-400 font-medium">
                          <Zap className="w-3 h-3" /> {c.knowledgeComponents?.length || 0} Topics &amp; Labs
                        </span>
                        <span>{c.enrolledStudentIds?.length || 0} Students</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2">
                      {enrolled || isClassTeacher ? (
                        <button
                          onClick={() => {
                            setActiveClassId(c.id);
                            setActiveView('class_details');
                          }}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
                        >
                          Enter Classroom <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : isPending ? (
                        <span className="w-full py-2 bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-semibold text-center">
                          Approval Pending ⏳
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            const res = enrollInClass(c.id);
                            setStatusMessage(res.message);
                            setTimeout(() => setStatusMessage(''), 3000);
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
                        >
                          {c.requiresApproval ? 'Request to Join Class' : 'Enroll in Class'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  <span className="font-mono text-cyan-400 font-bold bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/20 text-xs">
                    {activeClass.code}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {activeClass.subject}
                  </span>
                  {activeClass.requiresApproval && (
                    <span className="text-xs px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Private (Approval Required)
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-black text-white">{activeClass.name}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Instructor: <strong className="text-white">{activeClass.teacherName}</strong> • Enrolled: {activeClass.enrolledStudentIds?.length || 0} students
                </p>
                <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
                  {activeClass.description}
                </p>
              </div>

              {/* Share & Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={copyClassLink}
                  className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Link Copied' : 'Share Class Link'}
                </button>

                {!isEnrolled && !isTeacher ? (
                  <button
                    onClick={() => enrollInClass(activeClass.id)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                  >
                    Enroll in Class
                  </button>
                ) : (
                  <span className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled Student
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Pending Approval List for Teacher */}
          {isTeacher && activeClass.pendingStudentIds && activeClass.pendingStudentIds.length > 0 && (
            <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-purple-200 mb-2">
                Pending Student Enrollment Requests ({activeClass.pendingStudentIds.length}):
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeClass.pendingStudentIds.map(studentId => (
                  <div key={studentId} className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
                    <span className="text-slate-300">Student ID: {studentId}</span>
                    <button
                      onClick={() => approveStudentInClass(activeClass.id, studentId)}
                      className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold transition-all"
                    >
                      Approve Admission
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Syllabus & Per-Topic Simulation Triggers (The NotebookLM + SunRoot Model) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Syllabus Topics &amp; In-Class Interactive Simulations
                </h3>
                <p className="text-xs text-slate-400">
                  Every topic has its own digital twin simulation. Click &ldquo;Simulate Topic Lab&rdquo; to test circuits and advance your BKT probability.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {activeClass.knowledgeComponents.map((kc, idx) => {
                const userProgress = currentUser ? studentProgress[currentUser.id] : null;
                const kcMastery = userProgress?.masteryByKC[kc.id];
                const pL = kcMastery?.probabilityMastery ?? kc.bktParams.pL0;
                const isMastered = pL >= 0.85;

                return (
                  <div
                    key={kc.id}
                    className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                          {kc.code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{kc.unit}</span>
                        {isMastered ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            ✓ Mastered ({(pL * 100).toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium border border-indigo-500/30">
                            Cognitive Belief: {(pL * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white">{kc.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{kc.description}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* IN-CLASS TOPIC SIMULATION TRIGGER */}
                      <button
                        onClick={() => openTopicSimulation(kc)}
                        className="px-4 py-2.5 bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 hover:from-cyan-500 hover:to-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all group"
                      >
                        <Play className="w-3.5 h-3.5 fill-white group-hover:scale-110 transition-transform" />
                        Simulate Topic Lab
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ingested Class Study Material & NotebookLM Studio */}
          <div className="pt-4 border-t border-slate-800">
            <NotebookStudio />
          </div>
        </div>
      )}

      {/* VIEW 3: In-Class Topic Simulation Workbench */}
      {activeView === 'topic_sim' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveView('class_details')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 font-semibold bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors w-fit"
            >
              ← Back to Classroom Syllabus
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Class: {activeClass?.name}</span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-cyan-400 font-mono font-bold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                {selectedKc ? selectedKc.title : "Ohm's Law & Circuit Lab"}
              </span>
            </div>
          </div>

          {/* Active Topic Objective Header */}
          {selectedKc && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-indigo-400 block font-bold">
                  TOPIC LAB: {selectedKc.code}
                </span>
                <h3 className="text-sm font-bold text-white">{selectedKc.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{selectedKc.description}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-400 block font-medium">Lab Reward:</span>
                <span className="text-xs font-bold text-amber-400 font-mono">+150 XP</span>
              </div>
            </div>
          )}

          {/* Full Interactive Workbench */}
          <ElectronicsWorkbench />
        </div>
      )}

      {/* Create Class Modal (Teachers & Admin) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-white mb-1">Create New Classroom</h3>
            <p className="text-xs text-slate-400 mb-5">
              Set up a public or private course. The cognitive engine provisions BKT knowledge components and topic simulations.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Class Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber-Physical Automation & Circuit Physics"
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
                  <label className="text-xs text-slate-400 font-medium block mb-1">Primary Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. Analog Circuit Dynamics"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Curriculum Description</label>
                <textarea
                  rows={3}
                  placeholder="Explain what concepts students will learn and simulate..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              {/* Public vs Private Configuration */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 block">Class Access Level:</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="access"
                      checked={isPublic}
                      onChange={() => {
                        setIsPublic(true);
                        setRequiresApproval(false);
                      }}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span>Public (Instant Enrollment)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      name="access"
                      checked={!isPublic}
                      onChange={() => {
                        setIsPublic(false);
                        setRequiresApproval(true);
                      }}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <span>Private (Approval Required)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
                >
                  Create &amp; Launch Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
