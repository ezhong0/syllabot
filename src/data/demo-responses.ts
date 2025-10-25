/**
 * Pre-scripted AI responses for demo
 * Shows all 5 YC tools working together
 */

export interface DemoResponse {
  emailId: string;
  studentId: string;
  response: string;
  spanishTranslation?: string;
  toolContributions: {
    claude: string;
    slate: string;
    s2: string;
    lingo: string;
    cactus: string;
  };
  generatedAt?: string;
}

export const DEMO_RESPONSES: Record<string, DemoResponse> = {
  // Jake Martinez - High risk student with declining communication
  'jake-test-question': {
    emailId: 'jake-test-question',
    studentId: 'jake-martinez',
    response: `Hi Jake,

Thanks for reaching out. The test is scheduled for Friday at 2pm in our usual classroom. It will cover chapters 12-14 from the Civil War unit we've been studying.

I noticed your recent emails have been briefer than usual - is everything okay? I'm here if you'd like to talk or if you need any support with the material. Sometimes life gets overwhelming, and I want you to know I'm on your team.

Would you like to meet during office hours on Thursday to review the material together? I think it could really help, and we can go at whatever pace works for you.

Looking forward to hearing from you.

- Ms. Johnson`,
    toolContributions: {
      claude: 'Detected 88% decline in communication length. Recommended warm, supportive check-in approach.',
      slate: 'Adjusted tone for high-risk student (7/10 risk score) - added empathy and support offers.',
      s2: 'Logged AI response generation event with student risk metadata.',
      lingo: 'English response optimized for clarity and warmth.',
      cactus: 'Generated response in 47ms using mobile-optimized batch processing.',
    },
  },

  // Emma Johnson - Low risk, high achieving student
  'emma-office-hours': {
    emailId: 'emma-office-hours',
    studentId: 'emma-johnson',
    response: `Hi Emma,

Great question! I'd be happy to discuss the AP exam format with you.

I'm available:
- Tuesday 3-4pm
- Thursday 3-4pm
- Friday 2-3pm

Any of those times work for you? Feel free to bring specific questions you'd like to cover.

Looking forward to our chat!

- Ms. Johnson`,
    toolContributions: {
      claude: 'Recognized high-achieving student pattern. Generated efficient, supportive response.',
      slate: 'Standard professional tone for low-risk student (1/10 risk score).',
      s2: 'Logged successful student engagement event.',
      lingo: 'Clear, concise English appropriate for advanced student.',
      cactus: 'Generated in 43ms - optimized for quick turnaround.',
    },
  },

  // Miguel Rodriguez - English language learner, needs translation
  'miguel-homework-help': {
    emailId: 'miguel-homework-help',
    studentId: 'miguel-rodriguez',
    response: `Hi Miguel,

I'd be happy to help you with the homework! The assignment focuses on the Civil War timeline we discussed in class this week.

Can you tell me which specific part is confusing? Is it:
- The dates and events?
- The essay questions?
- Something else?

I'm available after school today (3-4pm) or tomorrow (3-4pm) if you'd like to go over it together.

- Ms. Johnson`,
    spanishTranslation: `Hola Miguel,

¡Con mucho gusto te ayudo con la tarea! El trabajo se enfoca en la cronología de la Guerra Civil que discutimos en clase esta semana.

¿Puedes decirme qué parte específica te resulta confusa? ¿Es:
- Las fechas y eventos?
- Las preguntas del ensayo?
- ¿Algo más?

Estoy disponible después de clases hoy (3-4pm) o mañana (3-4pm) si quieres repasarlo juntos.

- Sra. Johnson`,
    toolContributions: {
      claude: 'Generated clear, structured response with specific options for clarity.',
      slate: 'Supportive tone for moderate-risk student (4/10 risk score).',
      s2: 'Logged multilingual student interaction for analytics.',
      lingo: 'Culturally-adapted Spanish translation with formal teacher-parent register (95% confidence).',
      cactus: 'Dual-language generation in 51ms - ready for offline use.',
    },
  },

  // Sarah Chen - Anxious high-achiever
  'sarah-essay-extension': {
    emailId: 'sarah-essay-extension',
    studentId: 'sarah-chen',
    response: `Hi Sarah,

Thank you for letting me know. I completely understand - sometimes we need a bit more time to do our best work.

I can extend your deadline to Monday at 11:59pm. This should give you the weekend to finish without rushing.

I want you to know that your essays are always thoughtful and well-researched. Sometimes perfectionism can add extra pressure - remember that "good enough" is often excellent work. You're doing great!

Let me know if you need anything else.

- Ms. Johnson`,
    toolContributions: {
      claude: 'Detected anxiety pattern in high-achieving student. Recommended reassurance and realistic expectations.',
      slate: 'Warm, supportive tone for anxious student (medium risk 4/10).',
      s2: 'Logged extension request with anxiety flag for pattern tracking.',
      lingo: 'English response with careful language to reduce anxiety.',
      cactus: 'Generated empathetic response in 49ms.',
    },
  },
};

/**
 * Get demo response for a given email ID
 */
export function getDemoResponse(emailId: string): DemoResponse | null {
  return DEMO_RESPONSES[emailId] || null;
}

/**
 * Simulate AI response generation with realistic delay
 */
export async function generateDemoResponse(
  emailId: string
): Promise<DemoResponse | null> {
  // Simulate processing time (1.5-2 seconds for dramatic effect)
  await new Promise((resolve) => setTimeout(resolve, 1800));

  const response = getDemoResponse(emailId);
  if (response) {
    return {
      ...response,
      generatedAt: new Date().toLocaleTimeString(),
    };
  }

  return null;
}
