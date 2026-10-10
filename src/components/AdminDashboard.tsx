'use client';

import React, { useState } from 'react';
import {
  Shield,
  Users,
  Activity,
  Database,
  Trash2,
  UserPlus,
  Download,
  Search,
  CheckCircle,
  AlertTriangle,
  Zap,
  BookOpen,
  Brain,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { UserProfile, UserRole } from '@/lib/types';

export default function AdminDashboard() {
  const {
    currentUser,
    allUsers,
    telemetryLogs,
    deleteUser,
    registerUser,
    classroom,
    studyRoom,
    studentProgress,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('password123');
  const [newUserRole, setNewUserRole] = useState<UserRole>('student');

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    await registerUser(newUserName, newUserEmail, newUserPassword, newUserRole);
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
  };

  const handleExportDatabase = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      superAdmin: currentUser?.email || 'admin@cognitwin.ai',
      users: allUsers,
      classrooms: [classroom],
      studyRooms: [studyRoom],
      studentProgress,
      telemetryLogs,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cognitwin_database_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const studentCount = allUsers.filter(u => u.role === 'student').length;
  const teacherCount = allUsers.filter(u => u.role === 'teacher').length;
  const individualCount = allUsers.filter(u => u.role === 'individual').length;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-8">
      {/* Super Admin Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded-2xl">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Super Admin Command Center</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Root Access
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Administrator: <strong className="text-white">{currentUser?.name || 'Shamz'}</strong> ({currentUser?.email || 'shamzypre14@gmail.com'}) • Global System Supervisor
              </p>
            </div>
          </div>
        </div>

        {/* Global Admin Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5" /> Provision User
          </button>
          <button
            onClick={handleExportDatabase}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
          >
            <Download className="w-3.5 h-3.5" /> Export JSON DB
          </button>
        </div>
      </div>

      {/* Global Telemetry KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Real Registered Users</span>
          <span className="text-2xl font-bold text-white mt-1 block font-mono">{allUsers.length}</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Live in Database</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Registered Students</span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block font-mono">{studentCount}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Active Learners</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Registered Teachers</span>
          <span className="text-2xl font-bold text-emerald-400 mt-1 block font-mono">{teacherCount}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Classroom Leads</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400 block font-medium">Total Telemetry Events</span>
          <span className="text-2xl font-bold text-rose-400 mt-1 block font-mono">{telemetryLogs.length}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Simulations, BKT &amp; Logins</span>
        </div>
      </div>

      {/* Real User Directory */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" /> Real User Directory ({filteredUsers.length})
            </h3>
            <p className="text-xs text-slate-400">
              Inspect any registered account, view their Bayesian cognitive state, or manage credentials.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 w-40"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 py-1.5 px-2 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="individual">Individuals</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4 text-center">XP</th>
                <th className="py-3 px-4 text-center">Streak</th>
                <th className="py-3 px-4 text-center">AI Token Quota</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map(user => {
                const isAdmin = user.role === 'admin';
                const tokensUsed = user.aiTokensUsed || 0;
                const tokensQuota = user.aiTokensQuota || (isAdmin ? 9999999 : user.role === 'teacher' ? 200000 : 50000);
                const pct = Math.min(100, Math.round((tokensUsed / tokensQuota) * 100));

                return (
                  <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <span className="font-bold text-white block">{user.name}</span>
                        {currentUser && user.id === currentUser.id && (
                          <span className="text-[10px] text-rose-400 font-semibold">(Current Admin)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-[11px]">{user.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                          user.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : user.role === 'teacher'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-amber-400 font-bold">{user.totalXP}</td>
                    <td className="py-3 px-4 text-center font-mono text-orange-400 font-semibold">{user.streakDays}d</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-mono text-[11px] text-slate-300">
                          {isAdmin ? 'Unlimited' : `${tokensUsed.toLocaleString()} / ${tokensQuota.toLocaleString()}`}
                        </span>
                        {!isAdmin && (
                          <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                            <div
                              className={`h-full ${pct > 80 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{user.registeredAt || '2026-10-10'}</td>
                    <td className="py-3 px-4 text-right">
                      {!isAdmin && (
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live System Telemetry Audit Log */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" />
              Live Platform Audit &amp; Telemetry Stream
            </h3>
            <p className="text-xs text-slate-400">
              Real-time audit log of simulation experiments, circuit burnouts, and BKT updates.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Showing {telemetryLogs.length} events</span>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 max-h-72 overflow-y-auto space-y-2">
          {telemetryLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No events recorded yet. Perform actions in the Simulation Lab or Notebook Studio to see live logs!
            </div>
          ) : (
            telemetryLogs.slice(0, 30).map(event => (
              <div
                key={event.id}
                className="p-2.5 bg-slate-900 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs gap-3"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={`p-1 rounded-md shrink-0 ${
                      event.eventType === 'led_burnout'
                        ? 'bg-rose-500/20 text-rose-400'
                        : event.eventType === 'challenge_complete'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : event.eventType === 'signup'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {event.eventType === 'led_burnout' ? (
                      <AlertTriangle className="w-3.5 h-3.5" />
                    ) : event.eventType === 'challenge_complete' ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-white mr-1.5">{event.userName}:</span>
                    <span className="text-slate-300">{event.description}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Provision User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">Provision New User Account</h4>
            <p className="text-xs text-slate-400 mb-4">
              Add a real student, teacher, or scholar directly into the persistent database.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="maya.lin@domain.com"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 font-medium block mb-1">Account Role</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="individual">Independent Scholar</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
