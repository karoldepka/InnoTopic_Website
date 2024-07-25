import { experience, Language, LanguageLevel } from "./language-experience";

export const LanguageExperiences: Language[] = [
  new Language('Polish', experience('pl', LanguageLevel.NATIVE)),
  new Language('English', experience('us gb in ca au', LanguageLevel.PROFESSIONAL)),
  new Language('Spanish', experience('es mx co ar vz', LanguageLevel.PROFESSIONAL)),
  new Language('German', experience('de at ch', LanguageLevel.PROFESSIONAL)),
  new Language('Català', experience('es-ct es-vc', LanguageLevel.INTERMEDIATE)),
  new Language('Portuguese', experience('pt br', LanguageLevel.INTERMEDIATE)),
  new Language('French', experience('fr be', LanguageLevel.BEGINNER)),
  new Language('Italian', experience('it', LanguageLevel.BEGINNER)),
  new Language('Dutch', experience('nl be', LanguageLevel.BEGINNER)),
  new Language('Ukrainian', experience('ua', LanguageLevel.BEGINNER)),
  new Language('Russian', experience('ru ua', LanguageLevel.BEGINNER)),
  new Language('Mandarin Chinese', experience('cn', LanguageLevel.BEGINNER)),
  new Language('Arabic', experience('ma', LanguageLevel.BEGINNER)),
  new Language('Hindi', experience('in', LanguageLevel.BEGINNER)),
];
