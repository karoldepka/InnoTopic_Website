import {Component, ChangeDetectionStrategy, OnInit, signal} from '@angular/core'
import {NgIf, NgClass, AsyncPipe, NgFor, DatePipe} from '@angular/common'
import {IonicModule} from '@ionic/angular'
import {UntypedFormControl, ReactiveFormsModule} from '@angular/forms'
import {Subscription, map} from 'rxjs'
import {JournalEntryItemsService} from '../core/journal-entries.service'
import {JournalEntry} from '../models/JournalEntry'
import {stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {AiBackendService} from '../../Learn/core/ai-backend.service'
import {JournalAiAdviceSettingsOdmService, JOURNAL_AI_ADVICE_SETTINGS_ID} from './journal-ai-advice-settings-odm.service'
import {JournalAiAdviceSettings} from './JournalAiAdviceSettings'
import {AiAdviceOdmService} from '../../../libs/AppFedShared/ai-advice/ai-advice-odm.service'
import {OdmTimestampToDatePipe} from '../../../libs/AppFedShared/odm/odm-timestamp-to-date.pipe'
import {odmTimestampToDate} from '../../../libs/AppFedShared/odm/utils'

/** Scopes the shared AiAdvice collection to just this feature's own history - see AiAdvice's
 * `source` field doc comment. */
const AI_ADVICE_SOURCE = 'journal'
const MAX_RECENT_ADVICE_SHOWN = 5

interface JournalAdviceHistoryEntry {
  whenCreated: string
  text: string
}

interface JournalAdviceResponse {
  advice: string
  modelName?: string
  truncated?: boolean
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

const DEFAULT_MAX_DAYS_HISTORY = 30
const DEFAULT_MAX_ENTRIES_HISTORY = 30
const LOCAL_STORAGE_KEY = 'LifeSuite_JournalAiAdviceSettings'

/** GH #137: "get AI advice" popover - lets the user pick how much journal history to send (both
 * settings synced local+server, see JournalAiAdviceSettingsOdmService), then asks the backend for
 * advice grounded in that history. Now an open-ended back-and-forth rather than one-shot: the
 * model may ask a clarifying question instead of (or before) advising, and the user can keep
 * replying - see `messages`/`sendReply()`. The backend itself stays stateless (see
 * journal-advice.ts's own comment), so every request replays the full conversation so far. */
@Component({
  selector: 'app-journal-ai-advice',
  templateUrl: './journal-ai-advice.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./journal-ai-advice.component.sass'],
  imports: [IonicModule, ReactiveFormsModule, NgIf, NgClass, NgFor, AsyncPipe, DatePipe, OdmTimestampToDatePipe],
})
export class JournalAiAdviceComponent implements OnInit {

  formControls = {
    maxDaysHistory: new UntypedFormControl(DEFAULT_MAX_DAYS_HISTORY),
    maxEntriesHistory: new UntypedFormControl(DEFAULT_MAX_ENTRIES_HISTORY),
  }

  // Signals rather than plain fields (NG0100 fix): getAdvice() below can flip these from an async
  // callback that settles fast enough (e.g. an immediate network failure) to land inside Angular's
  // dev-mode double-check window for the same CD cycle that already read the old value - signals
  // are safe against that class of ExpressionChangedAfterItHasBeenCheckedError by design.
  adviceLoading = signal(false)
  messages = signal<ConversationMessage[]>([])
  adviceError = signal('')

  replyControl = new UntypedFormControl('')

  /** Held only while a request is in flight, so stopAdvice() can unsubscribe it - Angular's
   * HttpClient cancels the underlying request (aborts the fetch/XHR) as soon as its Observable is
   * unsubscribed, so this is the standard way to cancel an in-flight HttpClient call, no separate
   * AbortController needed (unlike the raw-fetch AI generation flows elsewhere in the Ai app). */
  private adviceSubscription?: Subscription

  private readonly settingsItem$ = this.settingsService.obtainItem$ById(JOURNAL_AI_ADVICE_SETTINGS_ID)

  /** GH #137 follow-up: advice is now persisted (local+server, via AiAdviceOdmService, same sync
   * path as any other ODM item) instead of being lost the moment this popover closes - shown here
   * newest-first so a past answer is still reachable next time this popover opens. */
  recentAdvice$ = this.aiAdviceService.localItems$.pipe(
    map(items => items
      .filter(item$ => item$.val?.source === AI_ADVICE_SOURCE)
      .slice()
      .sort((a, b) => (odmTimestampToDate(b.val?.whenCreated)?.getTime() ?? 0) - (odmTimestampToDate(a.val?.whenCreated)?.getTime() ?? 0))
      .slice(0, MAX_RECENT_ADVICE_SHOWN)
    )
  )

  constructor(
    private journalEntriesService: JournalEntryItemsService,
    private settingsService: JournalAiAdviceSettingsOdmService,
    private aiAdviceService: AiAdviceOdmService,
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

  /** Starts a fresh conversation (clearing any previous one) grounded in the current history
   * settings. Safe to call again mid-conversation - same "start over" action a fresh popover
   * open would give, just without having to close and reopen it. */
  getAdvice() {
    if (this.adviceLoading()) return
    const entries = this.currentHistoryEntries()
    if (!entries.length) {
      this.adviceError.set('No journal entries with text in that range yet.')
      this.messages.set([])
      return
    }
    this.messages.set([])
    this.sendToBackend(entries, [])
  }

  /** Continues the current conversation with the user's typed reply - e.g. answering a
   * clarifying question the model asked, or just following up on its advice. */
  sendReply() {
    if (this.adviceLoading()) return
    const replyText = ((this.replyControl.value as string) ?? '').trim()
    if (!replyText) return
    const entries = this.currentHistoryEntries()
    if (!entries.length) {
      this.adviceError.set('No journal entries with text in that range yet.')
      return
    }
    this.replyControl.setValue('')
    this.messages.update(messages => [...messages, {role: 'user', content: replyText}])
    this.sendToBackend(entries, this.messages())
  }

  private currentHistoryEntries(): JournalAdviceHistoryEntry[] {
    const maxDays = Number(this.formControls.maxDaysHistory.value) || DEFAULT_MAX_DAYS_HISTORY
    const maxEntries = Number(this.formControls.maxEntriesHistory.value) || DEFAULT_MAX_ENTRIES_HISTORY
    return this.buildHistoryEntries(maxDays, maxEntries)
  }

  /** Shared by getAdvice() (conversation: []) and sendReply() (conversation: messages so far,
   * already including the just-appended user reply) - `entries` is sent on every call, not just
   * the first, since journal-advice.ts's backend is stateless and rebuilds the conversation's
   * first message from it each time (see that file's own comment). */
  private sendToBackend(entries: JournalAdviceHistoryEntry[], conversation: ConversationMessage[]) {
    this.adviceLoading.set(true)
    this.adviceError.set('')
    this.adviceSubscription = this.aiBackend.post<JournalAdviceResponse>('/journal-advice', {entries, conversation}).subscribe({
      next: response => {
        this.messages.update(messages => [...messages, {role: 'assistant', content: response.advice}])
        this.aiAdviceService.add({
          source: AI_ADVICE_SOURCE,
          advice: response.advice,
          modelName: response.modelName,
          truncated: response.truncated,
        })
        if (response.truncated) {
          this.adviceError.set('This advice may be cut off - try again if it looks incomplete.')
        }
        this.adviceLoading.set(false)
      },
      error: e => {
        this.adviceError.set('Could not get AI advice - please try again.')
        console.error('[journal-ai-advice] generation failed', e)
        this.adviceLoading.set(false)
      },
    })
  }

  /** Cancels an in-flight getAdvice()/sendReply() call - unsubscribing aborts the underlying
   * HttpClient request, so the response (if the server ever finishes it) is simply discarded. */
  stopAdvice() {
    this.adviceSubscription?.unsubscribe()
    this.adviceSubscription = undefined
    this.adviceLoading.set(false)
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
    const textPart = [entry.general, entry.text, ...textFieldValues]
      .filter((part): part is string => !!part)
      .map(part => stripHtml(part) ?? '')
      .join('\n')
      .trim()

    // Numeric self-assessments (mood, anxiety, energy, etc. - see JournalNumericDescriptors'
    // full catalog) weren't being sent at all before, so the AI's advice couldn't ground itself
    // in any of the actual self-ratings, only whatever happened to be mentioned in free text.
    const ratingsPart = entry.getPresentCompositeFieldEntries()
      .map(([descriptor, numVal, comment]) => {
        const rating = numVal !== undefined ? `${descriptor.title}: ${numVal}` : descriptor.title
        return comment ? `${rating} (${comment})` : rating
      })
      .join(', ')

    return [textPart, ratingsPart ? `Self-ratings: ${ratingsPart}` : undefined]
      .filter((part): part is string => !!part)
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
