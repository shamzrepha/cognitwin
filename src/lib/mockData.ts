import {
  UserProfile,
  Classroom,
  KnowledgeComponent,
  Flashcard,
  QuizQuestion,
  StudyMaterial,
  LabChallenge,
  StudyRoom,
  ClassStudentProgress,
  LeaderboardEntry,
} from './types';
import { DEFAULT_BKT_PARAMS } from './bkt';

/**
 * Super Administrator / Platform Owner Account
 */
export const INITIAL_ADMIN_USER: UserProfile = {
  id: 'admin_shamz',
  name: 'Shamz',
  email: 'shamzypre14@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'admin',
  schoolName: 'CogniTwin Platform Command & Super Admin',
  streakDays: 1,
  streakFrozen: false,
  totalXP: 5000,
  level: 10,
  badges: [
    {
      id: 'b_super_admin',
      name: 'Super Administrator',
      description: 'Platform Owner, Architect & System Supervisor',
      icon: '👑',
      category: 'mastery',
    },
    {
      id: 'b_circuit_master',
      name: 'Cognitive Engine Architect',
      description: 'Full supervisory authority over BKT telemetry and databases',
      icon: '⚡',
      category: 'lab',
    },
  ],
  registeredAt: '2026-10-10',
};

// Start with ONLY the Super Admin in the users database — zero fake students!
export const MOCK_USERS: Record<string, UserProfile> = {
  admin_shamz: INITIAL_ADMIN_USER,
};

export const MOCK_KCS: KnowledgeComponent[] = [
  {
    id: 'kc-voltage',
    code: 'ELEC-101',
    title: 'Electric Potential & Voltage (V)',
    description: 'Understanding electrical pressure, potential difference, and energy per unit charge (Joules/Coulomb).',
    prerequisites: [],
    difficulty: 'beginner',
    unit: 'Unit 1: Fundamentals of Charge',
    bktParams: { ...DEFAULT_BKT_PARAMS, pL0: 0.35, pT: 0.22 },
  },
  {
    id: 'kc-current',
    code: 'ELEC-102',
    title: 'Electric Current & Resistance (I & R)',
    description: 'Rate of charge flow (Amperes) and molecular opposition to electrical motion (Ohms).',
    prerequisites: ['kc-voltage'],
    difficulty: 'beginner',
    unit: 'Unit 1: Fundamentals of Charge',
    bktParams: { ...DEFAULT_BKT_PARAMS, pL0: 0.25, pT: 0.20 },
  },
  {
    id: 'kc-ohms-law',
    code: 'ELEC-103',
    title: "Ohm's Law: V = I × R",
    description: 'The fundamental linear mathematical relationship governing DC circuits, voltage drops, and current determination.',
    prerequisites: ['kc-voltage', 'kc-current'],
    difficulty: 'intermediate',
    unit: 'Unit 2: Circuit Dynamics',
    bktParams: { ...DEFAULT_BKT_PARAMS, pL0: 0.15, pT: 0.16, pG: 0.18, pS: 0.12 },
    labSimulationType: 'electronics',
  },
  {
    id: 'kc-led-resistors',
    code: 'ELEC-104',
    title: 'LED Protection & Current Limiting',
    description: 'Non-linear diode forward voltage drop (Vf) and calculating series resistor values to prevent thermal burnout.',
    prerequisites: ['kc-ohms-law'],
    difficulty: 'intermediate',
    unit: 'Unit 2: Circuit Dynamics',
    bktParams: { ...DEFAULT_BKT_PARAMS, pL0: 0.10, pT: 0.15, pG: 0.15, pS: 0.10 },
    labSimulationType: 'electronics',
  },
  {
    id: 'kc-series-parallel',
    code: 'ELEC-105',
    title: 'Series vs Parallel Networks',
    description: 'Equivalent resistance calculations: R_eq = R1 + R2 versus 1/R_eq = 1/R1 + 1/R2 and Kirchhoff laws.',
    prerequisites: ['kc-ohms-law'],
    difficulty: 'advanced',
    unit: 'Unit 3: Complex Topologies',
    bktParams: { ...DEFAULT_BKT_PARAMS, pL0: 0.08, pT: 0.12, pG: 0.12, pS: 0.14 },
    labSimulationType: 'electronics',
  },
];

export const MOCK_STUDY_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-circuits-core',
    title: 'Principles of Direct Current & Resistors (Lecture Notes & Lab Guide)',
    fileName: 'DC_Circuits_and_Semiconductors_2026.pdf',
    fileType: 'pdf',
    uploadedAt: '2026-10-10',
    authorId: 'admin_shamz',
    summary:
      'Covers electric potential difference, Ohm\'s law derivation, diode I-V characteristics, and safe resistor sizing for light-emitting diodes (LEDs). Emphasizes practical safety to avoid component burnout.',
    keyInsights: [
      'An LED has negligible internal resistance once turned on and will self-destruct if connected directly to a DC source without current limiting.',
      'To calculate the required series resistor: R = (V_source - V_forward) / I_desired.',
      'Typical red LEDs have a forward voltage drop of ~1.8V to 2.2V and safe continuous operating current between 15mA and 25mA.',
      'Ohm\'s Law states that current is directly proportional to voltage and inversely proportional to resistance: I = V / R.',
    ],
    briefingDoc:
      "Executive Briefing: Circuit Analysis & Diode Mechanics.\n\nIn modern electrical engineering, direct current circuits form the baseline for all embedded microcontrollers, sensors, and power electronics. Ohm's law (V = IR) defines the proportional relationship between electromotive force, charge flow, and opposition.\n\nCrucially, semiconductor diodes such as LEDs defy simple linear resistance: once forward conduction begins at ~2.0V, dynamic resistance collapses. Connecting an LED directly across a 9V source creates runaway overcurrent (I > 100mA), vaporizing the microscopic wire bond. By inserting a series resistance sized at R = (V_supply - V_f) / I_target (typically ~350Ω for 20mA), the circuit operates within safe thermal dissipation limits.",
    audioOverview: [
      {
        id: 'aud-1',
        speaker: 'Host (Alex)',
        text: "Welcome back to CogniTwin Audio Overview! Today we are unpacking the foundational lecture on DC circuits and current-limiting resistors.",
        pitch: 1.1,
        rate: 1.05,
      },
      {
        id: 'aud-2',
        speaker: 'Expert (Dr. Sam)',
        text: "It is great to be here Alex. The most critical intuition students need to grasp is that an LED is not like a traditional incandescent lightbulb.",
        pitch: 0.9,
        rate: 0.95,
      },
      {
        id: 'aud-3',
        speaker: 'Host (Alex)',
        text: "Right! In incandescent bulbs, the filament resists current naturally. But in a diode, once you pass that 2.0 Volt forward drop, current explodes, doesn't it?",
        pitch: 1.1,
        rate: 1.05,
      },
      {
        id: 'aud-4',
        speaker: 'Expert (Dr. Sam)',
        text: "Exactly. The diode has virtually zero dynamic resistance above its forward threshold. Without an external resistor to oppose current, the loop current surges well past 50 milliamps, and the tiny junction literally melts.",
        pitch: 0.9,
        rate: 0.95,
      },
      {
        id: 'aud-5',
        speaker: 'Host (Alex)',
        text: "And that is where the magic formula comes in: R equals source voltage minus diode voltage, all divided by target current. For a 9 Volt battery and 2 Volt LED at 20 milliamps, that is 7 divided by 0.02, which gives 350 Ohms!",
        pitch: 1.1,
        rate: 1.05,
      },
      {
        id: 'aud-6',
        speaker: 'Expert (Dr. Sam)',
        text: "Precisely 350 Ohms. In practical engineering, you would pick a standard 330 Ohm or 390 Ohm resistor from your parts tray. That keeps the current safely near 20 milliamps with beautiful illumination.",
        pitch: 0.9,
        rate: 0.95,
      },
      {
        id: 'aud-7',
        speaker: 'Host (Alex)',
        text: "Which you can verify live right now on CogniTwin's Digital Twin Workbench before you ever risk burning an actual physical component!",
        pitch: 1.1,
        rate: 1.05,
      },
    ],
    extractedKCs: ['kc-voltage', 'kc-current', 'kc-ohms-law', 'kc-led-resistors'],
    contentSnippet:
      'CHAPTER 2: RESISTIVE CIRCUITS & DIODES\n\nWhen electrons traverse a resistive medium, potential energy is converted to thermal dissipation: P = I^2 * R. For semiconductor devices like Light Emitting Diodes (LEDs), the behavior is strictly non-linear. Below the forward threshold voltage (approx 2.0V for gallium arsenide red LEDs), zero conduction occurs. Once exceeded, current escalates asymptotically. Therefore, a series current-limiting resistor is mandatory. For instance, in a 9V rail with a 2.0V LED targeting 20mA (0.020 A): R = (9V - 2.0V) / 0.020A = 7.0V / 0.020A = 350 Ohms. A standard 330 Ohm or 390 Ohm resistor provides optimal luminance without exceeding the 30mA destruction threshold.',
  },
];

export const MOCK_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    kcId: 'kc-ohms-law',
    front: "What does Ohm's Law state in mathematical form?",
    back: 'V = I × R (Voltage = Current × Resistance), meaning I = V / R and R = V / I.',
    hint: 'Think of voltage as electrical pressure pushing current through opposition.',
    citation: 'DC Circuits & Semiconductors 2026, §2.1',
  },
  {
    id: 'fc-2',
    kcId: 'kc-led-resistors',
    front: 'Why does an LED burn out instantly if hooked directly across a 9V battery with no resistor?',
    back: 'Because an LED has negligible dynamic resistance above its forward drop (~2V). Without a resistor, current surges well above 100mA, exceeding the thermal limit (typically 30mA) and destroying the diode junction.',
    hint: 'Examine what happens to I = (V_source - V_f) / R when R approaches 0.',
    citation: 'DC Circuits & Semiconductors 2026, §2.3',
  },
  {
    id: 'fc-3',
    kcId: 'kc-led-resistors',
    front: 'Given a 9V battery and a red LED with forward drop 2.0V, what resistor value achieves exactly 20mA (0.02A)?',
    back: 'R = (9V - 2.0V) / 0.02A = 7.0V / 0.02A = 350 Ω. (A 330Ω or 390Ω resistor is commonly used).',
    hint: 'Calculate the voltage drop across the resistor first: V_R = V_source - V_LED.',
    citation: 'DC Circuits & Semiconductors 2026, §2.4',
  },
  {
    id: 'fc-4',
    kcId: 'kc-voltage',
    front: 'What is electric potential difference (Voltage) in fundamental physical units?',
    back: '1 Volt = 1 Joule per Coulomb (J/C). It measures the electrical potential energy difference per unit charge.',
    hint: 'Energy divided by charge.',
    citation: 'DC Circuits & Semiconductors 2026, §1.2',
  },
  {
    id: 'fc-5',
    kcId: 'kc-current',
    front: 'What is 1 Ampere of electric current?',
    back: '1 Ampere = 1 Coulomb of charge flowing past a cross-section per second (1 C/s). In electronics, 1 mA = 0.001 A.',
    hint: 'Charge per unit time.',
    citation: 'DC Circuits & Semiconductors 2026, §1.3',
  },
];

export const MOCK_QUIZZES: QuizQuestion[] = [
  {
    id: 'q-1',
    kcId: 'kc-ohms-law',
    prompt: 'If you double the resistance in a simple DC circuit while keeping the battery voltage constant, what happens to the electric current?',
    options: [
      'The current doubles',
      'The current is halved',
      'The current stays identical',
      'The current increases quadratically',
    ],
    correctIndex: 1,
    explanation: 'From Ohm\'s Law I = V / R, current is inversely proportional to resistance. Doubling R cuts I in half.',
    citation: 'DC Circuits & Semiconductors 2026, §2.1',
  },
  {
    id: 'q-2',
    kcId: 'kc-led-resistors',
    prompt: 'You connect a 5V power supply to a 2.0V forward-voltage LED using a 100 Ω resistor. What is the circuit current, and is the LED safe?',
    options: [
      'I = 50 mA — DANGEROUS! Exceeds safe limit and burns out.',
      'I = 30 mA — At the borderline burnout limit.',
      'I = 20 mA — SAFE! Perfectly within the 15-25 mA operating zone.',
      'I = 10 mA — Safe but very dim.',
    ],
    correctIndex: 1,
    explanation: 'V_R = 5V - 2.0V = 3.0V. Current I = 3.0V / 100 Ω = 0.030 A = 30 mA. This is right at the maximum safe current threshold (30mA).',
    citation: 'DC Circuits & Semiconductors 2026, §2.4',
  },
];

export const MOCK_LAB_CHALLENGES: LabChallenge[] = [
  {
    id: 'lab-protect-led',
    title: 'Challenge 1: Protect the LED from Burnout',
    kcId: 'kc-led-resistors',
    targetGoal: 'Build a closed circuit using a 9V Battery, a series Resistor, and a Red LED. Adjust or select a resistor value such that the current is in the optimal illumination zone (18 mA to 24 mA). Prevent the LED from burning out!',
    sourceVoltage: 9,
    targetCurrentMinMa: 18,
    targetCurrentMaxMa: 24,
    ledForwardDrop: 2.0,
    maxSafeCurrentMa: 30,
    hintFormula: 'R = (V_source - V_led) / I_target = (9V - 2V) / 0.02A = 350 Ω',
    expectedResistanceRange: [290, 390],
    xpReward: 350,
  },
  {
    id: 'lab-dim-power',
    title: 'Challenge 2: Low-Power Indicator Circuit',
    kcId: 'kc-ohms-law',
    targetGoal: 'Configure the circuit to operate in energy-saving dim mode (between 5 mA and 10 mA) from a 5V source.',
    sourceVoltage: 5,
    targetCurrentMinMa: 5,
    targetCurrentMaxMa: 10,
    ledForwardDrop: 2.0,
    maxSafeCurrentMa: 30,
    hintFormula: 'R = (5V - 2V) / I_target = 3V / 0.0075A ≈ 400 Ω to 600 Ω',
    expectedResistanceRange: [300, 600],
    xpReward: 250,
  },
];

export const MOCK_CLASSROOM: Classroom = {
  id: 'class-circuits-101',
  name: 'AP Physics: DC Circuits & Digital Twin Lab',
  subject: 'Physics & Engineering',
  code: 'OHM-402',
  isPublic: true,
  teacherId: 'admin_shamz',
  teacherName: 'Shamz (Platform Admin)',
  description: 'Digital Twin classroom exploring electric potential, Ohm\'s law, semiconductor diodes, and interactive breadboard simulation.',
  materials: MOCK_STUDY_MATERIALS,
  knowledgeComponents: MOCK_KCS,
  flashcards: MOCK_FLASHCARDS,
  quizzes: MOCK_QUIZZES,
  enrolledStudentIds: [],
  createdAt: '2026-10-10',
};

export const MOCK_STUDY_ROOM: StudyRoom = {
  id: 'room-circuits-alpha',
  name: 'Midnight Electronics & Exam Prep Lounge',
  code: 'LOU-882',
  hostId: 'admin_shamz',
  hostName: 'Shamz',
  description: 'Collaborative peer study room. Live circuit simulation workbench and shared study materials.',
  isLive: true,
  activeMembers: [],
  materials: MOCK_STUDY_MATERIALS,
  sharedNotes:
    'Welcome to the live collaborative study session! Upload materials or test circuits together.',
  createdAt: '2026-10-10',
};

/**
 * Clean Real Progress Database — Zero fake students!
 * Real users will be recorded dynamically as they register and practice.
 */
export const MOCK_STUDENT_PROGRESS: Record<string, ClassStudentProgress> = {};

/**
 * Clean Real Leaderboards — Starts with the Platform Administrator
 */
export const MOCK_CLASS_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'admin_shamz',
    userName: 'Shamz (Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolOrClass: 'CogniTwin Platform Command',
    xp: 5000,
    masteredCount: 5,
    streakDays: 1,
  },
];

export const MOCK_GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    userId: 'admin_shamz',
    userName: 'Shamz (Super Admin)',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    schoolOrClass: 'CogniTwin Global Command',
    xp: 5000,
    masteredCount: 5,
    streakDays: 1,
  },
];
