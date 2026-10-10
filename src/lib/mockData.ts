import {
  UserProfile,
  Classroom,
  KnowledgeComponent,
  Flashcard,
  QuizQuestion,
  StudyMaterial,
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
      id: 'b_cognitive_architect',
      name: 'Cognitive Engine Architect',
      description: 'Full supervisory authority over BKT telemetry and classes',
      icon: '⚡',
      category: 'lab',
    },
  ],
  registeredAt: '2026-10-10',
  enrolledClassIds: ['class-canonical-circuits'],
  interests: ['Electronics', 'Physics', 'Digital Twins', 'AI Learning'],
};

// System Users Map starts with ONLY the admin account.
export const INITIAL_USERS: UserProfile[] = [INITIAL_ADMIN_USER];

export const CANONICAL_KCS: KnowledgeComponent[] = [
  {
    id: 'kc-voltage',
    code: 'ELEC-101',
    title: 'Electric Potential & Voltage (V)',
    description: 'Understanding electrical pressure, potential difference, and energy per unit charge (Joules/Coulomb).',
    prerequisites: [],
    difficulty: 'beginner',
    unit: 'Unit 1: Fundamentals of Charge',
    bktParams: { ...DEFAULT_BKT_PARAMS, pL0: 0.35, pT: 0.22 },
    simulation: {
      id: 'sim-voltage',
      title: 'Potential Difference Visualizer',
      description: 'Adjust the DC voltage source and observe charge displacement across terminals.',
      type: 'physics',
      targetObjective: 'Configure a 9V source to establish electrical gradient',
      xpReward: 150,
    },
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
    simulation: {
      id: 'sim-current',
      title: 'Coulomb Flow Simulation',
      description: 'Observe charge carriers traveling through a conductive medium.',
      type: 'physics',
      targetObjective: 'Close the loop to initiate current flow',
      xpReward: 150,
    },
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
    simulation: {
      id: 'sim-ohms-law',
      title: 'Ohm’s Law Dynamic Ratio Solver',
      description: 'Verify V = I * R live by adjusting resistance and measuring current response.',
      type: 'electronics',
      targetObjective: 'Tune resistance until current reaches exactly 20mA',
      expectedOutcomeFormula: 'I = V / R',
      xpReward: 250,
    },
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
    simulation: {
      id: 'sim-led-protection',
      title: 'Diode Burnout Prevention Lab',
      description: 'Balance a 9V source with a red LED (2.0V drop) so current remains in the safe zone (18-24 mA).',
      type: 'electronics',
      targetObjective: 'Prevent diode junction thermal meltdown by inserting proper resistance',
      expectedOutcomeFormula: 'R = (V_source - V_f) / I_target',
      xpReward: 350,
    },
  },
];

export const CANONICAL_MATERIALS: StudyMaterial[] = [
  {
    id: 'mat-canonical-circuits',
    title: 'Principles of Direct Current & Resistors (Canonical Class Notes)',
    fileName: 'DC_Circuits_and_Semiconductors.pdf',
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
        text: "Which you can verify live right now in the Topic Simulation Lab before risking any physical parts!",
        pitch: 1.1,
        rate: 1.05,
      },
    ],
    extractedKCs: ['kc-voltage', 'kc-current', 'kc-ohms-law', 'kc-led-resistors'],
    contentSnippet:
      'CHAPTER 2: RESISTIVE CIRCUITS & DIODES\n\nWhen electrons traverse a resistive medium, potential energy is converted to thermal dissipation: P = I^2 * R. For semiconductor devices like Light Emitting Diodes (LEDs), the behavior is strictly non-linear. Below the forward threshold voltage (approx 2.0V for gallium arsenide red LEDs), zero conduction occurs. Once exceeded, current escalates asymptotically. Therefore, a series current-limiting resistor is mandatory.',
  },
];

export const CANONICAL_FLASHCARDS: Flashcard[] = [
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
];

export const CANONICAL_QUIZZES: QuizQuestion[] = [
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

/**
 * Canonical Default Class provided by developer to all students
 */
export const CANONICAL_CLASSROOM: Classroom = {
  id: 'class-canonical-circuits',
  name: 'AP Physics: DC Circuits & Digital Twin Lab',
  subject: 'Electronics & Applied Physics',
  topic: 'Ohm’s Law & Diode Protection',
  code: 'OHM-402',
  isPublic: true,
  requiresApproval: false,
  teacherId: 'admin_shamz',
  teacherName: 'Shamz (Platform Lead)',
  description: 'The canonical institutional classroom: master voltage, current, Ohm’s Law, and hands-on diode circuit simulations.',
  materials: CANONICAL_MATERIALS,
  knowledgeComponents: CANONICAL_KCS,
  flashcards: CANONICAL_FLASHCARDS,
  quizzes: CANONICAL_QUIZZES,
  enrolledStudentIds: ['admin_shamz'],
  pendingStudentIds: [],
  createdAt: '2026-10-10',
};

export const INITIAL_STUDY_ROOMS: StudyRoom[] = [
  {
    id: 'room-circuits-lounge',
    name: 'Circuit Scholars Peer Lounge',
    code: 'PEER-101',
    hostId: 'admin_shamz',
    hostName: 'Shamz',
    description: 'Real-time collaborative study lounge with peer group chat and shared simulation workbench.',
    isLive: true,
    activeMembers: [
      {
        id: 'admin_shamz',
        name: 'Shamz',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        role: 'Host',
        currentAction: 'Hosting Peer Group',
      },
    ],
    messages: [
      {
        id: 'msg-1',
        senderId: 'admin_shamz',
        senderName: 'Shamz',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'Welcome to the peer study session! Ask questions, compare circuit values, and collaborate.',
        timestamp: 1760100000000,
      },
    ],
    materials: CANONICAL_MATERIALS,
    sharedNotes: 'Study Goal: Calculate current-limiting resistors and simulate circuit response.',
    createdAt: '2026-10-10',
  },
];

export const MOCK_LAB_CHALLENGES = [
  {
    id: 'ch-1',
    title: 'Level 1: 9V Battery & Red LED Protection',
    description: 'Calculate and set the exact resistance needed to safely operate a 2.0V red LED from a 9V source within optimal brightness (15–25 mA).',
    targetGoal: 'Calculate and set the exact resistance needed to safely operate a 2.0V red LED from a 9V source within optimal brightness (15–25 mA).',
    hintFormula: 'R = (V_supply - V_diode) / I_target = (9V - 2.0V) / 0.020A = 350 Ω',
    sourceVoltage: 9,
    ledColor: 'red' as const,
    targetCurrentMinMa: 15,
    targetCurrentMaxMa: 25,
    kcId: 'kc-led-resistors',
    xpReward: 60,
  },
  {
    id: 'ch-2',
    title: 'Level 2: 5V USB Circuit & Blue Diode Tuning',
    description: 'Tuning for a 3.1V blue LED from a 5V USB supply. Target safe current between 12–22 mA without dimming out.',
    targetGoal: 'Tuning for a 3.1V blue LED from a 5V USB supply. Target safe current between 12–22 mA without dimming out.',
    hintFormula: 'R = (5V - 3.1V) / 0.018A = 105 Ω',
    sourceVoltage: 5,
    ledColor: 'blue' as const,
    targetCurrentMinMa: 12,
    targetCurrentMaxMa: 22,
    kcId: 'kc-led-resistors',
    xpReward: 80,
  },
  {
    id: 'ch-3',
    title: 'Level 3: 12V High-Power Automotive Circuit',
    description: 'High voltage input! Calibrate resistance to prevent thermal avalanche breakdown on a 2.2V green diode (target 18–26 mA).',
    targetGoal: 'High voltage input! Calibrate resistance to prevent thermal avalanche breakdown on a 2.2V green diode (target 18–26 mA).',
    hintFormula: 'R = (12V - 2.2V) / 0.022A = 445 Ω',
    sourceVoltage: 12,
    ledColor: 'green' as const,
    targetCurrentMinMa: 18,
    targetCurrentMaxMa: 26,
    kcId: 'kc-led-resistors',
    xpReward: 100,
  },
];

