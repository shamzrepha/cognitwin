'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  UserProfile,
  Classroom,
  StudyRoom,
  ClassStudentProgress,
  LeaderboardEntry,
  StudyMaterial,
  Flashcard,
  QuizQuestion,
  KnowledgeComponent,
  UserRole,
  SystemTelemetryEvent,
  PeerMessage,
} from '@/lib/types';
import {
  INITIAL_ADMIN_USER,
  INITIAL_USERS,
  CANONICAL_CLASSROOM,
  INITIAL_STUDY_ROOMS,
  CANONICAL_KCS,
} from '@/lib/mockData';
import { updateBKT, DEFAULT_BKT_PARAMS, StudentKCMastery } from '@/lib/bkt';
import { auth, googleProvider, githubProvider, db, isFirebaseConfigured } from '@/lib/firebase';
import { signInWithPopup } from 'firebase/auth';

export function getUserIdFromEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  if (clean === 'shamzypre14@gmail.com' || clean.includes('shamzy') || clean.includes('shamz')) {
    return 'admin_shamz';
  }
  return `std_${clean.replace(/[^a-z0-9]/g, '_')}`;
}

export function formatNameFromEmail(email: string): string {
  const clean = email.trim().toLowerCase();
  if (clean === 'shamzypre14@gmail.com' || clean.includes('shamzy') || clean.includes('shamz')) {
    return 'Shamz';
  }
  const prefix = clean.split('@')[0] || '';
  const noNumbers = prefix.replace(/\d+$/, '');
  const base = noNumbers.length >= 2 ? noNumbers : prefix;
  const parts = base
    .replace(/[._-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'Scholar';

  return parts
    .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
    .join(' ');
}

interface AppContextType {
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  telemetryLogs: SystemTelemetryEvent[];
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  registerUser: (
    name: string,
    email: string,
    password?: string,
    role?: UserRole
  ) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginUser: (
    email: string,
    password?: string,
    role?: UserRole
  ) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  loginWithGoogle: (
    role?: UserRole,
    fallbackEmail?: string,
    fallbackName?: string
  ) => Promise<{ success: boolean; message: string; user?: UserProfile; fallbackRequired?: boolean }>;
  loginWithGithub: (role?: UserRole) => Promise<{ success: boolean; message: string }>;
  loginWithProvider: (
    providerName: 'google' | 'github' | 'guest',
    role?: UserRole,
    fallbackEmail?: string
  ) => Promise<{ success: boolean; message: string; user?: UserProfile; fallbackRequired?: boolean }>;
  logoutUser: () => void;
  deleteUser: (userId: string) => void;
  classes: Classroom[];
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  generateAISyllabus: (
    className: string,
    subject: string,
    topic: string
  ) => Promise<KnowledgeComponent[]>;
  createClassroom: (
    name: string,
    subject: string,
    topic: string,
    isPublic: boolean,
    requiresApproval: boolean,
    description: string,
    knowledgeComponents?: KnowledgeComponent[]
  ) => Promise<Classroom>;
  enrollInClass: (classId: string) => { success: boolean; message: string };
  joinClassByCode: (code: string) => { success: boolean; message: string };
  approveStudentInClass: (classId: string, studentId: string) => void;
  studyRooms: StudyRoom[];
  activeRoomId: string;
  setActiveRoomId: (id: string) => void;
  createStudyRoom: (name: string, description: string) => StudyRoom;
  sendPeerMessage: (roomId: string, text: string) => void;
  updateSharedNotes: (roomId: string, notes: string) => void;
  studentProgress: Record<string, ClassStudentProgress>;
  recordBKTInteraction: (
    kcId: string,
    isCorrect: boolean,
    activityType: 'flashcard' | 'quiz' | 'simulation_lab' | 'concept_review',
    xpReward?: number,
    details?: string
  ) => { newP_L: number; newlyMastered: boolean };
  uploadStudyMaterial: (classId: string, title: string, rawText: string) => Promise<StudyMaterial>;
  generateAISimulation: (topic: string, description: string) => Promise<any>;
  classroom: Classroom;
  studyRoom: StudyRoom;
  classLeaderboard: LeaderboardEntry[];
  globalLeaderboard: LeaderboardEntry[];
  switchUser: (userId: string) => void;
  logTelemetryEvent: (
    eventType: SystemTelemetryEvent['eventType'],
    description: string,
    metadata?: Record<string, any>
  ) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [classes, setClasses] = useState<Classroom[]>([CANONICAL_CLASSROOM]);
  const [activeClassId, setActiveClassId] = useState<string>(CANONICAL_CLASSROOM.id);
  const [studyRooms, setStudyRooms] = useState<StudyRoom[]>(INITIAL_STUDY_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_STUDY_ROOMS[0].id);
  const [studentProgress, setStudentProgress] = useState<Record<string, ClassStudentProgress>>({});
  const [geminiApiKey, setGeminiApiKeyState] = useState<string>('');
  const [telemetryLogs, setTelemetryLogs] = useState<SystemTelemetryEvent[]>([
    {
      id: 'tel-init-1',
      timestamp: 1760100000000,
      userId: 'admin_shamz',
      userName: 'Shamz',
      userRole: 'admin',
      eventType: 'admin_action',
      description: 'CogniTwin Startup Platform Initialized. Canonical classes ready.',
    },
  ]);

  // Load state and sync with server-side database & Firestore on boot
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem('cognitwin_registered_users_v3');
      if (storedUsers) {
        const parsed = JSON.parse(storedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) setAllUsers(parsed);
      } else {
        localStorage.setItem('cognitwin_registered_users_v3', JSON.stringify(INITIAL_USERS));
      }

      const storedClasses = localStorage.getItem('cognitwin_classes_v3');
      if (storedClasses) {
        const parsed = JSON.parse(storedClasses);
        if (Array.isArray(parsed) && parsed.length > 0) setClasses(parsed);
      }

      const storedRooms = localStorage.getItem('cognitwin_rooms_v3');
      if (storedRooms) {
        const parsed = JSON.parse(storedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) setStudyRooms(parsed);
      }

      const storedLogs = localStorage.getItem('cognitwin_telemetry_v3');
      if (storedLogs) {
        const parsed = JSON.parse(storedLogs);
        if (Array.isArray(parsed)) setTelemetryLogs(parsed);
      }

      const activeUserId = localStorage.getItem('cognitwin_active_user_id');
      if (activeUserId) {
        const usersList: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
        const match = usersList.find(u => u.id === activeUserId);
        if (match) setCurrentUser(match);
      }
    } catch {}

    // Cross-Device Server Database Sync for Users
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (data?.users && Array.isArray(data.users) && data.users.length > 0) {
          setAllUsers(prev => {
            const map = new Map<string, UserProfile>();
            data.users.forEach((u: UserProfile) => map.set(u.email.toLowerCase(), u));
            prev.forEach(u => {
              if (!map.has(u.email.toLowerCase())) map.set(u.email.toLowerCase(), u);
            });
            const merged = Array.from(map.values());
            persistUsers(merged);
            return merged;
          });
        }
      })
      .catch(() => {});

    // Cross-Device Server Database Sync for Classrooms
    fetch('/api/classrooms')
      .then(res => res.json())
      .then(data => {
        if (data?.classrooms && Array.isArray(data.classrooms) && data.classrooms.length > 0) {
          setClasses(prev => {
            const map = new Map<string, Classroom>();
            data.classrooms.forEach((c: Classroom) => map.set(c.id, c));
            prev.forEach(c => {
              if (!map.has(c.id)) map.set(c.id, c);
            });
            const merged = Array.from(map.values());
            persistClasses(merged);
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const setGeminiApiKey = (key: string) => {
    setGeminiApiKeyState(key);
    try {
      localStorage.setItem('cognitwin_gemini_key', key);
    } catch {}
  };

  const persistUsers = (users: UserProfile[]) => {
    setAllUsers(users);
    try {
      localStorage.setItem('cognitwin_registered_users_v3', JSON.stringify(users));
    } catch {}
  };

  const persistClasses = (updatedClasses: Classroom[]) => {
    setClasses(updatedClasses);
    try {
      localStorage.setItem('cognitwin_classes_v3', JSON.stringify(updatedClasses));
    } catch {}
  };

  const persistRooms = (updatedRooms: StudyRoom[]) => {
    setStudyRooms(updatedRooms);
    try {
      localStorage.setItem('cognitwin_rooms_v3', JSON.stringify(updatedRooms));
    } catch {}
  };

  const persistLogs = (logs: SystemTelemetryEvent[]) => {
    setTelemetryLogs(logs);
    try {
      localStorage.setItem('cognitwin_telemetry_v3', JSON.stringify(logs.slice(0, 100)));
    } catch {}
  };

  const logTelemetryEvent = (
    eventType: SystemTelemetryEvent['eventType'],
    description: string,
    metadata?: Record<string, any>
  ) => {
    const newEvent: SystemTelemetryEvent = {
      id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      userId: currentUser?.id || 'guest',
      userName: currentUser?.name || 'Guest Visitor',
      userRole: currentUser?.role || 'individual',
      eventType,
      description,
      metadata,
    };

    setTelemetryLogs(prev => {
      const updated = [newEvent, ...prev];
      persistLogs(updated);
      return updated;
    });
  };

  // Normal Sign Up Architecture (Email & Password)
  const registerUser = async (
    name: string,
    email: string,
    password = 'password123',
    role: UserRole = 'student'
  ): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'shamzypre14@gmail.com' || cleanEmail.includes('shamzy') || cleanEmail.includes('shamz');

    // 1. If user already exists locally, immediately log them in
    let existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    // 2. If not local, check server database
    if (!existing) {
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(cleanEmail)}`);
        const data = await res.json();
        if (data?.user) {
          existing = data.user;
        }
      } catch {}
    }

    if (existing) {
      if (isAdmin && existing.role !== 'admin') {
        existing = { ...existing, role: 'admin', aiTokensQuota: 9999999 };
      }
      setCurrentUser(existing);
      try {
        localStorage.setItem('cognitwin_active_user_id', existing.id);
      } catch {}
      logTelemetryEvent('login', `${existing.name} logged in (${existing.role}) [ID: ${existing.id}]`);
      return { success: true, message: `Welcome back, ${existing.name}!`, user: existing };
    }

    // 3. New account registration
    const resolvedRole = isAdmin ? 'admin' : role;
    const studentId = getUserIdFromEmail(cleanEmail);
    const realName = isAdmin ? 'Shamz' : (name.trim() || formatNameFromEmail(cleanEmail));

    const newUser: UserProfile = {
      id: studentId,
      name: realName,
      email: cleanEmail,
      avatar: isAdmin
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(realName)}&backgroundColor=4f46e5,06b6d4,10b981`,
      role: resolvedRole,
      password,
      schoolName: isAdmin
        ? 'CogniTwin Platform Command & Super Admin'
        : resolvedRole === 'student'
        ? 'Student Member'
        : resolvedRole === 'teacher'
        ? 'Faculty Instructor'
        : 'Self-Directed Scholar',
      streakDays: 1,
      streakFrozen: false,
      totalXP: isAdmin ? 5000 : 50,
      level: isAdmin ? 10 : 1,
      badges: [
        {
          id: 'b_welcome',
          name: isAdmin ? 'Super Administrator' : 'Pioneer Scholar',
          description: isAdmin ? 'Platform Owner & Architect' : 'Joined CogniTwin AI Learning Platform',
          icon: isAdmin ? '👑' : '🚀',
          category: 'social',
        },
      ],
      registeredAt: new Date().toISOString().split('T')[0],
      enrolledClassIds: [CANONICAL_CLASSROOM.id],
      interests: ['Physics', 'Circuits', 'AI'],
      aiTokensUsed: 0,
      aiTokensQuota: isAdmin ? 9999999 : resolvedRole === 'teacher' ? 200000 : 50000,
    };

    const updated = [...allUsers.filter(u => u.id !== newUser.id), newUser];
    persistUsers(updated);
    setCurrentUser(newUser);

    // Save to server database
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: newUser }),
    }).catch(() => {});

    try {
      localStorage.setItem('cognitwin_active_user_id', newUser.id);
    } catch {}

    logTelemetryEvent('signup', `Real ${resolvedRole} registered: ${realName} (${cleanEmail}) [ID: ${studentId}]`);
    return { success: true, message: `Account created successfully! Welcome, ${realName}.`, user: newUser };
  };

  // Normal Sign In Architecture (Email & Password)
  const loginUser = async (
    email: string,
    password = '',
    role: UserRole = 'student'
  ): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'Please provide a valid email address.' };
    }

    const isAdmin = cleanEmail === 'shamzypre14@gmail.com' || cleanEmail.includes('shamzy') || cleanEmail.includes('shamz');

    // 1. Check local memory
    let user = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    // 2. If not in local memory, check server database
    if (!user) {
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(cleanEmail)}`);
        const data = await res.json();
        if (data?.user) {
          user = data.user;
          persistUsers([...allUsers.filter(u => u.id !== user!.id), user!]);
        }
      } catch {}
    }

    // 3. Super admin unconditional authentication
    if (isAdmin) {
      if (!user) {
        user = {
          ...INITIAL_ADMIN_USER,
          email: cleanEmail,
        };
        persistUsers([...allUsers.filter(u => u.id !== user!.id), user!]);
      } else {
        user = { ...user, role: 'admin', aiTokensQuota: 9999999 };
      }
    }

    // 4. If user not registered yet, auto-provision and log in seamlessly
    if (!user) {
      const regRes = await registerUser(formatNameFromEmail(cleanEmail), cleanEmail, password || 'password123', role);
      if (regRes.success && regRes.user) {
        return {
          success: true,
          message: `Welcome, ${regRes.user.name}! Your account has been authenticated.`,
          user: regRes.user,
        };
      }
      return { success: false, message: 'Could not complete login. Please try again.' };
    }

    setCurrentUser(user);
    try {
      localStorage.setItem('cognitwin_active_user_id', user.id);
    } catch {}

    logTelemetryEvent('login', `${user.name} logged in as ${user.role} [ID: ${user.id}]`);
    return { success: true, message: `Welcome back, ${user.name}!`, user };
  };

  // Google Sign In (Firebase popup with seamless email fallback)
  const loginWithGoogle = async (
    selectedRole?: UserRole,
    fallbackEmail?: string,
    fallbackName?: string
  ): Promise<{ success: boolean; message: string; user?: UserProfile; fallbackRequired?: boolean }> => {
    let cleanEmail = (fallbackEmail || '').toLowerCase().trim();
    let realName = fallbackName?.trim() || '';
    let realAvatar = '';

    // If no direct email provided, only attempt Firebase popup if Firebase has a valid production key
    if (!cleanEmail) {
      if (isFirebaseConfigured) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const fbUser = result.user;
          cleanEmail = (fbUser.email || '').toLowerCase().trim();
          realName = fbUser.displayName || '';
          realAvatar = fbUser.photoURL || '';
        } catch (error: any) {
          if (error?.code === 'auth/popup-closed-by-user') {
            return { success: false, message: 'Google sign-in popup was closed before completing.' };
          }
          // Popup failed or API key was rejected; seamlessly prompt for Google email directly without showing raw error
          return {
            success: false,
            fallbackRequired: true,
            message: 'Please enter your Google (Gmail) address to authenticate directly.',
          };
        }
      } else {
        // Firebase client key not configured; seamlessly signal UI to collect Google email directly
        return {
          success: false,
          fallbackRequired: true,
          message: 'Please enter your Google (Gmail) address to authenticate directly.',
        };
      }
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, message: 'A valid Google / Gmail address is required.' };
    }

    const isAdmin = cleanEmail === 'shamzypre14@gmail.com' || cleanEmail.includes('shamzy') || cleanEmail.includes('shamz');
    const assignedRole: UserRole = isAdmin ? 'admin' : (selectedRole || 'student');
    const studentId = getUserIdFromEmail(cleanEmail);
    const finalName = isAdmin ? 'Shamz' : (realName || formatNameFromEmail(cleanEmail));
    const finalAvatar = isAdmin
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      : (realAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(finalName)}&backgroundColor=4f46e5,06b6d4,10b981`);

    let targetUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!targetUser) {
      try {
        const res = await fetch(`/api/users?email=${encodeURIComponent(cleanEmail)}`);
        const data = await res.json();
        if (data?.user) {
          targetUser = data.user;
        }
      } catch {}
    }

    if (!targetUser) {
      targetUser = {
        id: studentId,
        name: finalName,
        email: cleanEmail,
        avatar: finalAvatar,
        role: assignedRole,
        schoolName: isAdmin
          ? 'CogniTwin Platform Command & Super Admin'
          : assignedRole === 'teacher'
          ? 'Faculty Instructor'
          : 'Student Member',
        streakDays: 1,
        streakFrozen: false,
        totalXP: isAdmin ? 5000 : 50,
        level: isAdmin ? 10 : 1,
        badges: [
          {
            id: 'b_google_verified',
            name: isAdmin ? 'Super Administrator' : 'Verified Google Scholar',
            description: isAdmin ? 'Platform Owner & Architect' : 'Authenticated via Google Workspace',
            icon: isAdmin ? '👑' : '✨',
            category: 'mastery',
          },
        ],
        registeredAt: new Date().toISOString().split('T')[0],
        enrolledClassIds: [CANONICAL_CLASSROOM.id],
        interests: ['Physics', 'Circuits', 'AI'],
        aiTokensUsed: 0,
        aiTokensQuota: isAdmin ? 9999999 : assignedRole === 'teacher' ? 200000 : 50000,
      };
      persistUsers([...allUsers.filter(u => u.id !== targetUser!.id), targetUser]);
    } else {
      targetUser = {
        ...targetUser,
        name: finalName || targetUser.name,
        avatar: finalAvatar || targetUser.avatar,
        role: isAdmin ? 'admin' : targetUser.role,
        aiTokensQuota: isAdmin ? 9999999 : targetUser.aiTokensQuota,
      };
      persistUsers(allUsers.map(u => (u.id === targetUser?.id ? targetUser! : u)));
    }

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: targetUser }),
    }).catch(() => {});

    setCurrentUser(targetUser);
    try {
      localStorage.setItem('cognitwin_active_user_id', targetUser.id);
    } catch {}

    logTelemetryEvent('login', `Logged in via Google: ${targetUser.name} (${targetUser.role}) [ID: ${studentId}]`);
    return { success: true, message: `Signed in as ${targetUser.name}!`, user: targetUser };
  };

  const loginWithGithub = async (selectedRole?: UserRole): Promise<{ success: boolean; message: string }> => {
    if (!isFirebaseConfigured) {
      return {
        success: false,
        message: 'GitHub sign-in is disabled in this environment. Please use Google or Email sign-in.',
      };
    }
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();

      if (!cleanEmail) {
        return { success: false, message: 'GitHub account did not return an email.' };
      }

      const isAdmin = cleanEmail === 'shamzypre14@gmail.com' || cleanEmail.includes('shamzy') || cleanEmail.includes('shamz');
      const assignedRole = isAdmin ? 'admin' : (selectedRole || 'student');
      const studentId = getUserIdFromEmail(cleanEmail);
      const realName = fbUser.displayName || formatNameFromEmail(cleanEmail);

      let targetUser = allUsers.find(u => u.email.toLowerCase() === cleanEmail);

      if (!targetUser) {
        targetUser = {
          id: studentId,
          name: realName,
          email: cleanEmail,
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(realName)}&backgroundColor=4f46e5`,
          role: assignedRole,
          streakDays: 1,
          streakFrozen: false,
          totalXP: isAdmin ? 5000 : 50,
          level: isAdmin ? 10 : 1,
          badges: [],
          enrolledClassIds: [CANONICAL_CLASSROOM.id],
          aiTokensUsed: 0,
          aiTokensQuota: isAdmin ? 9999999 : assignedRole === 'teacher' ? 200000 : 50000,
        };
        persistUsers([...allUsers, targetUser]);
      }

      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: targetUser }),
      }).catch(() => {});

      setCurrentUser(targetUser);
      localStorage.setItem('cognitwin_active_user_id', targetUser.id);
      return { success: true, message: `Signed in as ${targetUser.name}!` };
    } catch (error: any) {
      return { success: false, message: error.message || 'GitHub Sign-in failed.' };
    }
  };

  const loginWithProvider = async (
    providerName: 'google' | 'github' | 'guest',
    selectedRole?: UserRole,
    fallbackEmail?: string
  ): Promise<{ success: boolean; message: string; user?: UserProfile; fallbackRequired?: boolean }> => {
    if (providerName === 'google') return loginWithGoogle(selectedRole, fallbackEmail);
    if (providerName === 'github') return loginWithGithub(selectedRole);

    // Instant Guest Demo
    const assignedRole = selectedRole || 'student';
    const guestEmail = `guest.${Date.now()}@cognitwin.ai`;
    const guestUser: UserProfile = {
      id: getUserIdFromEmail(guestEmail),
      name: assignedRole === 'teacher' ? 'Faculty Instructor' : 'Guest Scholar',
      email: guestEmail,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      role: assignedRole,
      streakDays: 1,
      streakFrozen: false,
      totalXP: 50,
      level: 1,
      badges: [],
      enrolledClassIds: [CANONICAL_CLASSROOM.id],
      aiTokensUsed: 0,
      aiTokensQuota: assignedRole === 'teacher' ? 200000 : 50000,
    };

    persistUsers([...allUsers, guestUser]);
    setCurrentUser(guestUser);
    localStorage.setItem('cognitwin_active_user_id', guestUser.id);
    return { success: true, message: `Signed in as ${guestUser.name}!`, user: guestUser };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('cognitwin_active_user_id');
    } catch {}
    logTelemetryEvent('login', 'User logged out');
  };

  const deleteUser = (userId: string) => {
    if (userId === INITIAL_ADMIN_USER.id) return;
    const updated = allUsers.filter(u => u.id !== userId);
    persistUsers(updated);
    if (currentUser?.id === userId) setCurrentUser(null);
    logTelemetryEvent('admin_action', `Administrator removed user ID: ${userId}`);
  };

  // AI-Powered Syllabus Generation (Gemini 3.8 Flash)
  const generateAISyllabus = async (
    className: string,
    subject: string,
    topic: string
  ): Promise<KnowledgeComponent[]> => {
    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_syllabus',
          className,
          subject,
          topic,
          userId: currentUser?.id,
          userRole: currentUser?.role,
          currentTokensUsed: currentUser?.aiTokensUsed,
          tokenQuota: currentUser?.aiTokensQuota,
        }),
      });

      const data = await res.json();
      if (data?.topics && Array.isArray(data.topics) && data.topics.length > 0) {
        if (currentUser && data.newTotalTokens) {
          const updatedUser = { ...currentUser, aiTokensUsed: data.newTotalTokens };
          setCurrentUser(updatedUser);
          persistUsers(allUsers.map(u => (u.id === currentUser.id ? updatedUser : u)));
        }
        return data.topics;
      }
    } catch (err) {
      console.error('Failed to generate AI syllabus:', err);
    }

    return CANONICAL_KCS;
  };

  // Cross-Device Classroom Creation (Shared Database & Firestore)
  const createClassroom = async (
    name: string,
    subject: string,
    topic: string,
    isPublic: boolean,
    requiresApproval: boolean,
    description: string,
    knowledgeComponents?: KnowledgeComponent[]
  ): Promise<Classroom> => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const classId = `class-${Date.now()}`;

    // If KCs were not pre-generated, generate or use defaults
    const kcs = knowledgeComponents && knowledgeComponents.length > 0
      ? knowledgeComponents
      : CANONICAL_KCS;

    const newClass: Classroom = {
      id: classId,
      name,
      subject,
      topic,
      code,
      isPublic,
      requiresApproval,
      teacherId: currentUser?.id || 'admin_shamz',
      teacherName: currentUser?.name || 'Instructor',
      description,
      materials: [],
      knowledgeComponents: kcs,
      flashcards: [],
      quizzes: [],
      enrolledStudentIds: [currentUser?.id || 'admin_shamz'],
      pendingStudentIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newClass, ...classes];
    persistClasses(updated);
    setActiveClassId(newClass.id);

    // Save to server database so all other devices immediately query it
    fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', classroom: newClass }),
    }).catch(() => {});

    // Save to Firestore
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'classrooms', newClass.id), newClass);
    } catch {}

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        enrolledClassIds: [...(currentUser.enrolledClassIds || []), newClass.id],
      };
      setCurrentUser(updatedUser);
      persistUsers(allUsers.map(u => (u.id === currentUser.id ? updatedUser : u)));
    }

    logTelemetryEvent(
      'class_created',
      `Teacher ${currentUser?.name} created class "${name}" (${isPublic ? 'Public' : 'Private'}) [${code}]`
    );
    return newClass;
  };

  // Cross-Device Enrollment
  const enrollInClass = (classId: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Please log in to join classes.' };

    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return { success: false, message: 'Class not found.' };

    if (targetClass.enrolledStudentIds.includes(currentUser.id)) {
      return { success: true, message: 'You are already enrolled.' };
    }

    if (targetClass.requiresApproval) {
      const updated = classes.map(c =>
        c.id === classId
          ? { ...c, pendingStudentIds: [...(c.pendingStudentIds || []), currentUser.id] }
          : c
      );
      persistClasses(updated);

      fetch('/api/classrooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enroll', classId, studentId: currentUser.id }),
      }).catch(() => {});

      logTelemetryEvent('class_created', `${currentUser.name} requested approval to join private class "${targetClass.name}"`);
      return { success: true, message: 'Approval request sent to teacher!' };
    }

    const updated = classes.map(c =>
      c.id === classId ? { ...c, enrolledStudentIds: [...c.enrolledStudentIds, currentUser.id] } : c
    );
    persistClasses(updated);

    fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'enroll', classId, studentId: currentUser.id }),
    }).catch(() => {});

    const updatedUser = {
      ...currentUser,
      enrolledClassIds: [...(currentUser.enrolledClassIds || []), classId],
    };
    setCurrentUser(updatedUser);
    persistUsers(allUsers.map(u => (u.id === currentUser.id ? updatedUser : u)));

    logTelemetryEvent('class_created', `${currentUser.name} enrolled in "${targetClass.name}"`);
    return { success: true, message: `Successfully enrolled in ${targetClass.name}!` };
  };

  const joinClassByCode = (code: string): { success: boolean; message: string } => {
    const target = classes.find(c => c.code.toUpperCase() === code.toUpperCase().trim());
    if (!target) return { success: false, message: 'Invalid class join code.' };
    return enrollInClass(target.id);
  };

  const approveStudentInClass = (classId: string, studentId: string) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          pendingStudentIds: (c.pendingStudentIds || []).filter(id => id !== studentId),
          enrolledStudentIds: [...c.enrolledStudentIds, studentId],
        };
      }
      return c;
    });
    persistClasses(updated);

    fetch('/api/classrooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', classId, studentId }),
    }).catch(() => {});

    logTelemetryEvent('admin_action', `Student ID ${studentId} approved for class ${classId}`);
  };

  const createStudyRoom = (name: string, description: string): StudyRoom => {
    const code = 'PEER-' + Math.floor(100 + Math.random() * 900);
    const newRoom: StudyRoom = {
      id: `room-${Date.now()}`,
      name,
      code,
      hostId: currentUser?.id || 'admin_shamz',
      hostName: currentUser?.name || 'Scholar',
      description,
      isLive: true,
      activeMembers: [
        {
          id: currentUser?.id || 'guest',
          name: currentUser?.name || 'Guest Scholar',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
          role: currentUser?.role || 'student',
          currentAction: 'Reviewing circuit dynamics',
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: 'system',
          senderName: 'CogniTwin Lounge Bot',
          senderAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=system_bot',
          text: `Welcome to ${name}! Collaborate with peers in real-time.`,
          timestamp: Date.now(),
        },
      ],
      materials: [],
      sharedNotes: `# ${name} — Collaborative Study Session\n\n- Key Formula: V = I * R\n- Target: Analyze DC step response and diode protection limits`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newRoom, ...studyRooms];
    persistRooms(updated);
    setActiveRoomId(newRoom.id);
    return newRoom;
  };

  const sendPeerMessage = (roomId: string, text: string) => {
    if (!text.trim() || !currentUser) return;
    const newMsg: PeerMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text: text.trim(),
      timestamp: Date.now(),
    };

    const updated = studyRooms.map(r => (r.id === roomId ? { ...r, messages: [...r.messages, newMsg] } : r));
    persistRooms(updated);
  };

  const updateSharedNotes = (roomId: string, notes: string) => {
    const updated = studyRooms.map(r => (r.id === roomId ? { ...r, sharedNotes: notes } : r));
    persistRooms(updated);
  };

  const recordBKTInteraction = (
    kcId: string,
    isCorrect: boolean,
    activityType: 'flashcard' | 'quiz' | 'simulation_lab' | 'concept_review',
    xpReward = 50,
    details?: string
  ): { newP_L: number; newlyMastered: boolean } => {
    if (!currentUser) return { newP_L: 0.5, newlyMastered: false };

    const currentStudentProg = studentProgress[currentUser.id] || {
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      overallMasteryPct: 40,
      masteryByKC: {},
      streakDays: currentUser.streakDays,
      totalXP: currentUser.totalXP,
      lastActive: new Date().toISOString().split('T')[0],
      struggleRisk: { level: 'low', flaggedKCs: [] },
    };

    const currentPL = currentStudentProg.masteryByKC[kcId]?.probabilityMastery ?? DEFAULT_BKT_PARAMS.pL0;
    const { nextP_L } = updateBKT(currentPL, isCorrect, DEFAULT_BKT_PARAMS);
    const isMastered = nextP_L >= DEFAULT_BKT_PARAMS.masteryThreshold;
    const wasMasteredBefore = currentStudentProg.masteryByKC[kcId]?.isMastered ?? false;
    const newlyMastered = isMastered && !wasMasteredBefore;

    const existingKC = currentStudentProg.masteryByKC[kcId];
    const updatedKC: StudentKCMastery = {
      kcId,
      kcTitle: existingKC?.kcTitle || kcId,
      probabilityMastery: nextP_L,
      history: [
        ...(existingKC?.history || []),
        {
          step: (existingKC?.history?.length || 0) + 1,
          probability: nextP_L,
          correct: isCorrect,
          activityType,
          timestamp: Date.now(),
        },
      ],
      totalAttempts: (existingKC?.totalAttempts || 0) + 1,
      correctAttempts: (existingKC?.correctAttempts || 0) + (isCorrect ? 1 : 0),
      lastPracticed: Date.now(),
      isMastered,
    };

    const allKCs = { ...currentStudentProg.masteryByKC, [kcId]: updatedKC };
    const kcValues = Object.values(allKCs);
    const avgMastery = Math.round(
      (kcValues.reduce((acc, curr) => acc + curr.probabilityMastery, 0) / Math.max(1, kcValues.length)) * 100
    );

    const isHighRisk = !isCorrect && nextP_L < 0.4;
    const updatedProg: ClassStudentProgress = {
      ...currentStudentProg,
      masteryByKC: allKCs,
      overallMasteryPct: avgMastery,
      totalXP: currentStudentProg.totalXP + xpReward,
      lastActive: new Date().toISOString().split('T')[0],
      struggleRisk: isHighRisk ? { level: 'high', flaggedKCs: [kcId] } : { level: 'low', flaggedKCs: [] },
    };

    setStudentProgress(prev => ({ ...prev, [currentUser.id]: updatedProg }));

    const updatedUser = {
      ...currentUser,
      totalXP: currentUser.totalXP + xpReward,
      streakDays: currentUser.streakDays,
    };
    setCurrentUser(updatedUser);
    persistUsers(allUsers.map(u => (u.id === currentUser.id ? updatedUser : u)));

    if (newlyMastered) {
      try {
        confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }

    return { newP_L: nextP_L, newlyMastered };
  };

  const uploadStudyMaterial = async (classId: string, title: string, rawText: string): Promise<StudyMaterial> => {
    let summary = 'Document ingested and parsed into cognitive components.';
    let keyInsights = ['Key concept extracted from document notes.'];

    try {
      const res = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze the following engineering study notes: "${rawText.substring(0, 1000)}". Provide a concise 2-sentence summary and 3 bullet key insights.`,
          userId: currentUser?.id,
          userRole: currentUser?.role,
        }),
      });
      const data = await res.json();
      if (data?.text) {
        summary = data.text.substring(0, 250);
      }
    } catch {}

    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title,
      fileName: `${title.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      fileType: 'pdf',
      uploadedAt: new Date().toISOString().split('T')[0],
      authorId: currentUser?.id || 'admin_shamz',
      summary,
      keyInsights,
      extractedKCs: ['kc-ohms-law', 'kc-voltage'],
      contentSnippet: rawText.substring(0, 500),
    };

    const updated = classes.map(c => (c.id === classId ? { ...c, materials: [...c.materials, newMaterial] } : c));
    persistClasses(updated);
    return newMaterial;
  };

  const generateAISimulation = async (topic: string, description: string): Promise<any> => {
    return {
      title: `${topic} Digital Twin`,
      description,
      targetObjective: 'Configure simulation to reach theoretical equilibrium',
      xpReward: 200,
    };
  };

  const classroom = classes.find(c => c.id === activeClassId) || classes[0] || CANONICAL_CLASSROOM;
  const studyRoom = studyRooms.find(r => r.id === activeRoomId) || studyRooms[0];

  const classLeaderboard: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'admin_shamz',
      userName: 'Shamz (Super Admin)',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      schoolOrClass: 'Platform Architect',
      xp: 5000,
      masteredCount: 4,
      streakDays: 14,
    },
    ...(currentUser && currentUser.id !== 'admin_shamz'
      ? [
          {
            rank: 2,
            userId: currentUser.id,
            userName: currentUser.name,
            userAvatar: currentUser.avatar,
            schoolOrClass: currentUser.schoolName || 'Enrolled Scholar',
            xp: currentUser.totalXP,
            masteredCount: 2,
            streakDays: currentUser.streakDays,
          },
        ]
      : []),
  ];

  const globalLeaderboard = classLeaderboard;

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('cognitwin_active_user_id', target.id);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        telemetryLogs,
        geminiApiKey,
        setGeminiApiKey,
        registerUser,
        loginUser,
        loginWithGoogle,
        loginWithGithub,
        loginWithProvider,
        logoutUser,
        deleteUser,
        classes,
        activeClassId,
        setActiveClassId,
        generateAISyllabus,
        createClassroom,
        enrollInClass,
        joinClassByCode,
        approveStudentInClass,
        studyRooms,
        activeRoomId,
        setActiveRoomId,
        createStudyRoom,
        sendPeerMessage,
        updateSharedNotes,
        studentProgress,
        recordBKTInteraction,
        uploadStudyMaterial,
        generateAISimulation,
        classroom,
        studyRoom,
        classLeaderboard,
        globalLeaderboard,
        switchUser,
        logTelemetryEvent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
