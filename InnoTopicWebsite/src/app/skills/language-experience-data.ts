import { experience, Language, LanguageLevel } from "./language-experience";

export const LanguageExperiences: Language[] = [
  new Language('Polish', experience('pl', LanguageLevel.NATIVE, "1.2em")),
  new Language('English', experience('us gb in ca au' /* au */, LanguageLevel.PROFESSIONAL, "1.2em")),
  new Language('Spanish', experience('es mx co ar' /* vz */, LanguageLevel.PROFESSIONAL, "1.2em")),
  new Language('German', experience('de at ch', LanguageLevel.PROFESSIONAL, "1.2em")),
  new Language('Català', experience('es-ct' /* es-vc */, LanguageLevel.BEGINNER, "1.2em")),
  new Language('Portuguese', experience('pt br', LanguageLevel.BEGINNER, "1.2em")),
  // new Language('French', experience('fr be', LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Italian', experience('it', LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Dutch', experience('nl be', LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Ukrainian', experience('ua', LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Russian', experience('ru' /* 'ru ua' */, LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Mandarin Chinese', experience('cn', LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Arabic', experience('ma', LanguageLevel.BEGINNER, "0.8rem")),
  // new Language('Hindi', experience('in', LanguageLevel.BEGINNER, "0.8rem")),
];
