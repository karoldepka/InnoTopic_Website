import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Language } from "../language-experience";
import { LanguageExperiences } from "../language-experience-data";

@Component({
  selector: 'app-language-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-section.component.html',
  styleUrls: ['./language-section.component.scss'],
})
export class LanguageSectionComponent  implements OnInit {

  languageExperiences: Language[] = [];

  constructor() {}

  ngOnInit() {
    this.languageExperiences = LanguageExperiences;
  }

}
