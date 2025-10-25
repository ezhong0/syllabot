/**
 * Email templates for live demo
 * Judges can select these or write their own
 */

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  studentId: string;
  studentName: string;
  subject: string;
  body: string;
  expectedRisk: string;
  expectedSentiment: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'jake-brief',
    name: 'Brief Question (High Risk)',
    description: 'Very short email - classic disengagement pattern',
    studentId: 'jake-martinez',
    studentName: 'Jake Martinez',
    subject: 'Question',
    body: 'When is the test?',
    expectedRisk: '8/10 - Very brief communication',
    expectedSentiment: 'neutral',
  },
  {
    id: 'jake-extension',
    name: 'Last-Minute Extension (High Risk)',
    description: 'Anxious, last-minute request with minimal detail',
    studentId: 'jake-martinez',
    studentName: 'Jake Martinez',
    subject: 'Extension?',
    body: 'Hi Ms. J,\n\nCan I get an extension on the essay? I\'ve been really busy.\n\n- Jake',
    expectedRisk: '7/10 - Brief + last-minute request',
    expectedSentiment: 'anxious',
  },
  {
    id: 'sarah-perfectionist',
    name: 'Anxious Perfectionist (Medium Risk)',
    description: 'Over-explaining, anxiety markers, perfectionism',
    studentId: 'sarah-chen',
    studentName: 'Sarah Chen',
    subject: 'Extension Request - Really Sorry',
    body: `Hi Ms. Johnson,

I'm really sorry to ask this but I need more time on the essay. I've been working on it every night but I'm not sure if it's good enough yet. I want to make sure my analysis is thorough and my arguments are strong.

I know the deadline is tomorrow but could I please have until Monday? I promise it will be much better with more time. I'm really stressed about this and want to do my best work.

Thank you so much for understanding.

- Sarah`,
    expectedRisk: '5/10 - Anxiety + perfectionism',
    expectedSentiment: 'anxious',
  },
  {
    id: 'emma-proactive',
    name: 'Engaged Student (Low Risk)',
    description: 'Clear, proactive, well-written',
    studentId: 'emma-johnson',
    studentName: 'Emma Johnson',
    subject: 'AP Exam Question',
    body: `Hi Ms. Johnson,

I'd like to discuss the AP exam format during office hours this week. Specifically, I have questions about:

1. The DBQ essay structure
2. Time management strategies
3. How to approach the multiple choice section

Are you available Tuesday or Thursday after school? I can also meet Friday if those don't work.

Thanks!
- Emma`,
    expectedRisk: '1/10 - Highly engaged',
    expectedSentiment: 'positive',
  },
  {
    id: 'miguel-help',
    name: 'Needs Support (Medium Risk)',
    description: 'Asking for help, slightly vague',
    studentId: 'miguel-rodriguez',
    studentName: 'Miguel Rodriguez',
    subject: 'Help with homework',
    body: `Hi Ms. Johnson,

I need help with the homework. I don't understand the part about the Civil War timeline.

Can we meet after school?

- Miguel`,
    expectedRisk: '4/10 - Needs support',
    expectedSentiment: 'neutral',
  },
  {
    id: 'custom',
    name: 'Write Your Own',
    description: 'Compose a custom email during the demo',
    studentId: 'jake-martinez',
    studentName: 'Jake Martinez',
    subject: '',
    body: '',
    expectedRisk: 'TBD - Real-time analysis',
    expectedSentiment: 'TBD',
  },
];

/**
 * Get template by ID
 */
export function getTemplate(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Get templates for a specific student
 */
export function getTemplatesForStudent(studentId: string): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter((t) => t.studentId === studentId);
}
