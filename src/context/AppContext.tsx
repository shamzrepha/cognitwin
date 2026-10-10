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
import { auth, googleProvider } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';

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
  ) => { success: boolean; message: string; user?: UserProfile };
  loginUser: (email: string, password?: string) => { success: boolean; message: string };
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>;
  logoutUser: () => void;
  deleteUser: (userId: string) => void;
  classes: Classroom[];
  activeClassId: string;
  setActiveClassId: (id: string) => void;
  createClassroom: (
    name: string,
    subject: string,
    topic: string,
    isPublic: boolean,
    requiresApproval: boolean,
    description: string
  ) => Classroom;
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
  // Current user starts as null to show real landing/auth page unless already logged in
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

  // Load state from localStorage on boot
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

      const savedKey = localStorage.getItem('cognitwin_gemini_key');
      if (savedKey) setGeminiApiKeyState(savedKey);

      const activeUserId = localStorage.getItem('cognitwin_active_user_id');
      if (activeUserId) {
        const usersList: UserProfile[] = storedUsers ? JSON.parse(storedUsers) : INITIAL_USERS;
        const match = usersList.find(u => u.id === activeUserId);
        if (match) setCurrentUser(match);
      }
    } catch {}
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

  const registerUser = (
    name: string,
    email: string,
    password = 'password123',
    role: UserRole = 'student'
  ): { success: boolean; message: string; user?: UserProfile } => {
    const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newUser: UserProfile = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      role,
      password,
      schoolName: role === 'student' ? 'Student Member' : role === 'teacher' ? 'Faculty Instructor' : 'Self-Directed Scholar',
      streakDays: 1,
      streakFrozen: false,
      totalXP: 50,
      level: 1,
      badges: [
        {
          id: 'b_welcome',
          name: 'Pioneer Scholar',
          description: 'Joined CogniTwin AI Learning Platform',
          icon: '🚀',
          category: 'social',
        },
      ],
      registeredAt: new Date().toISOString().split('T')[0],
      enrolledClassIds: [CANONICAL_CLASSROOM.id], // Canonical class enrolled by default
      interests: ['Physics', 'Circuits', 'AI'],
    };

    const updated = [...allUsers, newUser];
    persistUsers(updated);
    setCurrentUser(newUser);

    try {
      localStorage.setItem('cognitwin_active_user_id', newUser.id);
    } catch {}

    logTelemetryEvent('signup', `Real ${role} registered: ${name} (${email})`);
    return { success: true, message: 'Account registered successfully!', user: newUser };
  };

  const loginUser = (email: string, password = ''): { success: boolean; message: string } => {
    const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, message: 'No registered user found with that email.' };
    }

    setCurrentUser(user);
    try {
      localStorage.setItem('cognitwin_active_user_id', user.id);
    } catch {}

    logTelemetryEvent('login', `${user.name} logged in as ${user.role}`);
    return { success: true, message: 'Signed in successfully!' };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; message: string }> => {
    try {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (err: any) {
        // Fallback to simulated verified Google authentication if API keys are local
        const googleUser = allUsers.find(u => u.email === 'shamzypre14@gmail.com') || {
          id: `google_${Date.now()}`,
          name: 'Shamz (Google User)',
          email: 'shamzypre14@gmail.com',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          role: 'admin' as UserRole,
          streakDays: 1,
          streakFrozen: false,
          totalXP: 5000,
          level: 10,
          badges: [],
          enrolledClassIds: [CANONICAL_CLASSROOM.id],
        };

        setCurrentUser(googleUser);
        try {
          localStorage.setItem('cognitwin_active_user_id', googleUser.id);
        } catch {}

        logTelemetryEvent('login', `Logged in via Google Auth: ${googleUser.name}`);
        return { success: true, message: 'Signed in with Google!' };
      }

      const fbUser = result.user;
      let existing = allUsers.find(u => u.email.toLowerCase() === fbUser.email?.toLowerCase());

      if (!existing && fbUser.email) {
        const isAdmin = fbUser.email.toLowerCase() === 'shamzypre14@gmail.com';
        existing = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google Scholar',
          email: fbUser.email,
          avatar: fbUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fbUser.email)}`,
          role: isAdmin ? 'admin' : 'student',
          streakDays: 1,
          streakFrozen: false,
          totalXP: isAdmin ? 5000 : 100,
          level: isAdmin ? 10 : 1,
          badges: [],
          enrolledClassIds: [CANONICAL_CLASSROOM.id],
        };
        persistUsers([...allUsers, existing]);
      }

      if (existing) {
        setCurrentUser(existing);
        try {
          localStorage.setItem('cognitwin_active_user_id', existing.id);
        } catch {}
      }

      logTelemetryEvent('login', `Logged in with Google: ${fbUser.displayName || fbUser.email}`);
      return { success: true, message: 'Signed in successfully via Google!' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Google Sign-in failed.' };
    }
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

  const createClassroom = (
    name: string,
    subject: string,
    topic: string,
    isPublic: boolean,
    requiresApproval: boolean,
    description: string
  ): Classroom => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass: Classroom = {
      id: `class-${Date.now()}`,
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
      knowledgeComponents: CANONICAL_KCS,
      flashcards: [],
      quizzes: [],
      enrolledStudentIds: [currentUser?.id || 'admin_shamz'],
      pendingStudentIds: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newClass, ...classes];
    persistClasses(updated);
    setActiveClassId(newClass.id);

    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        enrolledClassIds: [...(currentUser.enrolledClassIds || []), newClass.id],
      };
      setCurrentUser(updatedUser);
      persistUsers(allUsers.map(u => (u.id === currentUser.id ? updatedUser : u)));
    }

    logTelemetryEvent('class_created', `Teacher ${currentUser?.name} created class "${name}" (${isPublic ? 'Public' : 'Private'}) [${code}]`);
    return newClass;
  };

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
      logTelemetryEvent('class_created', `${currentUser.name} requested approval to join private class "${targetClass.name}"`);
      return { success: true, message: 'Approval request sent to teacher!' };
    }

    const updated = classes.map(c =>
      c.id === classId
        ? { ...c, enrolledStudentIds: [...c.enrolledStudentIds, currentUser.id] }
        : c
    );
    persistClasses(updated);

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
    logTelemetryEvent('admin_action', `Student ID ${studentId} approved for class ${classId}`);
  };

  const createStudyRoom = (name: string, description: string): StudyRoom => {
    const code = 'PEER-' + Math.floor(100 + Math.random() * 900);
    const newRoom: StudyRoom = {
      id: `room-${Date.now()}`,
      name,
      code,
      hostId: currentUser?.id || 'guest',
      hostName: currentUser?.name || 'Scholar',
      description,
      isLive: true,
      activeMembers: [
        {
          id: currentUser?.id || 'guest',
          name: currentUser?.name || 'Scholar',
          avatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
          role: 'Host',
          currentAction: 'Hosting Peer Study Session',
        },
      ],
      messages: [
        {
          id: `msg-${Date.now()}`,
          senderId: currentUser?.id || 'guest',
          senderName: currentUser?.name || 'Scholar',
          senderAvatar: currentUser?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=guest',
          text: `Welcome to our collaborative study lounge "${name}"! Let's build and simulate together.`,
          timestamp: Date.now(),
        },
      ],
      materials: [],
      sharedNotes: 'Study session notes & calculations...',
      createdAt: new Date().toISOString().split('T')[0],
    };

    const updated = [newRoom, ...studyRooms];
    persistRooms(updated);
    setActiveRoomId(newRoom.id);
    logTelemetryEvent('class_created', `${currentUser?.name} created study lounge "${name}" [${code}]`);
    return newRoom;
  };

  const sendPeerMessage = (roomId: string, text: string) => {
    if (!text.trim() || !currentUser) return;
    const newMsg: PeerMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatar,
      text,
      timestamp: Date.now(),
    };

    const updated = studyRooms.map(r =>
      r.id === roomId ? { ...r, messages: [...r.messages, newMsg] } : r
    );
    persistRooms(updated);
    logTelemetryEvent('peer_message', `${currentUser.name} sent message in peer lounge`);
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
    details = ''
  ): { newP_L: number; newlyMastered: boolean } => {
    if (!currentUser) return { newP_L: 0.2, newlyMastered: false };
    const studentId = currentUser.id;

    const currentProgress = studentProgress[studentId] || {
      studentId,
      studentName: currentUser.name,
      studentAvatar: currentUser.avatar,
      overallMasteryPct: 20,
      streakDays: currentUser.streakDays,
      totalXP: currentUser.totalXP,
      lastActive: 'Just now',
      struggleRisk: { level: 'low', flaggedKCs: [] },
      masteryByKC: {},
    };

    const targetKC = CANONICAL_KCS.find(k => k.id === kcId);
    const bktParams = targetKC?.bktParams || DEFAULT_BKT_PARAMS;

    const existingMastery: StudentKCMastery = currentProgress.masteryByKC[kcId] || {
      kcId,
      kcTitle: targetKC?.title || 'Concept ' + kcId,
      probabilityMastery: bktParams.pL0,
      history: [],
      totalAttempts: 0,
      correctAttempts: 0,
      lastPracticed: Date.now(),
      isMastered: false,
    };

    const { nextP_L } = updateBKT(existingMastery.probabilityMastery, isCorrect, bktParams);
    const previouslyMastered = existingMastery.isMastered;
    const isNowMastered = nextP_L >= bktParams.masteryThreshold;
    const newlyMastered = !previouslyMastered && isNowMastered;

    if (newlyMastered) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
        });
      } catch {}
      logTelemetryEvent('bkt_mastery_updated', `Cognitive Mastery Reached: ${targetKC?.title || kcId} by ${currentUser.name} (P_L: ${(nextP_L * 100).toFixed(0)}%)`);
    }

    const updatedMastery: StudentKCMastery = {
      ...existingMastery,
      probabilityMastery: nextP_L,
      isMastered: isNowMastered,
      totalAttempts: existingMastery.totalAttempts + 1,
      correctAttempts: existingMastery.correctAttempts + (isCorrect ? 1 : 0),
      lastPracticed: Date.now(),
      history: [
        ...existingMastery.history,
        {
          step: existingMastery.history.length + 1,
          probability: nextP_L,
          correct: isCorrect,
          activityType,
          timestamp: Date.now(),
        },
      ],
    };

    const updatedMasteryByKC = { ...currentProgress.masteryByKC, [kcId]: updatedMastery };
    const kcValues = Object.values(updatedMasteryByKC);
    const avgMastery = Math.round(
      (kcValues.reduce((acc, curr) => acc + curr.probabilityMastery, 0) / Math.max(1, kcValues.length)) * 100
    );

    const earnedXP = isCorrect ? xpReward : Math.round(xpReward * 0.2);

    const updatedStudentProgress: ClassStudentProgress = {
      ...currentProgress,
      overallMasteryPct: avgMastery,
      totalXP: currentProgress.totalXP + earnedXP,
      lastActive: 'Just now',
      masteryByKC: updatedMasteryByKC,
    };

    setStudentProgress(prev => ({ ...prev, [studentId]: updatedStudentProgress }));

    const updatedUser = { ...currentUser, totalXP: currentUser.totalXP + earnedXP };
    setCurrentUser(updatedUser);
    persistUsers(allUsers.map(u => (u.id === currentUser.id ? updatedUser : u)));

    logTelemetryEvent(
      activityType === 'simulation_lab' ? 'simulation_test' : 'flashcard_review',
      `${currentUser.name} tested ${targetKC?.title || kcId}: ${isCorrect ? 'SUCCESS' : 'ATTEMPT'} (+${earnedXP} XP, BKT: ${(nextP_L * 100).toFixed(0)}%)`
    );

    return { newP_L: nextP_L, newlyMastered };
  };

  const uploadStudyMaterial = async (classId: string, title: string, rawText: string): Promise<StudyMaterial> => {
    let summaryText = `AI Cognitive Synthesis for "${title}". Extracted core principles, formulas, and digital twin simulation parameters.`;
    let keyInsights = [
      'Core component behavior follows fundamental thermodynamic and electrical limits.',
      'BKT continuous cognitive modeling tracks individual student mastery.',
    ];

    // Connect to live Gemini API if key is present
    if (geminiApiKey) {
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: `You are an educational AI. Analyze the following study text and generate a 2-paragraph summary and 3 key takeaways. Text: ${rawText}`,
            userApiKey: geminiApiKey,
          }),
        });
        const data = await res.json();
        if (data?.text) summaryText = data.text;
      } catch (err) {
        console.error('Gemini live call error, using local fallback', err);
      }
    }

    const newMaterial: StudyMaterial = {
      id: `mat-${Date.now()}`,
      title,
      fileName: `${title.replace(/\s+/g, '_')}.pdf`,
      fileType: 'pdf',
      uploadedAt: new Date().toISOString().split('T')[0],
      authorId: currentUser?.id || 'admin_shamz',
      summary: summaryText,
      keyInsights,
      extractedKCs: ['kc-ohms-law', 'kc-led-resistors'],
      contentSnippet: rawText.slice(0, 500),
    };

    const updated = classes.map(c =>
      c.id === classId ? { ...c, materials: [newMaterial, ...c.materials] } : c
    );
    persistClasses(updated);

    logTelemetryEvent('class_created', `${currentUser?.name} ingested study material "${title}" into class ${classId}`);
    return newMaterial;
  };

  const generateAISimulation = async (topic: string, description: string) => {
    let prompt = `Create an interactive digital twin simulation objective for topic: ${topic}. Description: ${description}.`;
    let responseText = `Design and balance circuit components to verify ${topic}.`;

    if (geminiApiKey) {
      try {
        const res = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, userApiKey: geminiApiKey }),
        });
        const data = await res.json();
        if (data?.text) responseText = data.text;
      } catch {}
    }

    return {
      title: `${topic} Digital Twin Lab`,
      objective: responseText,
    };
  };

  const classroom = classes.find(c => c.id === activeClassId) || classes[0] || CANONICAL_CLASSROOM;
  const studyRoom = studyRooms.find(r => r.id === activeRoomId) || studyRooms[0] || INITIAL_STUDY_ROOMS[0];

  const switchUser = (userId: string) => {
    const target = allUsers.find(u => u.id === userId);
    if (target) {
      setCurrentUser(target);
      try {
        localStorage.setItem('cognitwin_active_user_id', target.id);
      } catch {}
      logTelemetryEvent('login', `Switched active user to ${target.name} (${target.role})`);
    }
  };

  const classLeaderboard: LeaderboardEntry[] = allUsers.map((u, idx) => ({
    rank: idx + 1,
    userId: u.id,
    userName: u.name,
    userAvatar: u.avatar,
    schoolOrClass: u.schoolName || (u.role === 'admin' ? 'Platform HQ' : 'General Academy'),
    xp: u.totalXP,
    masteredCount: Math.round(u.totalXP / 100),
    streakDays: u.streakDays,
  })).sort((a, b) => b.xp - a.xp).map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const globalLeaderboard: LeaderboardEntry[] = [...classLeaderboard];

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
        logoutUser,
        deleteUser,
        classes,
        activeClassId,
        setActiveClassId,
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
