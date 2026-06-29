import {Injectable, Injector} from '@angular/core';
import {Theme, ThemeId, themesArray, themesMapById} from './themes.data'
import {ThemeCalculator, ThemeOptions} from './ThemeCalculator'
import {BaseService} from '../base.service'
import {environment} from '../../../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ThemeService extends BaseService {

  themeCalculator = new ThemeCalculator()

  brightnessPercent = 50

  public get themes() {
    return themesArray.filter(theme => {
      if (theme.disabled) {
        return false
      }
      // const showExperimentalThemes = true; // this.feat.showExperimental
      const showExperimentalThemes = environment.showExperimentalThemes; // this.feat.showExperimental
      if ( ! showExperimentalThemes ) {
        return ! theme.experimental
      }
      return true
    })
  }

  public get randomThemes() {
    return this.themes.filter(theme => !theme.excludeFromRandom)
  }

  // public themeId: any/*keyof typeof themes*/ = 'Porzeczki Agrest'
  public theme: Theme = this.getRandomTheme()

  constructor(
    injector: Injector
  ) {
    super(injector)
    this.applyRandomTheme()
  }

  setThemeId(themeId: ThemeId) {
    this.setTheme(themesMapById[themeId])
  }

  setTheme(theme: Theme) {
    console.log('setTheme', theme)
    this.theme = theme
    this.themeCalculator.updateColors(this.getThemeOptions())
  }

  setBrightnessPercent(brightnessPercent: number) {
    this.brightnessPercent = brightnessPercent
    console.log(`this.brightnessPercent`, this.brightnessPercent)
    this.updateColors()
  }

  public getRandomTheme() {
    // TODO maybe update e.g. 1-2 times per week, to not get bored with all of them too quickly
    // "panic button" "craving fun" could also force new theme
    // later could have checkboxes to exclude themes from random picking
    const themes = this.randomThemes
    const themeIndex = Math.floor(Math.min(Math.random(), 0.999) * themes.length)
    return themes[themeIndex]
  }

  applyRandomTheme() {
    const themes = this.randomThemes
    if (themes.length <= 1) {
      if (themes[0] && themes[0] !== this.theme) {
        this.setTheme(themes[0])
      }
      return
    }

    let newTheme = this.getRandomTheme()
    while (newTheme === this.theme) {
      newTheme = this.getRandomTheme()
    }
    this.setTheme(newTheme)
  }

  applyNextTheme() {
    // written by GH Copilot; nice:
    const currentIndex = this.themes.indexOf(this.theme)
    const nextIndex = (currentIndex + 1) % this.themes.length
    const nextId = this.themes[nextIndex]
    this.setTheme(nextId)
  }

  public getThemeOptions(): ThemeOptions {
    const opts = new ThemeOptions()
    // opts.theme = this.getTheme()
    // opts.brightnessPercent = this.brightnessPercent

    return {
      ... opts,
      theme: this.theme,
      brightnessPercent: this.brightnessPercent
    }
  }


  private updateColors() {
    this.themeCalculator.updateColors(this.getThemeOptions())
  }
}
