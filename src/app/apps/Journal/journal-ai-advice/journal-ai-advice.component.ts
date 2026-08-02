import {Component, ChangeDetectionStrategy, OnInit} from '@angular/core'
import {NgIf} from '@angular/common'
import {IonicModule} from '@ionic/angular'
import {UntypedFormControl, ReactiveFormsModule} from '@angular/forms'
import {firstValueFrom} from 'rxjs'
import {JournalEntryItemsService} from '../core/journal-entries.service'
import {JournalEntry} from '../models/JournalEntry'
import {stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {AiBackendService} from '../../Learn/core/ai-backend.service'
import {JournalAiAdviceSettingsOdmService, JOURNAL_AI_ADVICE_SETTINGS_ID} from './journal-ai-advice-settings-odm.service'
import {JournalAiAdviceSettings} from './JournalAiAdviceSettings'

interface JournalAdviceHistoryEntry {
  whenCreated: string
  text: string
}

interface JournalAdviceResponse {
  advice: string
  modelName?: string
  truncated?: boolean
}

const DEFAULT_MAX_DAYS_HISTORY = 30
const DEFAULT_MAX_ENTRIES_HISTORY = 30
const LOCAL_STORAGE_KEY = 'LifeSuite_JournalAiAdviceSettings'

/** GH #137: "get AI advice" popover - lets the user pick how much journal history to send (both
 * settings synced local+server, see JournalAiAdviceSettingsOdmService), then asks the backend for
 * advice grounded in that history. */
@Component({
  selector: 'app-journal-ai-advice',
  templateUrl: './journal-ai-advice.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./journal-ai-advice.component.sass'],
  imports: [IonicModule, ReactiveFormsModule, NgIf],
})
export class JournalAiAdviceComponent implements OnInit {

  formControls = {
    maxDaysHistory: new UntypedFormControl(DEFAULT_MAX_DAYS_HISTORY),
    maxEntriesHistory: new UntypedFormControl(DEFAULT_MAX_ENTRIES_HISTORY),
  }

  adviceLoading = false
  adviceText = ''
  adviceError = ''

  private readonly settingsItem$ = this.settingsService.obtainItem$ById(JOURNAL_AI_ADVICE_SETTINGS_ID)

  constructor(
    private journalEntriesService: JournalEntryItemsService,
    private settingsService: JournalAiAdviceSettingsOdmService,
    private aiBackend: AiBackendService,
  ) { }

  ngOnInit() {
    // Instant, synchronous defaults (no flash while the ODM item's own DB read resolves) - the
    // server-synced value below then wins as soon as it actually loads, same "local first,
    // server confirms" pattern LocalOptionsPatchableObservable uses for its own localStorage seed.
    const fromLocalStorage = this.readLocalStorage()
    if (typeof fromLocalStorage.maxDaysHistory === 'number') {
      this.formControls.maxDaysHistory.setValue(fromLocalStorage.maxDaysHistory, {emitEvent: false})
    }
    if (typeof fromLocalStorage.maxEntriesHistory === 'number') {
      this.formControls.maxEntriesHistory.setValue(fromLocalStorage.maxEntriesHistory, {emitEvent: false})
    }

    this.settingsItem$.val$.subscribe(settings => {
      if (!settings) return
      if (typeof settings.maxDaysHistory === 'number' && this.formControls.maxDaysHistory.value !== settings.maxDaysHistory) {
        this.formControls.maxDaysHistory.setValue(settings.maxDaysHistory, {emitEvent: false})
      }
      if (typeof settings.maxEntriesHistory === 'number' && this.formControls.maxEntriesHistory.value !== settings.maxEntriesHistory) {
        this.formControls.maxEntriesHistory.setValue(settings.maxEntriesHistory, {emitEvent: false})
      }
    })

    this.formControls.maxDaysHistory.valueChanges.subscribe(value => this.onSettingChanged('maxDaysHistory', value))
    this.formControls.maxEntriesHistory.valueChanges.subscribe(value => this.onSettingChanged('maxEntriesHistory', value))
  }

  async getAdvice() {
    if (this.adviceLoading) return
    const maxDays = Number(this.formControls.maxDaysHistory.value) || DEFAULT_MAX_DAYS_HISTORY
    const maxEntries = Number(this.formControls.maxEntriesHistory.value) || DEFAULT_MAX_ENTRIES_HISTORY
    const entries = this.buildHistoryEntries(maxDays, maxEntries)

    if (!entries.length) {
      this.adviceError = 'No journal entries with text in that range yet.'
      this.adviceText = ''
      return
    }

    this.adviceLoading = true
    this.adviceError = ''
    this.adviceText = ''
    try {
      const response = await firstValueFrom(
        this.aiBackend.post<JournalAdviceResponse>('/journal-advice', {entries})
      )
      this.adviceText = response.advice
      if (response.truncated) {
        this.adviceError = 'This advice may be cut off - try again if it looks incomplete.'
      }
    } catch (e) {
      this.adviceError = 'Could not get AI advice - please try again.'
      console.error('[journal-ai-advice] generation failed', e)
    } finally {
      this.adviceLoading = false
    }
  }

  private onSettingChanged(key: keyof JournalAiAdviceSettings, value: unknown) {
    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return
    this.settingsItem$.patchThrottled({[key]: parsed} as Partial<JournalAiAdviceSettings>)
    this.writeLocalStorage(key, parsed)
  }

  /** Newest-first within the window, then re-reversed to chronological (oldest first) - matches
   * the prompt wording sent to the backend ("oldest first"). */
  private buildHistoryEntries(maxDays: number, maxEntries: number): JournalAdviceHistoryEntry[] {
    const cutoff = Date.now() - maxDays * 24 * 60 * 60 * 1000
    const allItems = this.journalEntriesService.localItems$.lastVal ?? []
    return allItems
      .map(item$ => {
        const entry = item$.val
        const when = (entry?.whenCreated ?? (entry as any)?.whenAdded)?.toDate?.() as Date | undefined
        const text = entry ? this.entryText(entry) : ''
        return when && text.trim() ? {when, text} : undefined
      })
      .filter((x): x is {when: Date; text: string} => !!x)
      .filter(x => x.when.getTime() >= cutoff)
      .sort((a, b) => b.when.getTime() - a.when.getTime())
      .slice(0, maxEntries)
      .reverse()
      .map(x => ({whenCreated: x.when.toISOString(), text: x.text}))
  }

  private entryText(entry: JournalEntry): string {
    const textFieldValues = entry.getPresentTextFieldEntries().map(([, text]) => text)
    return [entry.general, entry.text, ...textFieldValues]
      .filter((part): part is string => !!part)
      .map(part => stripHtml(part) ?? '')
      .join('\n')
      .trim()
  }

  private readLocalStorage(): Partial<JournalAiAdviceSettings> {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  }

  private writeLocalStorage(key: keyof JournalAiAdviceSettings, value: number) {
    const current = this.readLocalStorage()
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({...current, [key]: value}))
  }
}
