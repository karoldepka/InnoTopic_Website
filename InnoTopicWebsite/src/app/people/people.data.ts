import {dictToArrayAssigningIds} from "../utils/dictionary-utils";

export const people = {
  dmilith: {
    givenNames: "Daniel",
    surnames: "Dettlaff",
    position: "#Rust expert, CTO",
  },

  karol: {
    givenNames: "Karol",
    surnames: "Depka Pradzinski",
    position: "#Rust expert, CTO",
  },

  joisco: {
    // LLM intern
  },

  jay: {

  },

  noviodelangel: {

  },

  samyak: {
    // intern
  },


  paco: {
    //  LLM intern
  },

}

export const peopleArray = dictToArrayAssigningIds<any>(people)
