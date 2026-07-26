import {Component, HostListener, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {sortBy} from 'lodash-es'
import {LearnItemItemsService} from '../core/learn-item-items.service'
import {field, HtmlString, LearnItem, LearnItemSidesVals} from '../models/LearnItem'
import {splitAndTrim} from '../../../libs/AppFedShared/utils/stringUtils'
import {AuthService} from '../../../auth/auth.service'
import {debugLog, errorAlert} from '../../../libs/AppFedShared/utils/log'
import {UntypedFormControl} from '@angular/forms'
import {htmlToId, stripHtml} from '../../../libs/AppFedShared/utils/html-utils'
import {Subscription} from 'rxjs'
import {debounceTime, distinctUntilChanged, finalize} from 'rxjs/operators'
import {LingueeService} from '../natural-langs/linguee.service'
import {MerriamWebsterDictService} from '../natural-langs/merriam-webster-dict.service'
import { PopoverController, ToastController, IonicModule } from '@ionic/angular'
import {presentDismissableToast} from '../../../libs/AppFedShared/utils/toast-utils'
import {ListOptionsComponent} from './list-options/list-options.component'
import {ListOptions, ListOptionsData} from './list-options'
import {JournalEntryItemsService} from '../../Journal/core/journal-entries.service'
import {LocalOptionsPatchableObservable} from '../core/options.service'
import {isNullishOrEmptyOrBlank} from '../../../libs/AppFedShared/utils/utils'
import { Router, RouterLink } from '@angular/router'
import {importanceDescriptors, importanceDescriptorsArray} from '../models/fields/importance.model'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {LearnItem$} from '../models/LearnItem$'
import {SelectionManager} from './SelectionManager'
import {ListProcessing} from './list-processing'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import {LearnStatsService} from '../core/learn-stats.service'

import {AiBackendService} from '../core/ai-backend.service'
import {ItemProcessingService} from '../core/item-processing.service'
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';
import { WhatNextButtonComponent } from '../../../shared/what-next-button/what-next-button.component';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { SearchOrAddTextEditorComponent } from './search-or-add-text-editor/search-or-add-text-editor.component';
import { SelectionInfoComponent } from './selection-info/selection-info.component';
import { LearnStatsComponent } from './learn-stats/learn-stats.component';
import { VoiceMemoFieldComponent } from '../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component';
import { VoiceAttachableItem } from '../../../libs/AppFedShared/audio/voice-memo.service';
import { OdmBackend } from '../../../libs/AppFedShared/odm/OdmBackend';
import { ItemListComponent } from './item-list/item-list.component';
import { addIcons } from 'ionicons';
import { logoGoogle, logoFacebook, mailOutline } from 'ionicons/icons';
import { TranslatePipe } from '@ngx-translate/core';

/** TODO: rename to smth simpler more standard like LearnDoItemsPage (search-or-add is kinda implied, especially search) */
@Component({
    selector: 'app-search-or-add-learnable-item',
    templateUrl: './search-or-add-learnable-item.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./search-or-add-learnable-item.page.scss'],
    imports: [
        IonicModule,
        AppLogoComponent,
        RouterLink,
        WhatNextButtonComponent,
        SyncStatusIconComponent,
        NgIf,
        SearchOrAddTextEditorComponent,
        SelectionInfoComponent,
        LearnStatsComponent,
        VoiceMemoFieldComponent,
        ItemListComponent,
        AsyncPipe,
        TranslatePipe,
    ],
})
export class SearchOrAddLearnableItemPageComponent extends BaseComponent implements OnInit {

  private readonly searchDraftStorageKey = 'LifeSuite.Learn.searchOrAdd.draft'

  listModel = new ListProcessing(this.injector)

  htmlSearch ? : string = undefined

  searchFormControl = new UntypedFormControl()

  isAddingWithAI = false
  private aiSubscription?: Subscription
  showLoginOptions = false

  addErrorMessage?: string

  isOffline = typeof navigator !== 'undefined' ? !navigator.onLine : false

  get filteredItem$s(): LearnItem$[] { return this.listModel.filteredItem$s }

  get item$s(): LearnItem$[] { return this.listModel.item$s }

  get authUserId() {
    return this.authService.authUser$.lastVal?.uid
  }

  constructor(
    public learnDoService: LearnItemItemsService,
    private learnStatsService  /* force the service to run */: LearnStatsService,
    // public journalEntriesService: JournalEntryItemsService,
    public authService: AuthService,
    public lingueeService: LingueeService,
    public merriamWebsterDictService: MerriamWebsterDictService,
    public popoverController: PopoverController,
    private toastController: ToastController,
    public router: Router,
    private aiBackend: AiBackendService,
    private itemProcessingService: ItemProcessingService,
    injector: Injector,
  ) {
    super(injector)
    addIcons({ logoGoogle, logoFacebook, mailOutline })
  }

  ngOnInit() {
    this.restoreDraft()
    this.searchFormControl.valueChanges.pipe(
      debounceTime(/*100*/300) /* FIXME: this debounceTime() is probably causing the double-adding of items */,
      // tap(debugLog),
      // map(stripHtml), // TODO but need to not destroy html
      // TODO: strip too coz maybe adding a space should not make a difference
      distinctUntilChanged(),
    ).subscribe(val => {
      this.htmlSearch = val // !! FIXME BUG: this is debounced; BUG when pressing enter/alt+enter fast - old value is taken
      val = stripHtml(val)
      this.persistDraft()

      this.listModel.search = val
      this.listModel.onChangeSearch(val)
    })
    this.learnDoService.localItems$.subscribe((item$s: LearnItem$[]) => {
      // console.log('localItems$ ==== '/*, item$s*/)
      this.listModel.setItemsAndSort(item$s)
    })
  }

  toggleLoginOptions() {
    this.showLoginOptions = !this.showLoginOptions
  }

  continueWithGoogle() {
    this.showLoginOptions = false
    this.authService.logInViaGoogle()
  }

  continueWithFacebook() {
    this.showLoginOptions = false
    this.authService.logInViaFacebook()
  }

  openPasswordLogin() {
    this.showLoginOptions = false
    this.router.navigateByUrl('/auth')
  }

  add(string?: string, isTask?: boolean, navInto?: boolean, addDuplicateAnyway = false) {
    console.log('add: ', string)
    this.clearAddError()

    if ( this.isTextEmpty() ) {
      const val = new LearnItem()
      val.isTask = !! isTask
      const learnItem$ = this.learnDoService.add(val)
      this.navigateIntoItem(learnItem$.id !)
      return
    }
    string = this.getUserString(string)
    const duplicate = addDuplicateAnyway ? undefined : this.findExistingSimilarItem(string, isTask)
    if (duplicate) {
      this.presentDuplicateToast(
        duplicate,
        () => this.add(string, isTask, navInto, true)
      )
      return
    }
    // if ( !string ) {
    //   return // FIXME: allow creating empty --> ?? ``
    // }
    //
    // if (! (string || '').trim().length ) {
    //   return // FIXME: allow creating empty
    // }

    const newItem = this.createItemFromInputString(string, isTask)
    if ( newItem ) {
      debugLog(`add item:`, newItem)
      const item$ = this.learnDoService.add(newItem as any as LearnItem)
      if (!isTask) {
        this.fillNewItemAnswerIfNeeded(item$)
      }
      // this.syncStatusService.handleSavingPromise(
      //   this.coll.add(newItem) /* This will go away when migrated to ODM */ )
      this.clearInput()
      if ( navInto ) {
        this.navigateIntoItem(item$.id !)
      }
    } else {
      this.showAddError('I could not turn that text into an item.')
    }
  }

  private navigateIntoItem(id: string) {
    this.router.navigateByUrl('learn/item/' + id)
  }

  private getUserString(string?: string): string {
    // return string ?? this.htmlSearch ?? this.listModel.search ?? ``
    return string ?? this.searchFormControl.value ?? this.listModel.search ?? ``
    // FIXME: this inconsistency with clearInput might be causing the bug with double-adding of items
  }

  clearInput() {
    this.listModel.search = ''
    this.htmlSearch = ''
    this.searchFormControl.setValue('')
    this.clearDraft()
  }

  /** maybe this could be moved to model class ---> actually service */
  createItemFromInputString(string: string, isTask?: boolean) {
    const stringEviscerated = stripHtml(string)?.trim()
    // if ( ! string ?. trim() ) {
    //   return
    // }
    const QQ = /<-->|<->|----/ // <> - pascal not-equal
    const QA = /---/ // |-->/ // removed -- because it exists in command line options and html comments
    // --> - end of XML/HTML comment
    const overlay: Partial<LearnItemSidesVals & LearnItem> = {}
    if ( string.match(QQ) ) {
      const split = splitAndTrim(string, QQ)
      debugLog(`splitAndTrim`, split)
      overlay.question = split[0]
      overlay.question2 = split[1]
      if ( split[2] ) {
        overlay.question3 = split[2]
      }
    } else if ( string.match(QA) ) {
      // something here is causing leading empty paragraph:
      // <p> </p>
      // <p>aaa</p>
      const split = splitAndTrim(string, QA)
      overlay.question = split[0]
      overlay.answer = split[1]
      if ( split[2] ) {
        overlay.question2 = split[2]
      }
      if ( split[3] ) {
        overlay.question3 = split[3]
      }
    } else {
      overlay.title = (string ?? '')./*?.*/trim() /*?? null*/
    }
    this.applyImportanceFromText(stringEviscerated, overlay)
    return Object.assign(new LearnItem(), {
      owner: this.authUserId,
      whenAdded: new Date(),
      isTask: isTask ? true : null,
      ...overlay,
    })
  }

  private applyImportanceFromText(stringEviscerated: string | nullish, overlay: Partial<LearnItemSidesVals & LearnItem>) {
  // private applyImportanceFromText(stringEviscerated: string | nullish, overlay: Partial<LearnItemSidesVals & LearnItem>) {
    //   const s = stringEviscerated?.toUpperCase()
    //   const importanceDescriptors = importanceDescriptorsArray
    //   //   {
    //   //   current_focus: "CF",
    //   //   basic_functioning: "BF",
    //   //   basic_functioning_mantra: "BFMTR",
    //   //   overarching_mantra: "OVRMTR",
    //   //   overarching: "OVR",
    //   //   current_focus_meta_mantra: "CFMM, CFMTM, CFMTMTR, CFMETAMANTRA",
    //   //   current_focus_mantra: "CFM, CFMT, CFMTR, CFMANTRA",
    //   //   meta_mantra: "!!!!!",
    //   //   mantra: "!!!!!",
    //   //   meta: "!!!!!",
    //   //   extremely_high: "!!!!",
    //   //   very_high: "!!!",
    //   //   high: "!!",
    //   //   somewhat_high: "!"
    //   // };
    //   const keys = Object.keys(importanceDescriptors);
    //   for (let i = 0; i < keys.length; i++) {
    //     if (s?.startsWith(keys[i]) || s?.endsWith(keys[i])) {
    //       overlay.importance = importanceDescriptors[keys[i]];
    //       break;
    //     }
    //   }
    // }



    const s = stringEviscerated?.toUpperCase()
    /*==*/ if (s?.startsWith(`CF!`) || s?.endsWith(`CF!`)) {
      overlay.importance = importanceDescriptors.current_focus
    } else if (s?.startsWith(`BF!`) || s?.endsWith(`BF!`)
        || s?.startsWith(`BF !`) || s?.endsWith(`BF !`)
    ) {
      overlay.importance = importanceDescriptors.basic_functioning
    } else if (s?.startsWith(`BFMTR!`) || s?.endsWith(`BFMTR!`)
        || s?.startsWith(`BFMTR !`) || s?.endsWith(`BFMTR !`)
    ) {
      overlay.importance = importanceDescriptors.basic_functioning_mantra
    } else if (s?.startsWith(`CFMTR!`) || s?.endsWith(`CFMTR!`)
        || s?.startsWith(`CFMTR !`) || s?.endsWith(`CFMTR !`)
    ) {
      overlay.importance = importanceDescriptors.basic_functioning_mantra
    } else if (s?.startsWith(`OVRMTR!`) || s?.endsWith(`OVRMTR!`)) {
      overlay.importance = importanceDescriptors.overarching_mantra
    } else if (s?.startsWith(`OVR!`) || s?.endsWith(`OVR!`)) {
      overlay.importance = importanceDescriptors.overarching
    } else if (s?.startsWith(`CFMM!`) || s?.endsWith(`CFMM!`)
        || s?.startsWith(`CFMTM!`) || s?.endsWith(`CFMTM!`)
        || s?.startsWith(`CFMTMTR!`) || s?.endsWith(`CFMTMTR!`)
        || s?.startsWith(`CFMETAMANTRA!`) || s?.endsWith(`CFMETAMANTRA!`)
    ) {
      overlay.importance = importanceDescriptors.current_focus_meta_mantra
    } else if (s?.startsWith(`CFM!`) || s?.endsWith(`CFM!`)
        || s?.startsWith(`CFMT!`) || s?.endsWith(`CFMT!`)
        || s?.startsWith(`CFMTR!`) || s?.endsWith(`CFMTR!`)
        || s?.startsWith(`CFMANTRA!`) || s?.endsWith(`CFMANTRA!`)
    ) {
      overlay.importance = importanceDescriptors.current_focus_mantra
    } else if (s?.startsWith(`!!!!!!!`) || s?.endsWith(`!!!!!!!`)) {
      overlay.importance = importanceDescriptors.meta_mantra
    } else if (s?.startsWith(`!!!!!!`) || s?.endsWith(`!!!!!!`)) {
      overlay.importance = importanceDescriptors.mantra
    } else if (s?.startsWith(`!!!!!`) || s?.endsWith(`!!!!!`)) {
      overlay.importance = importanceDescriptors.meta
    } else if (s?.startsWith(`!!!!`) || s?.endsWith(`!!!!`)) {
      overlay.importance = importanceDescriptors.extremely_high
    } else if (s?.startsWith(`!!!`) || s?.endsWith(`!!!`)) {
      overlay.importance = importanceDescriptors.very_high
    } else if (s?.startsWith(`!!`) || s?.endsWith(`!!`)) {
      overlay.importance = importanceDescriptors.high
    } else if (s?.startsWith(`!`) || s?.endsWith(`!`)) {
      overlay.importance = importanceDescriptors.somewhat_high
    }
  }

  addTask(navInto?: boolean) {
    this.add(undefined, true, navInto)
  }

  private fillNewItemAnswerIfNeeded(item$: LearnItem$) {
    if (!this.itemProcessingService.isQuestionWithoutAnswer(item$)) {
      return
    }
    if (this.isOffline) {
      return
    }

    this.isAddingWithAI = true
    this.itemProcessingService.fillAnswerWithAi(item$)
      .catch(e => {
        console.error('Error auto-filling answer with AI', e)
        this.showAddError(this.formatAddError(e, 'The item was added, but the AI answer could not be filled.'))
      })
      .finally(() => this.isAddingWithAI = false)
  }

  addToLearn(navInto?: boolean) {
    console.log('addToLearn')
    // this.lingueeService.doIt(this.search).then()
    // this.merriamWebsterDictService.doIt(this.search)

    this.add(undefined, false, navInto)
  }

  async addWithAI() {
    if (this.isAddingWithAI) {
      return
    }
    this.clearAddError()
    if (this.isOffline) {
      this.showAddError('You are offline. Add the item now, then fill with AI when you are back online.')
      return
    }
    const text = this.getUserString()
    if (isNullishOrEmptyOrBlank(stripHtml(text))) {
      this.showAddError('Write something to learn before asking AI to fill it.')
      return
    }
    this.isAddingWithAI = true
    try {
      const item = this.createItemFromInputString(text, false)
      if (!item) {
        this.showAddError('I could not turn that text into an item.')
        this.isAddingWithAI = false
        return
      }
      item.answer = ''
      const item$ = await this.learnDoService.add(item)
      this.clearInput()
      this.navigateIntoItem(item$.id!)
      // Captured once (not re-read per streamed chunk below) - only when the answer was
      // generated matters, not every intermediate token's arrival time.
      const whenGeneratedByAi = OdmBackend.nowTimestamp()
      this.aiSubscription = this.aiBackend.generateAnswerStream(text).pipe(
        finalize(() => this.isAddingWithAI = false)
      ).subscribe(
        answer => item$.patchThrottled({answer, whenGeneratedByAi}),
        e => {
          console.error('Error adding with AI', e)
          this.showAddError(this.formatAddError(e, 'The item was added, but AI could not fill the answer.'))
        }
      )
      this.presentAddedToast(item$, 'Learn item added with AI.', () => this.stopAI())
    } catch (e) {
      console.error('Error adding with AI', e)
      this.showAddError(this.formatAddError(e, 'Could not add the item with AI.'))
      this.isAddingWithAI = false
    }
  }

  stopAI() {
    this.aiSubscription?.unsubscribe()
    this.aiSubscription = undefined
    this.isAddingWithAI = false
  }

  private clearAddError() {
    this.addErrorMessage = undefined
  }

  private showAddError(message: string) {
    this.addErrorMessage = message
    this.presentToast(message, 'danger')
  }

  private async presentToast(message: string, color: 'success' | 'danger' | 'warning' | 'medium' = 'success') {
    await presentDismissableToast(this.toastController, {
      message,
      duration: 2400,
      color,
      position: 'bottom',
    })
  }

  private async presentAddedToast(item$: LearnItem$, message: string, beforeUndo?: () => void) {
    await presentDismissableToast(this.toastController, {
      message: this.withOfflineSaveHint(message),
      duration: 5000,
      color: 'success',
      position: 'bottom',
      buttons: [
        {
          text: 'Undo',
          role: 'cancel',
          handler: () => {
            beforeUndo?.()
            item$.deleteWithoutConfirmation()
            if (this.router.url === item$.getRouterLinkUrl()) {
              this.router.navigateByUrl('/learn')
            }
            this.presentToast('Item removed.', 'medium')
          },
        },
      ],
    })
  }

  private async presentDuplicateToast(existingItem$: LearnItem$, addAnyway: () => void) {
    const title = this.getPlainItemTitle(existingItem$) || 'that item'
    await presentDismissableToast(this.toastController, {
      message: `Looks like "${title}" already exists.`,
      duration: 7000,
      color: 'warning',
      position: 'bottom',
      buttons: [
        {
          text: 'Open',
          handler: () => this.router.navigateByUrl(existingItem$.getRouterLinkUrl()),
        },
        {
          text: 'Add anyway',
          handler: addAnyway,
        },
      ],
    })
  }

  private formatAddError(error: any, fallback: string): string {
    return error?.error?.message
      ?? error?.message
      ?? fallback
  }

  private findExistingSimilarItem(text: string, isTask?: boolean): LearnItem$ | undefined {
    const normalized = this.normalizeForDuplicateCheck(text)
    if (!normalized) {
      return undefined
    }

    return this.item$s.find(item$ => {
      const item = item$.currentVal
      if (!item || item.whenDeleted || item.isDeleted) {
        return false
      }
      if (!!item.isTask !== !!isTask) {
        return false
      }
      return [
        item.title,
        (item as any).question,
        (item as any).question2,
        (item as any).question3,
      ].some(value => this.normalizeForDuplicateCheck(value) === normalized)
    })
  }

  private normalizeForDuplicateCheck(text?: string | nullish): string {
    return stripHtml(text)?.replace(/\s+/g, ' ').trim().toLowerCase() ?? ''
  }

  private getPlainItemTitle(item$: LearnItem$) {
    const item = item$.currentVal
    return stripHtml(item?.title || (item as any)?.question)?.trim()
  }

  private withOfflineSaveHint(message: string) {
    return this.isOffline
      ? `${message} Saved on this device; it will sync when you are online.`
      : message
  }

  private persistDraft() {
    const draft = this.searchFormControl.value
    if (isNullishOrEmptyOrBlank(stripHtml(draft))) {
      this.clearDraft()
      return
    }
    localStorage.setItem(this.searchDraftStorageKey, draft)
  }

  private restoreDraft() {
    const draft = localStorage.getItem(this.searchDraftStorageKey)
    if (!draft || !isNullishOrEmptyOrBlank(this.searchFormControl.value)) {
      return
    }
    this.searchFormControl.setValue(draft)
    this.presentToast('Draft restored.', 'medium')
  }

  private clearDraft() {
    localStorage.removeItem(this.searchDraftStorageKey)
  }

  @HostListener('window:keyup.alt.enter', ['$event'])
  handleKeyboardEvent(event: Event) {
    console.log(`alt enter`)
  }

  @HostListener('window:online')
  onOnline() {
    this.isOffline = false
    this.presentToast('Back online. Pending changes can sync.', 'success')
  }

  @HostListener('window:offline')
  onOffline() {
    this.isOffline = true
    this.presentToast('Offline mode. New items are saved on this device.', 'medium')
  }

  hasSearchText() {
    return !! this.listModel.search?.trim();
  }

  async onClickListOptions(event: any) {
    const popover = await this.popoverController.create({
      component: ListOptionsComponent,
      componentProps: {
        listOptions$P: this.listModel.listOptions$P,
        itemsService: this.learnDoService,
      },
      event: event,
      translucent: true,
      mode: 'ios',
      cssClass: `my-popover`,
      // size: 'cover',
      // side: 'left',
    });
    return await popover.present();
  }

  addToJournal() {
    errorAlert('addToJournal disabled to not load all items in JournalEntryItemsService')
    // TODO: if empty, go to journal entry details page
    // this.journalEntriesService.add(this.getUserString())
    this.clearInput()
  }

  isTextEmpty() {
    return isNullishOrEmptyOrBlank(this.getUserString())
  }

  /** Quick-add's mic (see `app-voice-memo-field`'s `createItemIfMissing` input) has no "current
   * item" to record onto - unlike every other surface, generalizes MicComponent's original
   * hardcoded behavior of creating a brand new, otherwise-blank LearnItem right when the
   * recording stops. */
  createQuickAddItem = (): VoiceAttachableItem => {
    const learnItemData = new LearnItem()
    learnItemData.whenAdded = OdmBackend.nowTimestamp()
    const learnItem$ = this.learnDoService.newItem(undefined, learnItemData)
    learnItem$.saveNowToDb()
    return learnItem$
  }

  /** Appends the transcribed voice memo to the quick-add draft text, rather than overwriting it -
   * this is a plain TinyMCE quick-add field (not tied to any single saved item's field), so the
   * transcript lands in the same draft the mic's newly-created item's recording is attached to. */
  onQuickAddTranscriptReady(transcript: string) {
    const existing = this.searchFormControl.value ?? ''
    this.searchFormControl.setValue(existing ? `${existing} ${transcript}` : transcript)
  }

}
