// Core email types
export interface Email {
  id: string;
  from: string;
  subject: string;
  body: string;
  timestamp: Date;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  currentGrade: string;
  riskScore: number;
}

// Demo data types
export interface DemoEmail {
  id: string;
  from: string;
  studentId: string;
  subject: string;
  body: string;
  timestamp: string;
  wordCount: number;
  sentiment: 'positive' | 'neutral' | 'anxious' | 'frustrated';
  read?: boolean;
  starred?: boolean;
  // Live demo fields (for real-time analysis)
  isLiveDemo?: boolean;
  liveAnalysis?: {
    sentiment: string;
    riskScore: number;
    riskReasoning: string;
    communicationPattern: string;
    redFlags: string[];
    recommendedApproach: string;
    reasoning: string;
    usedFallback?: boolean;
  };
  aiAnalysis?: {
    riskScore: number;
    sentiment: string;
    pattern: string;
    redFlags: string[];
  };
}

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  grade: number;
  photoUrl: string;
  currentGrade: string;
  previousGrade: string;
  baseline: Baseline;
  interactions: Interaction[];
  redFlags: RedFlag[];
  aiInsight: AIInsight;
}

export interface Baseline {
  attendanceRate: number;
  avgGrade: number;
  avgWordCount: number;
  participationLevel: number;
  typicalBehavior: string;
}

export interface Interaction {
  date: string;
  type: 'email' | 'grade' | 'absence' | 'participation' | 'teacher_response';
  sentiment: 'positive' | 'neutral' | 'anxious' | 'frustrated';
  summary: string;
  details?: string;
}

export interface RedFlag {
  type: 'attendance' | 'grade' | 'communication' | 'engagement';
  severity: 'high' | 'medium' | 'low';
  description: string;
  deviation: string;
  context: string;
}

export interface AIInsight {
  pattern: string;
  confidence: number;
  analysis: string;

  // NEW: Confidence breakdown for transparency
  confidenceBreakdown?: Array<{
    factor: string;
    weight: number;
    confidence: number;
    reasoning: string;
  }>;

  // NEW: Outcome projections for stakes
  projectedOutcomes?: {
    withoutIntervention: {
      probability: number;
      outcome: string;
      timeframe: string;
      evidenceBase: string;
    };
    withIntervention: {
      probability: number;
      outcome: string;
      timeframe: string;
      evidenceBase: string;
    };
    windowOfOpportunity: string;
  };

  // NEW: Timeline data for visualization
  engagementTimeline?: Array<{
    date: string;
    score: number;
    status: 'excellent' | 'good' | 'concerning' | 'crisis';
  }>;

  recommendation: ResponseStrategy;
}

export interface ResponseStrategy {
  approach: 'Quick Answer' | 'Warm Check-In' | 'Direct Intervention';
  reasoning: string;
  draftEmail: string;
  expectedOutcome: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  formality: number;
  warmth: number;
  commonPhrases: string[];
}

// AI Analysis types
export interface EmailAnalysis {
  riskScore: number;
  pattern: string;
  confidence: number;
  hiddenMeaning: string;
  evidence: string[];
  recommendation: string;
}

export interface CachedAnalysis {
  emailId: string;
  studentId: string;
  analysis: EmailAnalysis;
  generatedAt: string;
}
