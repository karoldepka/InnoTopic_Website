import { readFileSync } from 'fs';
import type { ExistingCategory } from './types.js';
import { cleanText, slugifyId } from './utils.js';

const DEFAULT_CATEGORIES: ExistingCategory[] = [
  { id: 'rust', title: 'Rust', path: 'Programming > Rust', aliases: ['rustlang'] },
  { id: 'rust-ownership', title: 'Ownership and Borrowing', path: 'Programming > Rust > Ownership and Borrowing', aliases: ['borrow checker', 'borrowing'] },
  { id: 'rust-lifetimes', title: 'Lifetimes', path: 'Programming > Rust > Lifetimes', aliases: ['lifetime annotations'] },
  { id: 'rust-traits', title: 'Traits', path: 'Programming > Rust > Traits', aliases: ['trait bounds', 'trait objects'] },
  { id: 'rust-error-handling', title: 'Error Handling', path: 'Programming > Rust > Error Handling', aliases: ['result', 'option'] },
  { id: 'rust-concurrency', title: 'Concurrency', path: 'Programming > Rust > Concurrency', aliases: ['send sync', 'threads'] },
  { id: 'rust-async', title: 'Async Rust', path: 'Programming > Rust > Async Rust', aliases: ['tokio', 'future'] },
  { id: 'rust-unsafe', title: 'Unsafe Rust', path: 'Programming > Rust > Unsafe Rust', aliases: ['unsafe', 'ffi'] },
  { id: 'python', title: 'Python', path: 'Programming > Python', aliases: [] },
  { id: 'interview-questions', title: 'Interview Questions', path: 'Career > Interview Questions', aliases: ['interview prep'] },
];

function normalize(raw: unknown, index: number): ExistingCategory | null {
  if (typeof raw === 'string') {
    const title = cleanText(raw);
    if (!title) return null;
    return { id: slugifyId(title, `category-${index + 1}`), title, aliases: [] };
  }
  if (typeof raw !== 'object' || !raw) return null;
  const obj = raw as Record<string, unknown>;
  const title = cleanText(String(obj['title'] ?? obj['name'] ?? obj['path'] ?? ''));
  if (!title) return null;
  const id = cleanText(String(obj['id'] ?? slugifyId(title, `category-${index + 1}`)));
  const rawAliases = obj['aliases'];
  const aliases = Array.isArray(rawAliases)
    ? rawAliases.map(a => cleanText(String(a))).filter(Boolean)
    : typeof rawAliases === 'string' ? [cleanText(rawAliases)].filter(Boolean) : [];
  return { id, title, path: cleanText(String(obj['path'] ?? '')) || null, aliases };
}

export function loadExistingCategories(): ExistingCategory[] {
  let raw: unknown[] | null = null;
  try {
    const json = process.env['LIFESUITE_EXISTING_CATEGORIES_JSON'];
    const file = process.env['LIFESUITE_EXISTING_CATEGORIES_FILE'];
    if (json) raw = JSON.parse(json);
    else if (file) raw = JSON.parse(readFileSync(file, 'utf-8'));
  } catch {
    raw = null;
  }
  const source = Array.isArray(raw) ? raw : DEFAULT_CATEGORIES;
  return source
    .map((r, i) => normalize(r, i))
    .filter((c): c is ExistingCategory => c !== null);
}

export function categoriesToPromptJson(cats: ExistingCategory[]): string {
  return JSON.stringify(cats.slice(0, 300));
}
