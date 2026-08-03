import {ChangeDetectionStrategy, Component} from '@angular/core'
import {NgFor} from '@angular/common'
import {IonicModule} from '@ionic/angular'
import {TranslateService} from '@ngx-translate/core'
import {LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES} from '../supported-languages'

@Component({
  selector: 'app-language-switcher',
  templateUrl: './language-switcher.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [IonicModule, NgFor],
})
export class LanguageSwitcherComponent {

  languages = SUPPORTED_LANGUAGES

  constructor(
    public translate: TranslateService,
  ) {
  }

  get currentLang(): string {
    return this.translate.currentLang() ?? this.translate.fallbackLang() ?? 'en'
  }

  onChangeLanguage(event: CustomEvent) {
    const lang = event.detail.value as string
    this.translate.use(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
  }
}
