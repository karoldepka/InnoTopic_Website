export interface SupportedLanguage {
  code: string
  label: string
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'pl', label: 'Polski' },
  { code: 'pt', label: 'Português' },
  { code: 'it', label: 'Italiano' },
  { code: 'ca', label: 'Català' },
]

export const DEFAULT_LANGUAGE = 'en'

export const LANGUAGE_STORAGE_KEY = 'LifeSuite_language'

export function resolveInitialLanguage(): string {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  const supportedCodes = SUPPORTED_LANGUAGES.map(l => l.code)
  if (stored && supportedCodes.includes(stored)) {
    return stored
  }
  const browserLang = (navigator.language || '').split('-')[0]
  if (supportedCodes.includes(browserLang)) {
    return browserLang
  }
  return DEFAULT_LANGUAGE
}
