import { QuestionAnswer } from '../../Learn/core/ai-backend.service';

export const BOW_QUIZ_SESSION_KEY = 'LifeSuite.BowQuiz.questions';

export interface BowQuizQuestion {
  question: string;
  answers: Array<{ id: string; label: string; text: string; correct: boolean }>;
}

export function toBowQuizQuestion(item: QuestionAnswer): BowQuizQuestion | null {
  const choices = String(item.answer ?? '')
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
  const parsed = choices as BowQuizQuestion['answers'];
  if (new Set(parsed.map(choice => choice.label)).size !== 4) return null;
  if (parsed.filter(choice => choice.correct).length !== 1) return null;
  return { question: item.question, answers: parsed };
}
