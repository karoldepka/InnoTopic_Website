import {dictToArrayAssigningIds} from "../utils/dictionary-utils";

export function person(x: any) {
  return {
    get fullName(): string {
      return this.givenNames + ' ' + this.surnames
    },
    ...x /* this could overwrite fullName*/,
  }
}

export const companies = {
  InnoTopic: "InnoTopic SLU"
}

export const timezones = {
  CET: {
    utcOffset: 2 // TODO summer time and whatnot; we can fetch from some DB, but overkill ahahaha
  }
}

export const cities = {
  Malaga: {
    city: "Málaga",
    countryCodeISO3166_1Alpha2: "ES",
    coords: {
      // TODO: lat lng @Jay
    },
    timeZone: timezones.CET,
  }
}

// later this could come from db e.g. Supabase

export const people = {

  karol: person({
    givenNames: "Karol",
    surnames: "Depka Pradzinski",
    position: "CEO, Chief Software Developer",
    company: companies.InnoTopic,
    // note we r using "position", not "title", as title, could be smth like PhD.
    tagline: "#Rust and #TypeScript enthusiast with a broad experience, especially in #Frontend",
    location: cities.Malaga,
    skills: {
      Angular: { level: "expert" /* TODO unify check level */},

    }
  }),


  dmilith: person({
    givenNames: "Daniel",
    surnames: "Dettlaff",
    position: "#Rust expert, CTO",
  }),


  "Joisco": person({
    givenNames: "Joseph",
    position: "#LLM intern specializing in #Python",
    tagline: "Finding creative solutions with #LLM-s, #Python, #Ollama and #LangChain" // TODO: AutoGen when icon
  }),

  jay: person({
    company: companies.InnoTopic,

  }),

  Nekmo: person({
    position: "#Python and #Django Expert"
  }),


  noviodelangel: person({
    givenNames: "Mateusz",
    surnames: "Werpulewski",
    position: "Full Stack Developer",
    company: companies.InnoTopic,
    tagline: "#Java and #TypeScript developer with a broad experience, especially in #Backend",
    skills: {
      Java: { level: "advanced"},
      TypeScript: { level: "advanced"},
    }
  }),

  samyak: person({
    position: "Part-time Intern"
  }),


  paco: person({
    position: "Part-time LLM intern"
  }),

}

export const peopleArray = dictToArrayAssigningIds<any>(people)
