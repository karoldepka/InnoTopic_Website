import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlagsComponent } from '../../countries/flags/flags.component';
import { Language } from "../language-experience";
import { LanguageExperiences } from "../language-experience-data";
import { ThreeDTextComponent } from 'src/app/shared/threed-text/threed-text.component';

@Component({
  selector: 'app-language-section',
  imports: [CommonModule, FlagsComponent, ThreeDTextComponent],
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
