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

export const people = {

  karol: person({
    givenNames: "Karol",
    surnames: "Depka Pradzinski",
    position: "CEO, Chief Software Developer",
    company: companies.InnoTopic,
    // note we r using "position", not "title", as title, could be smth like PhD.
    tagline: "#Rust and #TypeScript enthusiast with a broad experience, especially in #Frontend"

  }),


  dmilith: person({
    givenNames: "Daniel",
    surnames: "Dettlaff",
    position: "#Rust expert, CTO",
  }),


  "Joisco": person({
    position: "#LLM intern specializing in #Python",
    tagline: "Finding creative solutions with #LLM-s, #Python, #Microsoft AutoGen, and #LangChain"
  }),

  jay: person({
    company: companies.InnoTopic,

  }),

  noviodelangel: person({

  }),

  samyak: person({
    position: "Part-time Intern"
  }),


  paco: person({
    position: "Part-time LLM intern"
  }),

}

export const peopleArray = dictToArrayAssigningIds<any>(people)
