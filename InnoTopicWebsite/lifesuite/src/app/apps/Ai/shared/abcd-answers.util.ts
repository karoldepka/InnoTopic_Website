import { QuestionAnswer } from '../../Learn/core/ai-backend.service';

export const BOW_QUIZ_SESSION_KEY = 'LifeSuite.BowQuiz.questions';

export interface BowQuizQuestion {
  categoryId: string;
  categoryPath: string;
  question: string;
  answers: Array<{ id: string; label: string; text: string; correct: boolean }>;
}

export type AbcdAnswerChoice = BowQuizQuestion['answers'][number];

/** Removes correctness markers from ABCD choice text before it is saved as regular Learn Q&A. */
export function stripAbcdCorrectnessMarkers(answer: string): string {
  return answer
    .split(/(\r?\n)/)
    .map(line => /^\s*[A-D][.)]\s*/i.test(line) ? line.replace(/[✓✔]/g, '').replace(/\s+$/, '') : line)
    .join('')
}

/** Parses four ABCD choices and preserves the correct choice as metadata. */
export function toAbcdAnswerChoices(answer: string | undefined | null): AbcdAnswerChoice[] | null {
  const choices = String(answer ?? '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const match = line.match(/^([A-D])[.)]\s*(.*)$/i);
      if (!match) return null;
      const label = match[1].toUpperCase();
      const rawText = match[2].trim();
      return {
        id: label.toLowerCase(),
        label,
        text: rawText.replace(/^[✓✔]\s*|\s*[✓✔]\s*$/g, '').trim(),
        correct: /[✓✔]/.test(rawText),
      };
    });

  if (choices.length !== 4 || choices.some(choice => !choice)) return null;
  const parsed = choices as AbcdAnswerChoice[];
  if (new Set(parsed.map(choice => choice.label)).size !== 4) return null;
  return parsed.filter(choice => choice.correct).length === 1 ? parsed : null;
}

export function toBowQuizQuestion(item: QuestionAnswer): BowQuizQuestion | null {
  const answers = toAbcdAnswerChoices(item.answer);
  return answers
    ? { categoryId: item.categoryId, categoryPath: item.categoryPath, question: item.question, answers }
    : null;
}
