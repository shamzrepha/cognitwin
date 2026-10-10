import { BKTParameters, StudentKCMastery } from './bkt';

export type UserRole = 'admin' | 'teacher' | 'student' | 'individual';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  password?: string;
  schoolName?: string;
  streakDays: number;
  streakFrozen: boolean;
  totalXP: number;
  level: number;
  badges: Badge[];
  registeredAt?: string;
  enrolledClassIds?: string[];
  interests?: string[];
  aiTokensUsed?: number;
  aiTokensQuota?: number; // e.g. 50,000 for students/individuals, 200,000 for teachers, unlimited for admin
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'mastery' | 'streak' | 'lab' | 'social';
}

export interface TopicSimulation {
  id: string;
  title: string;
  description: string;
  type: 'electronics' | 'logic' | 'physics';
  targetObjective: string;
  initialComponents?: any[];
  expectedOutcomeFormula?: string;
  xpReward: number;
}

export interface KnowledgeComponent {
  id: string;
  code: string;
  title: string;
  description: string;
  prerequisites: string[]; // IDs of prerequisite KCs
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  unit: string;
  bktParams: BKTParameters;
  labSimulationType?: 'electronics' | 'general';
  simulation?: TopicSimulation; // In-class, per-topic simulation
}

export interface Flashcard {
  id: string;
  kcId: string;
  front: string;
  back: string;
  hint?: string;
  sourceDocId?: string;
  citation?: string;
}

export interface QuizQuestion {
  id: string;
  kcId: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  citation?: string;
}

export interface AudioOverviewDialog {
  id: string;
  speaker: 'Host (Alex)' | 'Expert (Dr. Sam)';
  text: string;
  pitch: number;
  rate: number;
}

export interface StudyMaterial {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'text' | 'notes';
  uploadedAt: string;
  authorId: string;
  summary: string;
  briefingDoc?: string;
  keyInsights: string[];
  audioOverview?: AudioOverviewDialog[];
  extractedKCs: string[];
  contentSnippet: string;
}

export interface Classroom {
  id: string;
  name: string;
  subject: string;
  topic: string;
  code: string; // 6-digit join code
  isPublic: boolean;
  requiresApproval: boolean;
  teacherId: string;
  teacherName: string;
  description: string;
  materials: StudyMaterial[];
  knowledgeComponents: KnowledgeComponent[];
  flashcards: Flashcard[];
  quizzes: QuizQuestion[];
  enrolledStudentIds: string[];
  pendingStudentIds?: string[];
  createdAt: string;
}

export interface PeerMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
}

export interface StudyRoom {
  id: string;
  name: string;
  code: string;
  hostId: string;
  hostName: string;
  description: string;
  isLive: boolean;
  activeMembers: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    currentAction: string;
  }[];
  messages: PeerMessage[];
  materials: StudyMaterial[];
  sharedNotes: string;
  createdAt: string;
}

export interface ClassStudentProgress {
  studentId: string;
  studentName: string;
  studentAvatar: string;
  overallMasteryPct: number;
  masteryByKC: Record<string, StudentKCMastery>;
  streakDays: number;
  totalXP: number;
  lastActive: string;
  struggleRisk: {
    level: 'low' | 'medium' | 'high';
    flaggedKCs: string[];
  };
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar: string;
  schoolOrClass: string;
  xp: number;
  masteredCount: number;
  streakDays: number;
}

export interface SystemTelemetryEvent {
  id: string;
  timestamp: number;
  userId: string;
  userName: string;
  userRole: string;
  eventType:
    | 'signup'
    | 'login'
    | 'simulation_test'
    | 'led_burnout'
    | 'challenge_complete'
    | 'flashcard_review'
    | 'bkt_mastery_updated'
    | 'class_created'
    | 'peer_message'
    | 'admin_action';
  description: string;
  metadata?: Record<string, any>;
}
