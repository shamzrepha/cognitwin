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
} from '@/lib/types';
import {
  MOCK_USERS,
  INITIAL_ADMIN_USER,
  MOCK_CLASSROOM,
  MOCK_STUDY_ROOM,
  MOCK_STUDENT_PROGRESS,
  MOCK_CLASS_LEADERBOARD,
  MOCK_GLOBAL_LEADERBOARD,
  MOCK_KCS,
  MOCK_STUDY_MATERIALS,
  MOCK_FLASHCARDS,
  MOCK_QUIZZES,
} from '@/lib/mockData';
import { updateBKT, DEFAULT_BKT_PARAMS, StudentKCMastery } from '@/lib/bkt';

interface AppContextType {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  telemetryLogs: SystemTelemetryEvent[];
  switchUser: (userId: string) => void;
  registerUser: (
    name: string,
    email: string,
    password?: string,
    role?: UserRole
  ) => { success: boolean; message: string; user?: UserProfile };
  loginUser: (email: string, password?: string) => { success: boolean; message: string };
  logoutUser: () => void;
  deleteUser: (userId: string) => void;
  logTelemetryEvent: (
    eventType: SystemTelemetryEvent['eventType'],
    description: string,
    metadata?: Record<string, any>
  ) => void;
  classroom: Classroom;
  studyRoom: StudyRoom;
  studentProgress: Record<string, ClassStudentProgress>;
  classLeaderboard: LeaderboardEntry[];
  globalLeaderboard: LeaderboardEntry[];
  recordBKTInteraction: (
    kcId: string,
    isCorrect: boolean,
    activityType: 'flashcard' | 'quiz' | 'simulation_lab' | 'concept_review',
    xpReward?: number,
    details?: string
  ) => { newP_L: number; newlyMastered: boolean };
  uploadStudyMaterial: (title: string, rawText: string) => Promise<StudyMaterial>;
  createClassroom: (name: string, subject: string, isPublic: boolean) => Classroom;
  joinClassroomByCode: (code: string) => boolean;
  createStudyRoom: (name: string, description: string) => StudyRoom;
  updateSharedNotes: (notes: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Current user defaults to Super Administrator Shamz
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_ADMIN_USER);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([INITIAL_ADMIN_USER]);
  const [telemetryLogs, setTelemetryLogs] = useState<SystemTelemetryEvent[]>([
    {
      id: 'tel-init-1',
      timestamp: 1760100000000,
      userId: 'admin_shamz',
      userName: 'Shamz',
      userRole: 'admin',
      eventType: 'admin_action',
      description: 'Super Administrator initialized CogniTwin cognitive production environment.',
    },
  ]);

  const [classroom, setClassroom] = useState<Classroom>(MOCK_CLASSROOM);
  const [studyRoom, setStudyRoom] = useState<StudyRoom>(MOCK_STUDY_ROOM);
  const [studentProgress, setStudentProgress] = useState<Record<string, ClassStudentProgress>>(MOCK_STUDENT_PROGRESS);
  const [classLeaderboard, setClassLeaderboard] = useState<LeaderboardEntry[]>(MOCK_CLASS_LEADERBOARD);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<LeaderboardEntry[]>(MOCK_GLOBAL_LEADERBOARD);

  // Initialize and hydrate real users from LocalStorage
  useEffect(() => {
    try {
      const savedUsersJson = localStorage.getItem('cognitwin_registered_users_v2');
      if (savedUsersJson) {
        const parsed = JSON.parse(savedUsersJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAllUsers(parsed);
        }
      }

      const savedLogsJson = localStorage.getItem('cognitwin_telemetry_events_v2');
      if (savedLogsJson) {
        const parsedLogs = JSON.parse(savedLogsJson);
        if (Array.isArray(parsedLogs)) {
          setTelemetryLogs(parsedLogs);
        }
      }

      const activeUserId = localStorage.getItem('cognitwin_active_user_id');
      if (activeUserId) {
        const usersList: UserProfile[] = savedUsersJson ? JSON.parse(savedUsersJson) : [INITIAL_ADMIN_USER];
        const match = usersList.find(u => u.id === activeUserId);
        if (match) {
          setCurrentUser(match);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  const persistUsers = (users: UserProfile[]) => {
    setAllUsers(users);
    try {
      localStorage.setItem('cognitwin_registered_users_v2', JSON.stringify(users));
    } catch {
      // Fallback
    }
  };

  const persistLogs = (logs: SystemTelemetryEvent[]) => {
    setTelemetryLogs(logs);
    try {
      localStorage.setItem('cognitwin_telemetry_events_v2', JSON.stringify(logs.slice(0, 100)));
    } catch {
      // Fallback
    }
  };

  const logTelemetryEvent = (
    eventType: SystemTelemetryEvent['eventType'],
    description: string,
    metadata?: Record<string, any>
  ) => {
    const newEvent: SystemTelemetryEvent = {
      id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
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
    password = 'password',
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
      schoolName: role === 'student' ? 'Enrolled Student' : role === 'teacher' ? 'Faculty Lead' : 'Self-Directed Scholar',
      streakDays: 1,
      streakFrozen: false,
      totalXP: 100,
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
    };

    const updatedList = [...allUsers, newUser];
    persistUsers(updatedList);
    setCurrentUser(newUser);

    try {
      localStorage.setItem('cognitwin_active_user_id', newUser.id);
    } catch {}

    // Add to leaderboard
    setClassLeaderboard(prev => [
      ...prev,
      {
        rank: prev.length + 1,
        userId: newUser.id,
        userName: newUser.name,
        userAvatar: newUser.avatar,
        schoolOrClass: newUser.schoolName || 'Enrolled',
        xp: newUser.totalXP,
        masteredCount: 0,
        streakDays: newUser.streakDays,
      },
    ]);

    logTelemetryEvent('signup', `New real ${role} account registered: ${name} (${email})`);

    return { success: true, message: 'Registration successful!', user: newUser };
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

    logTelemetryEvent('login', `User logged in: ${user.name} (${user.role})`);
    return { success: true, message: 'Signed in successfully!' };
  };

  const logoutUser = () => {
    // Return to Super Admin Shamz
    setCurrentUser(INITIAL_ADMIN_USER);
    try {
      localStorage.setItem('cognitwin_active_user_id', INITIAL_ADMIN_USER.id);
    } catch {}
    logTelemetryEvent('admin_action', 'Session switched to Super Admin Shamz');
  };

  const deleteUser = (userId: string) => {
    if (userId === INITIAL_ADMIN_USER.id) return; // Cannot delete super admin
    const target = allUsers.find(u => u.id === userId);
    const updated = allUsers.filter(u => u.id !== userId);
    persistUsers(updated);

    if (currentUser.id === userId) {
      setCurrentUser(INITIAL_ADMIN_USER);
    }

    logTelemetryEvent('admin_action', `Admin deleted user record: ${target?.name || userId}`);
  };

  const switchUser = (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      try {
        localStorage.setItem('cognitwin_active_user_id', userId);
      } catch {}
      logTelemetryEvent('login', `Switched active role to: ${user.name} (${user.role})`);
    }
  };

  /**
   * Core Bayesian Knowledge Tracing Engine Hook
   */
  const recordBKTInteraction = (
    kcId: string,
    isCorrect: boolean,
    activityType: 'flashcard' | 'quiz' | 'simulation_lab' | 'concept_review',
    xpReward = 50,
    details = ''
  ): { newP_L: number; newlyMastered: boolean } => {
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

    const targetKC = classroom.knowledgeComponents.find(k => k.id === kcId) || MOCK_KCS.find(k => k.id === kcId);
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
      logTelemetryEvent(
        'bkt_mastery_updated',
        `Cognitive Mastery Reached: ${targetKC?.title || kcId} by ${currentUser.name} (P_L: ${(nextP_L * 100).toFixed(0)}%)`
      );
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

    const updatedMasteryByKC = {
      ...currentProgress.masteryByKC,
      [kcId]: updatedMastery,
    };

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

    setStudentProgress(prev => ({
      ...prev,
      [studentId]: updatedStudentProgress,
    }));

    setCurrentUser(prev => ({
      ...prev,
      totalXP: prev.totalXP + earnedXP,
    }));

    // Update in allUsers list
    persistUsers(allUsers.map(u => (u.id === currentUser.id ? { ...u, totalXP: u.totalXP + earnedXP } : u)));

    // Update Leaderboard
    setClassLeaderboard(prev =>
      prev
        .map(entry =>
          entry.userId === studentId
            ? {
                ...entry,
                xp: entry.xp + earnedXP,
                masteredCount: kcValues.filter(k => k.isMastered).length,
              }
            : entry
        )
        .sort((a, b) => b.xp - a.xp)
        .map((entry, idx) => ({ ...entry, rank: idx + 1 }))
    );

    logTelemetryEvent(
      activityType === 'simulation_lab' ? 'simulation_test' : 'flashcard_review',
      `${currentUser.name} practiced ${targetKC?.title || kcId}: ${isCorrect ? 'SUCCESS' : 'ATTEMPT'} (+${earnedXP} XP, BKT: ${(nextP_L * 100).toFixed(0)}%)`
    );

    return { newP_L: nextP_L, newlyMastered };
  };

  const uploadStudyMaterial = async (title: string, rawText: string): Promise<StudyMaterial> => {
    const newDocId = `mat-${Date.now()}`;
    const newMaterial: StudyMaterial = {
      id: newDocId,
      title: title || 'Custom Uploaded Lecture Notes',
      fileName: `${(title || 'Document').replace(/\s+/g, '_')}.pdf`,
      fileType: 'pdf',
      uploadedAt: new Date().toISOString().split('T')[0],
      authorId: currentUser.id,
      summary: `Automated cognitive synthesis for "${title}": Covers core electronic components, potential gradients, circuit protection topologies, and mathematical modeling.`,
      keyInsights: [
        'Component safety thresholds must be respected to prevent thermal diode degradation.',
        'Dynamic resistance characteristics dictate series protection requirements.',
        'BKT cognitive tracking guarantees mastery before advanced node analysis.',
      ],
      briefingDoc: `Executive briefing generated for "${title}". Grounded strictly in uploaded curriculum.`,
      audioOverview: [
        {
          id: `aud-${Date.now()}-1`,
          speaker: 'Host (Alex)',
          text: `Welcome to the deep dive on ${title}. Today we are breaking down the core principles!`,
          pitch: 1.1,
          rate: 1.05,
        },
        {
          id: `aud-${Date.now()}-2`,
          speaker: 'Expert (Dr. Sam)',
          text: `It is an essential topic. Let us examine how the mathematical formulas relate to the practical workbench simulations.`,
          pitch: 0.9,
          rate: 0.95,
        },
      ],
      extractedKCs: ['kc-voltage', 'kc-current', 'kc-ohms-law', 'kc-led-resistors'],
      contentSnippet: rawText || 'Extracted document corpus for AI grounding and Socratic dialogue...',
    };

    const autoCard: Flashcard = {
      id: `fc-auto-${Date.now()}`,
      kcId: 'kc-led-resistors',
      front: `[AI Generated from "${title}"]: What is the formula for sizing an LED current-limiting resistor?`,
      back: 'R = (V_supply - V_forward) / I_target, where V_forward is the LED diode drop.',
      hint: 'Remember to subtract the diode forward voltage drop from the source rail.',
      citation: `${newMaterial.fileName}, §AI-Extracted`,
    };

    const autoQuiz: QuizQuestion = {
      id: `q-auto-${Date.now()}`,
      kcId: 'kc-ohms-law',
      prompt: `[AI Quiz from "${title}"]: If source voltage is 12V and total circuit resistance is 600Ω, what is the current in mA?`,
      options: ['20 mA', '50 mA', '2 mA', '72 mA'],
      correctIndex: 0,
      explanation: 'I = V / R = 12 / 600 = 0.020 A = 20 mA.',
      citation: `${newMaterial.fileName}, §AI-Extracted`,
    };

    setClassroom(prev => ({
      ...prev,
      materials: [newMaterial, ...prev.materials],
      flashcards: [autoCard, ...prev.flashcards],
      quizzes: [autoQuiz, ...prev.quizzes],
    }));

    logTelemetryEvent('class_created', `${currentUser.name} uploaded and processed study material: "${title}"`);

    return newMaterial;
  };

  const createClassroom = (name: string, subject: string, isPublic: boolean): Classroom => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newClass: Classroom = {
      id: `class-${Date.now()}`,
      name,
      subject,
      code,
      isPublic,
      teacherId: currentUser.id,
      teacherName: currentUser.name,
      description: `Interactive digital twin classroom for ${name}.`,
      materials: MOCK_STUDY_MATERIALS,
      knowledgeComponents: MOCK_KCS,
      flashcards: MOCK_FLASHCARDS,
      quizzes: MOCK_QUIZZES,
      enrolledStudentIds: [currentUser.id],
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClassroom(newClass);
    logTelemetryEvent('class_created', `${currentUser.name} created classroom "${name}" with code [${code}]`);
    return newClass;
  };

  const joinClassroomByCode = (code: string): boolean => {
    if (code.toUpperCase() === classroom.code.toUpperCase() || code.toUpperCase() === 'OHM-402') {
      if (!classroom.enrolledStudentIds.includes(currentUser.id)) {
        setClassroom(prev => ({
          ...prev,
          enrolledStudentIds: [...prev.enrolledStudentIds, currentUser.id],
        }));
      }
      logTelemetryEvent('login', `${currentUser.name} enrolled in classroom ${classroom.name}`);
      return true;
    }
    return false;
  };

  const createStudyRoom = (name: string, description: string): StudyRoom => {
    const code = 'LOU-' + Math.floor(100 + Math.random() * 900);
    const newRoom: StudyRoom = {
      id: `room-${Date.now()}`,
      name,
      code,
      hostId: currentUser.id,
      hostName: currentUser.name,
      description,
      isLive: true,
      activeMembers: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'Host',
          currentAction: 'Hosting Study Lounge',
        },
      ],
      materials: classroom.materials,
      sharedNotes: 'Welcome to our collaborative study session! Upload materials or test circuits together.',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setStudyRoom(newRoom);
    logTelemetryEvent('class_created', `${currentUser.name} opened peer study lounge "${name}" with code [${code}]`);
    return newRoom;
  };

  const updateSharedNotes = (notes: string) => {
    setStudyRoom(prev => ({
      ...prev,
      sharedNotes: notes,
    }));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        telemetryLogs,
        switchUser,
        registerUser,
        loginUser,
        logoutUser,
        deleteUser,
        logTelemetryEvent,
        classroom,
        studyRoom,
        studentProgress,
        classLeaderboard,
        globalLeaderboard,
        recordBKTInteraction,
        uploadStudyMaterial,
        createClassroom,
        joinClassroomByCode,
        createStudyRoom,
        updateSharedNotes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
