import type { DemoEmail, StudentProfile } from '@/types';

// ============================================================================
// JAKE MARTINEZ - The Silent Struggler
// ============================================================================

export const JAKE: StudentProfile = {
  id: 'jake-martinez',
  name: 'Jake Martinez',
  email: 'jake.martinez@school.edu',
  grade: 11,
  photoUrl: 'https://ui-avatars.com/api/?name=Jake+Martinez&background=4F7942&color=fff&size=128',
  currentGrade: 'B+',
  previousGrade: 'A-',

  baseline: {
    attendanceRate: 0.98,
    avgGrade: 91,
    avgWordCount: 45,
    participationLevel: 8,
    typicalBehavior: 'Engaged, asks thoughtful questions, consistent performer'
  },

  interactions: [
    {
      date: 'Oct 24, 8:15 AM',
      type: 'email',
      sentiment: 'neutral',
      summary: 'Quick question',
      details: 'Hey Ms. J,\n\nWhen is the test?\n\n- Jake'
    },
    {
      date: 'Oct 20, 2:30 PM',
      type: 'email',
      sentiment: 'anxious',
      summary: 'Extension request',
      details: 'Hi Ms. Johnson,\n\nI know the essay is due tomorrow, but would it be possible to get an extension until Monday? I\'ve been dealing with some stuff.\n\nThanks,\nJake'
    },
    {
      date: 'Oct 15, 10:00 AM',
      type: 'grade',
      sentiment: 'neutral',
      summary: 'Civil War Quiz: 60% (usual: 90%)',
      details: 'Quiz appeared rushed and incomplete'
    },
    {
      date: 'Oct 12',
      type: 'absence',
      sentiment: 'neutral',
      summary: 'Absence #3',
      details: 'Unexcused absence - unusual pattern'
    },
    {
      date: 'Oct 10',
      type: 'absence',
      sentiment: 'neutral',
      summary: 'Absence #2',
      details: 'Back-to-back absences'
    },
    {
      date: 'Oct 5',
      type: 'absence',
      sentiment: 'neutral',
      summary: 'Absence #1',
      details: 'First absence this semester'
    },
    {
      date: 'Sep 28, 4:20 PM',
      type: 'email',
      sentiment: 'positive',
      summary: 'Lecture feedback',
      details: 'Hi Ms. Johnson,\n\nI really enjoyed your lecture on the Civil War today. The primary source analysis was fascinating, especially the soldier letters. It made the human cost of war really tangible.\n\nDo you have any recommendations for books on this topic? I\'d love to read more.\n\nThanks,\nJake'
    },
    {
      date: 'Sep 25',
      type: 'grade',
      sentiment: 'positive',
      summary: 'Essay #1: 94%',
      details: 'Excellent analysis, strong thesis'
    }
  ],

  redFlags: [
    {
      type: 'attendance',
      severity: 'high',
      description: '3 absences in past 2 weeks',
      deviation: '+1400%',
      context: 'Jake usually has perfect attendance (0.2 absences/week baseline)'
    },
    {
      type: 'grade',
      severity: 'medium',
      description: 'Quiz score dropped to 60%',
      deviation: '-33%',
      context: 'Recent quiz performance significantly below his 90% average'
    },
    {
      type: 'communication',
      severity: 'medium',
      description: 'Message became unusually brief',
      deviation: '-82%',
      context: 'Current email is 8 words vs his typical 45-word thoughtful messages'
    }
  ],

  aiInsight: {
    pattern: 'Silent Struggle',
    confidence: 89,
    analysis: `Jake is showing classic signs of a high-performing student who is struggling but doesn't want to admit it.

The combination of declining grades, increased absences, and brief communication suggests he's overwhelmed and doesn't know how to ask for help.

Supporting Evidence:
• High-performing student with sudden decline
• Communication becoming more distant/brief
• Multiple small cries for help (absences, extension request)
• Asking obvious question = testing if you notice

This is NOT about the test date.
This is a student signaling they need help but doesn't know how to ask.`,

    // NEW: Confidence breakdown for transparency
    confidenceBreakdown: [
      {
        factor: 'Communication Pattern',
        weight: 0.95,
        confidence: 95,
        reasoning: 'Brief message (-82% words) vs high baseline engagement'
      },
      {
        factor: 'Attendance Anomaly',
        weight: 0.85,
        confidence: 85,
        reasoning: '3 absences in 2 weeks (baseline: 0.2/week = +1400%)'
      },
      {
        factor: 'Grade Trajectory',
        weight: 0.72,
        confidence: 72,
        reasoning: '60% quiz (usual: 90%), declining trend visible'
      },
      {
        factor: 'Temporal Clustering',
        weight: 0.65,
        confidence: 65,
        reasoning: 'Multiple signals within 2-week window = crisis pattern'
      }
    ],

    // NEW: Outcome projections for stakes
    projectedOutcomes: {
      withoutIntervention: {
        probability: 68,
        outcome: 'Student drops out or fails class',
        timeframe: '4-8 weeks',
        evidenceBase: 'Balfanz & Byrnes (2012) - Early warning indicators'
      },
      withIntervention: {
        probability: 78,
        outcome: 'Student responds positively, re-engages with coursework',
        timeframe: '24-48 hours',
        evidenceBase: 'Meta-analysis: Teacher check-ins reduce dropout risk by 40%'
      },
      windowOfOpportunity: '24-48 hours optimal for intervention'
    },

    // NEW: Timeline data for visualization
    engagementTimeline: [
      { date: 'Sep 15', score: 95, status: 'excellent' },
      { date: 'Sep 22', score: 92, status: 'excellent' },
      { date: 'Sep 30', score: 82, status: 'good' },
      { date: 'Oct 5', score: 70, status: 'good' },
      { date: 'Oct 10', score: 55, status: 'concerning' },
      { date: 'Oct 15', score: 45, status: 'concerning' },
      { date: 'Oct 20', score: 28, status: 'crisis' },
      { date: 'Oct 24', score: 12, status: 'crisis' }
    ],

    recommendation: {
      approach: 'Warm Check-In',
      reasoning: 'Answer the question, but use this as an opening to show you notice and care',
      draftEmail: `Hi Jake,

Friday at 2pm in Room 204 (syllabus p.3).

I noticed you've missed a few classes recently—everything okay? You're normally so on top of things. Stop by office hours if you want to catch up on anything before the test.

- Ms. J`,
      expectedOutcome: '78% chance positive response. If no response in 24h: Flag for counselor check-in'
    }
  }
};

// ============================================================================
// SARAH CHEN - The Frustrated Perfectionist
// ============================================================================

export const SARAH: StudentProfile = {
  id: 'sarah-chen',
  name: 'Sarah Chen',
  email: 'sarah.chen@school.edu',
  grade: 11,
  photoUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=8B5A3C&color=fff&size=128',
  currentGrade: 'B+',
  previousGrade: 'A',

  baseline: {
    attendanceRate: 1.0,
    avgGrade: 95,
    avgWordCount: 85,
    participationLevel: 9,
    typicalBehavior: 'Perfectionist, high-achieving, anxious about grades'
  },

  interactions: [
    {
      date: 'Oct 24, 7:00 AM',
      type: 'email',
      sentiment: 'frustrated',
      summary: 'RE: RE: Grade Question (3rd email)',
      details: 'Ms. Johnson,\n\nI still don\'t understand why I got a B+ on this essay. You said my thesis was strong and my evidence was thorough. What specifically made it not an A?\n\nI\'ve read the rubric multiple times and I can\'t figure out what I\'m missing. This is really frustrating because I spent 12 hours on this.\n\nSarah'
    },
    {
      date: 'Oct 23, 7:30 PM',
      type: 'email',
      sentiment: 'anxious',
      summary: 'Parent email: Concerned about stress',
      details: 'From: Mrs. Chen\n\nHi Ms. Johnson, I wanted to reach out because Sarah has been very stressed about school lately. She\'s been staying up past midnight working on assignments and is very anxious about her grades. Is everything okay in class?'
    },
    {
      date: 'Oct 12, 3:45 PM',
      type: 'email',
      sentiment: 'anxious',
      summary: 'RE: Grade Question',
      details: 'Thanks for explaining the rubric. I think I understand better now, but I\'m still a bit confused about the "analysis depth" section...'
    }
  ],

  redFlags: [
    {
      type: 'communication',
      severity: 'high',
      description: 'Tone shifted from polite to frustrated',
      deviation: 'Significant',
      context: 'Third email about same topic with escalating frustration'
    },
    {
      type: 'engagement',
      severity: 'medium',
      description: 'Parent contacted about stress',
      deviation: 'Unusual',
      context: 'Parent reports Sarah staying up past midnight, high anxiety'
    }
  ],

  aiInsight: {
    pattern: 'Perfectionist Frustration',
    confidence: 92,
    analysis: `Sarah is a high-achieving perfectionist who is feeling unheard. You've explained the rubric twice, but she's still not satisfied. Her frustration is escalating (note the tone shift) and her parent is now involved due to stress.

This is beyond email now - she needs face-to-face conversation to feel heard and understood.`,

    confidenceBreakdown: [
      {
        factor: 'Communication Escalation',
        weight: 0.95,
        confidence: 95,
        reasoning: '3rd email on same topic, tone shifted from polite to frustrated'
      },
      {
        factor: 'Parental Involvement',
        weight: 0.88,
        confidence: 88,
        reasoning: 'Parent reports stress, staying up past midnight'
      },
      {
        factor: 'Perfectionist Pattern',
        weight: 0.92,
        confidence: 92,
        reasoning: 'High achiever (95% baseline) obsessing over B+ grade'
      }
    ],

    projectedOutcomes: {
      withoutIntervention: {
        probability: 45,
        outcome: 'Student burnout, grade obsession worsens',
        timeframe: '2-4 weeks',
        evidenceBase: 'Perfectionist students who feel unheard often disengage'
      },
      withIntervention: {
        probability: 85,
        outcome: 'Student feels heard, develops healthier grade perspective',
        timeframe: '24-48 hours after face-to-face meeting',
        evidenceBase: 'In-person meetings 3x more effective for perfectionists vs email'
      },
      windowOfOpportunity: 'Before parent-teacher conference is scheduled'
    },

    engagementTimeline: [
      { date: 'Sep 15', score: 98, status: 'excellent' },
      { date: 'Sep 22', score: 96, status: 'excellent' },
      { date: 'Sep 30', score: 94, status: 'excellent' },
      { date: 'Oct 5', score: 88, status: 'good' },
      { date: 'Oct 10', score: 75, status: 'good' },
      { date: 'Oct 15', score: 62, status: 'concerning' },
      { date: 'Oct 20', score: 48, status: 'concerning' },
      { date: 'Oct 24', score: 35, status: 'crisis' }
    ],

    recommendation: {
      approach: 'Direct Intervention',
      reasoning: 'Email isn\'t working. She needs in-person time to process feedback.',
      draftEmail: `Hi Sarah,

I can see you're really frustrated about this grade, and I want to make sure you understand the feedback. Let's sit down together and go through your essay and the rubric side-by-side.

Can you come to office hours tomorrow (Tue 3-4pm) or Wednesday (2-3pm)?

- Ms. J`,
      expectedOutcome: 'Meeting will help her process feedback. She needs to feel heard, not just explained to.'
    }
  }
};

// ============================================================================
// MIGUEL RODRIGUEZ - ESL Student
// ============================================================================

export const MIGUEL: StudentProfile = {
  id: 'miguel-rodriguez',
  name: 'Miguel Rodriguez',
  email: 'miguel.rodriguez@school.edu',
  grade: 10,
  photoUrl: 'https://ui-avatars.com/api/?name=Miguel+Rodriguez&background=2C5F6F&color=fff&size=128',
  currentGrade: 'B',
  previousGrade: 'B',

  baseline: {
    attendanceRate: 0.96,
    avgGrade: 82,
    avgWordCount: 30,
    participationLevel: 6,
    typicalBehavior: 'Steady worker, improving English skills, shy in class'
  },

  interactions: [
    {
      date: 'Oct 18, 3:30 PM',
      type: 'email',
      sentiment: 'neutral',
      summary: 'Question about assignment',
      details: 'Hi Ms. Johnson,\n\nI am not sure I understand the essay question. Can you explain what you mean by "analyze the political implications"?\n\nThank you,\nMiguel'
    }
  ],

  redFlags: [
    {
      type: 'engagement',
      severity: 'low',
      description: 'Academic language comprehension challenge',
      deviation: 'Moderate',
      context: 'Struggling with abstract terminology in assignments'
    }
  ],

  aiInsight: {
    pattern: 'Language Barrier',
    confidence: 85,
    analysis: `Miguel is working hard but struggling with academic English. His parent prefers Spanish communication. This is a great opportunity to use Lingo for culturally-adapted translation.`,

    confidenceBreakdown: [
      {
        factor: 'Language Comprehension',
        weight: 0.85,
        confidence: 85,
        reasoning: 'Struggles with academic terminology ("political implications")'
      },
      {
        factor: 'Engagement Pattern',
        weight: 0.72,
        confidence: 72,
        reasoning: 'Steady performer (82% avg) asking for clarification = positive signal'
      },
      {
        factor: 'Communication Style',
        weight: 0.80,
        confidence: 80,
        reasoning: 'Polite, formal tone indicates effort despite language barrier'
      }
    ],

    projectedOutcomes: {
      withoutIntervention: {
        probability: 55,
        outcome: 'Student completes assignment below potential',
        timeframe: '1 week (assignment deadline)',
        evidenceBase: 'ESL students who struggle with vocabulary often submit weaker work'
      },
      withIntervention: {
        probability: 82,
        outcome: 'Student understands concept, performs at capability level',
        timeframe: 'Immediate (once clarification provided)',
        evidenceBase: 'Simplified language + examples = 40% improvement for ESL students'
      },
      windowOfOpportunity: 'Next 48 hours before assignment due'
    },

    engagementTimeline: [
      { date: 'Sep 15', score: 78, status: 'good' },
      { date: 'Sep 22', score: 80, status: 'good' },
      { date: 'Sep 30', score: 82, status: 'good' },
      { date: 'Oct 5', score: 81, status: 'good' },
      { date: 'Oct 10', score: 79, status: 'good' },
      { date: 'Oct 15', score: 80, status: 'good' },
      { date: 'Oct 20', score: 78, status: 'good' },
      { date: 'Oct 24', score: 77, status: 'good' }
    ],

    recommendation: {
      approach: 'Warm Check-In',
      reasoning: 'Simplify language, provide example, offer Spanish communication for parents',
      draftEmail: `Hi Miguel,

Good question! "Analyze the political implications" means: Explain how this event changed government or power.

For example: The Civil War changed how states and federal government share power.

Let me know if this helps!

- Ms. J`,
      expectedOutcome: 'Simplifying academic language will help. Consider offering Spanish resources for parents.'
    }
  }
};

// ============================================================================
// EMMA JOHNSON - The False Positive Test (Calibration Proof)
// ============================================================================

export const EMMA: StudentProfile = {
  id: 'emma-johnson',
  name: 'Emma Johnson',
  email: 'emma.johnson@school.edu',
  grade: 11,
  photoUrl: 'https://ui-avatars.com/api/?name=Emma+Johnson&background=6B7280&color=fff&size=128',
  currentGrade: 'B+',
  previousGrade: 'B+',

  baseline: {
    attendanceRate: 0.98,
    avgGrade: 87,
    avgWordCount: 12, // Emma is naturally brief
    participationLevel: 7,
    typicalBehavior: 'Consistent, concise communicator, steady performer'
  },

  interactions: [
    {
      date: 'Oct 24, 9:00 AM',
      type: 'email',
      sentiment: 'neutral',
      summary: 'Quick clarification',
      details: 'Hey Ms. J, is the essay 5 or 6 pages? Thx!'
    },
    {
      date: 'Oct 18',
      type: 'grade',
      sentiment: 'positive',
      summary: 'Quiz: 88%',
      details: 'Consistent with her average'
    },
    {
      date: 'Oct 10, 2:15 PM',
      type: 'email',
      sentiment: 'neutral',
      summary: 'Absence note',
      details: 'Hi Ms. J, had dentist appt today. Got notes from Sarah. Thx!'
    }
  ],

  redFlags: [], // NO red flags despite short email - this is the point!

  aiInsight: {
    pattern: 'Normal Behavior',
    confidence: 91,
    analysis: `Emma's brief email (8 words) matches her baseline communication style (12 words average).

Her attendance, grades, and engagement are all stable. This is consistent with her typical pattern of concise, efficient communication.

No intervention needed - this is just Emma being Emma.`,

    confidenceBreakdown: [
      {
        factor: 'Communication Consistency',
        weight: 0.91,
        confidence: 91,
        reasoning: '8 words vs 12 word baseline = normal for Emma (-33% vs Jake\'s -82%)'
      },
      {
        factor: 'Academic Stability',
        weight: 0.90,
        confidence: 90,
        reasoning: 'Recent quiz 88% matches her 87% average perfectly'
      },
      {
        factor: 'Behavioral Pattern',
        weight: 0.92,
        confidence: 92,
        reasoning: 'Concise communicator by nature - no deviation from baseline'
      }
    ],

    projectedOutcomes: {
      withoutIntervention: {
        probability: 5,
        outcome: 'No negative outcome - student functioning normally',
        timeframe: 'N/A',
        evidenceBase: 'Stable patterns indicate healthy engagement'
      },
      withIntervention: {
        probability: 95,
        outcome: 'Quick answer maintains positive student-teacher relationship',
        timeframe: 'Immediate',
        evidenceBase: 'Efficient communication matches student preference'
      },
      windowOfOpportunity: 'Standard response time (24 hours)'
    },

    // Timeline shows stability (no decline)
    engagementTimeline: [
      { date: 'Sep 15', score: 85, status: 'good' },
      { date: 'Sep 22', score: 87, status: 'good' },
      { date: 'Sep 30', score: 86, status: 'good' },
      { date: 'Oct 5', score: 88, status: 'good' },
      { date: 'Oct 10', score: 85, status: 'good' },
      { date: 'Oct 15', score: 87, status: 'good' },
      { date: 'Oct 20', score: 86, status: 'good' },
      { date: 'Oct 24', score: 87, status: 'good' }
    ],

    recommendation: {
      approach: 'Quick Answer',
      reasoning: 'Student is functioning normally, brief reply is appropriate',
      draftEmail: `Hi Emma,\n\n6 pages max (5 is fine too).\n\n- Ms. J`,
      expectedOutcome: 'Standard interaction, no follow-up needed'
    }
  }
};

// ============================================================================
// DEMO INBOX - Current emails in teacher's inbox
// ============================================================================

export const DEMO_INBOX: DemoEmail[] = [
  {
    id: 'email-001',
    from: 'sarah.chen@school.edu',
    studentId: 'sarah-chen',
    subject: 'RE: RE: Grade Question',
    body: SARAH.interactions[0].details!,
    timestamp: '2024-10-24T07:00:00Z',
    wordCount: 58,
    sentiment: 'frustrated'
  },
  {
    id: 'email-002',
    from: 'jake.martinez@school.edu',
    studentId: 'jake-martinez',
    subject: 'Quick question',
    body: JAKE.interactions[0].details!,
    timestamp: '2024-10-24T08:15:00Z',
    wordCount: 8,
    sentiment: 'neutral'
  },
  {
    id: 'email-003',
    from: 'miguel.rodriguez@school.edu',
    studentId: 'miguel-rodriguez',
    subject: 'Question about assignment',
    body: MIGUEL.interactions[0].details!,
    timestamp: '2024-10-18T15:30:00Z',
    wordCount: 23,
    sentiment: 'neutral'
  },
  {
    id: 'email-004',
    from: 'emma.johnson@school.edu',
    studentId: 'emma-johnson',
    subject: 'Quick Q',
    body: EMMA.interactions[0].details!,
    timestamp: '2024-10-24T09:00:00Z',
    wordCount: 8,
    sentiment: 'neutral'
  }
];

// ============================================================================
// STUDENT MAP - Quick lookup by ID
// ============================================================================

export const STUDENTS: Record<string, StudentProfile> = {
  'jake-martinez': JAKE,
  'sarah-chen': SARAH,
  'miguel-rodriguez': MIGUEL,
  'emma-johnson': EMMA  // NEW: Calibration test case
};
