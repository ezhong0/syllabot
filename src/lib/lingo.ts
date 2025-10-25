/**
 * Lingo.dev integration for AI-powered translation with cultural adaptation
 * Provides culturally-adapted translation, not just word-for-word
 */

const LINGO_API_KEY = process.env.LINGO_API_KEY;
const LINGO_API_URL = 'https://api.lingo.dev/v1';

interface TranslationContext {
  relationship: 'teacher-parent' | 'teacher-student';
  purpose: 'grade_concern' | 'positive' | 'general' | 'urgent';
}

interface TranslationResult {
  translated: string;
  confidence: number;
  culturalNotes: string[];
}

/**
 * Translates text with cultural adaptation using Lingo.dev
 * Falls back gracefully if API is unavailable
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  context: TranslationContext
): Promise<TranslationResult> {
  // If no API key, return original text with fallback message
  if (!LINGO_API_KEY) {
    console.log('[Lingo] No API key configured, returning original text');
    return {
      translated: text,
      confidence: 0,
      culturalNotes: ['Translation service not configured - showing English']
    };
  }

  try {
    const response = await fetch(`${LINGO_API_URL}/translate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LINGO_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        sourceLanguage: 'en',
        targetLanguage,
        context: {
          domain: 'education',
          tone: context.relationship === 'teacher-parent' ? 'formal' : 'casual',
          purpose: context.purpose
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lingo API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    console.log('[Lingo] ✓ Translated:', targetLanguage);

    return {
      translated: data.translation || text,
      confidence: data.confidence || 0.95,
      culturalNotes: data.adaptations || []
    };
  } catch (error) {
    console.error('[Lingo] Translation failed:', error instanceof Error ? error.message : error);

    // Fallback: Return original text
    return {
      translated: text,
      confidence: 0,
      culturalNotes: ['Translation service temporarily unavailable']
    };
  }
}

/**
 * Translates email for Miguel's Spanish-speaking parent
 * Optimized for Mexican Spanish with formal teacher-parent tone
 */
export async function translateForMiguelParent(teacherMessage: string): Promise<TranslationResult> {
  return translateText(
    teacherMessage,
    'es-MX',  // Mexican Spanish
    {
      relationship: 'teacher-parent',
      purpose: 'general'
    }
  );
}

/**
 * Translates grade concern communication for parent
 */
export async function translateGradeConcern(
  message: string,
  targetLanguage: string
): Promise<TranslationResult> {
  return translateText(
    message,
    targetLanguage,
    {
      relationship: 'teacher-parent',
      purpose: 'grade_concern'
    }
  );
}

/**
 * Translates positive feedback for parent
 */
export async function translatePositiveFeedback(
  message: string,
  targetLanguage: string
): Promise<TranslationResult> {
  return translateText(
    message,
    targetLanguage,
    {
      relationship: 'teacher-parent',
      purpose: 'positive'
    }
  );
}

/**
 * Gets static example translations for demo purposes
 * Used as fallback if Lingo API is unavailable
 */
export function getStaticTranslationExample(): {
  english: string;
  spanish: string;
  culturalNotes: string[];
} {
  return {
    english: `Hi Mr. Rodriguez,

Miguel is doing well but could use some extra support with academic vocabulary. Would you like to schedule a call?

- Ms. J`,
    spanish: `Estimado Sr. Rodriguez,

Miguel está progresando bien en la clase. Me gustaría hablar con usted sobre cómo podemos apoyarlo mejor con el vocabulario académico. ¿Le gustaría que agendáramos una llamada?

Atentamente,
Sra. Johnson`,
    culturalNotes: [
      'Used formal "Estimado" instead of casual "Hola" for teacher-parent respect',
      'Changed "doing well" to "progresando bien" (progressing well) - more appropriate in Mexican educational context',
      'Added "en la clase" for clarity',
      'Reformulated as collaborative ("how we can support") rather than directive',
      'Used formal closing "Atentamente" instead of casual dash signature'
    ]
  };
}

/**
 * Common language codes supported by Lingo
 */
export const SupportedLanguages = {
  SPANISH_MEXICO: 'es-MX',
  SPANISH_SPAIN: 'es-ES',
  MANDARIN: 'zh-CN',
  FRENCH: 'fr-FR',
  VIETNAMESE: 'vi-VN',
  KOREAN: 'ko-KR',
  ARABIC: 'ar-SA',
  PORTUGUESE: 'pt-BR',
  TAGALOG: 'tl-PH',
  RUSSIAN: 'ru-RU',
} as const;

/**
 * Common contexts for educational translation
 */
export const TranslationContexts = {
  TEACHER_PARENT_FORMAL: {
    relationship: 'teacher-parent' as const,
    purpose: 'general' as const
  },
  TEACHER_STUDENT_CASUAL: {
    relationship: 'teacher-student' as const,
    purpose: 'general' as const
  },
  GRADE_DISCUSSION: {
    relationship: 'teacher-parent' as const,
    purpose: 'grade_concern' as const
  },
  POSITIVE_FEEDBACK: {
    relationship: 'teacher-parent' as const,
    purpose: 'positive' as const
  },
  URGENT_CONCERN: {
    relationship: 'teacher-parent' as const,
    purpose: 'urgent' as const
  },
} as const;
