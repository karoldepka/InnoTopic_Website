import {AbstractControl, UntypedFormControl, UntypedFormGroup} from '@angular/forms'
import {OdmItem$2} from '../OdmItem$2'
import {debugLog, errorAlert} from '../../utils/log'
import {DurationMs, TimeMsEpoch} from '../../utils/type-utils'
import {PatchableObservable, throttleTimeWithLeadingTrailing_ReallyThrottle} from '../../utils/rxUtils'
import {convertToHtmlIfNeeded} from '../../utils/html-utils'

export function createViewSyncerForField<T>(patchableObservable: PatchableObservable<T>, fieldName: keyof T, formControl: UntypedFormControl) {
  const formControls/*: { [key in keyof T]: FormControl} */: any = {}
  formControls[fieldName] = formControl
  const formGroup = new UntypedFormGroup(formControls)
  const viewSyncer = new ViewSyncer(formGroup, patchableObservable, false,
    fieldName)
  return viewSyncer
}

export class ViewSyncer<TKey = string, TValue = any /* TODO */, TItemInMem = any> {

  private initialDataArrivalWasSetExplicitly = false
  public initialDataArrived = false
  public isApplyingFromDb = false

  /** FIXME: cannot compare with lastVal coz we don't know in which field component is interested */
  public lastValFromDb ? : TItemInMem | null

  // mapKeyToLastEditTime = new Map<TKey, number>()

  lastLocalEditByUserMs: TimeMsEpoch = 0 // Date.now() //0 FIXME: if zero then as if ALWAYS ENOUGH TIME PASSED ! -- need to check together with initialDataHasArrived ; maybe allow undefined here (but watch out for NaN)

  /** High number as hack for learnItem fields being overridden */
  MIN_INTERVAL_MS: DurationMs = 10_000

  /** Handle for a retry of a DB update that arrived while the post-edit lockout above was still
   * active - see handleIncomingDbValue()'s doc comment. Cleared/replaced whenever a newer
   * candidate value supersedes an already-scheduled retry. */
  private pendingRetryTimeoutHandle ? : ReturnType<typeof setTimeout>

  constructor(
    /** TODO make it FormControl in maybe ViewSyncer2 coz needs individual updates */
    public formGroup: AbstractControl,
    public item$: PatchableObservable<TItemInMem> /*OdmItem$2<any, TItemInMem, any, any>*/,
    public requireExplicitInitialValueTrigger ? : boolean,
    /**
     * Field in which we are interested;
     * going forward, I should probably have a shared ViewSyncer and specifying field e.g. via FieldSyncer (OdmItemViewSyncer?).
     * Need to refactor to fully incremental diff patches anyway, including deep patches. And to take into account fully/partially patching FormGroup,
     * if necessary (or maybe just use FormControls always to avoid hassle with FormGroup; but to consider: whole form validation, but could be
     * independent from ViewSyncer (just grouping the FormControl-s independently from ViewSyncer / OdmFieldViewSyncer)
     * or PatchableObservableViewSyncer, to make it independent from ODM */
    public fieldNameHack ? : keyof NonNullable<TItemInMem>)
  {
    // console.log('ViewSyncer ctor', item$, item$.id)
    this.item$.locallyVisibleChanges$.subscribe((dataFromDb: TItemInMem | undefined | null) => {
      this.handleIncomingDbValue(dataFromDb)
    })
    this.formGroup.valueChanges.pipe(
      throttleTimeWithLeadingTrailing_ReallyThrottle(1500 as (number & {unit: 'ms'}))
    ).subscribe(newValue => {
      // errorAlert(`ViewSyncer won't save: hack for prevent rich text for now`)
      // return; // hack for prevent rich for now
      if ( this.requireExplicitInitialValueTrigger && ! this.initialDataArrivalWasSetExplicitly ) {
        return
      }
      // debugLog(`this.formGroup.valueChanges.subscribe`, newValue, `isApplyingFromDb:`, this.isApplyingFromDb)
      // todo: check if self-patch pending ; or check timestamp difference ~500 ms or if value differed (though if it is converted to html, it will differ)
      if ( ! this.isApplyingFromDb && this.initialDataArrived ) {
        // debugLog(`this.lastLocalEditByUserMs`, this.lastLocalEditByUserMs, this)
        this.lastLocalEditByUserMs = Date.now()
        // debugLog('ViewSyncer - patchThrottled', newValue)
        this.item$.patchThrottled(newValue) // TODO: patchThrottled({cleanUp: true}) -- trim to null; maybe remove unused fields to save bytes and not put `null`
      }
    })

  }

  getLastEditTimeForField(field: TKey): number {
    return this.lastLocalEditByUserMs
  }

  /** Immediately pushes the form's current value through to the item, bypassing the 1500ms
   * throttle above. Without this, navigating away (or the app backgrounding) within that window
   * after the user's last keystroke can silently drop it - the throttle's trailing edge is still
   * waiting to fire and never gets the chance to. Callers should invoke this right before any
   * point that could end the current view (page navigation, ngOnDestroy, app going to
   * background) - see JournalWritePage for where this is wired in. Safe to call even if there's
   * nothing pending (same guards as the throttled subscription above), and safe to call more than
   * once. */
  flush() {
    if ( this.requireExplicitInitialValueTrigger && ! this.initialDataArrivalWasSetExplicitly ) {
      return
    }
    if ( ! this.isApplyingFromDb && this.initialDataArrived ) {
      this.lastLocalEditByUserMs = Date.now()
      this.item$.patchThrottled(this.formGroup.value)
    }
  }

  /* To prevent incoming changes overwriting user edit */
  private hasEnoughTimePassedFromLastUserEditToApplyFromDb() {
    const msFromLastLocalEdit = Date.now() - this.lastLocalEditByUserMs
    // debugLog(`msFromLastLocalEdit`, msFromLastLocalEdit, this.lastLocalEditByUserMs)
    return msFromLastLocalEdit > this.MIN_INTERVAL_MS
  }

  /* TODO: rename to ...WasSetInUI / inUi */
  onInitialDataWasSet() {
    this.initialDataArrivalWasSetExplicitly = true
  }

  /** A DB update that arrives while the post-edit lockout (MIN_INTERVAL_MS) is still active isn't
   * just a redundant echo - that case is already filtered out below by the "same value" check -
   * it's genuinely newer data. Previously this was just dropped: `lastValFromDb` only advanced
   * when an update was actually *applied*, so a value skipped for arriving too soon was never
   * retried once the lockout lifted - nothing else re-delivers that same DB event later. The
   * field stayed stuck on this device's own last local edit indefinitely, surviving even a reload
   * if that reload's own first-arriving value (e.g. a stale earlier cache/db read) was applied
   * before the still-in-flight newer value returned (GH #83 - "field text value gets stuck on
   * local version, even after page reload"). Now: schedule a retry for exactly when the lockout
   * will lift, re-evaluating from scratch (in case an even newer value or edit has arrived by
   * then) rather than silently forgetting about it. */
  private handleIncomingDbValue(dataFromDb: TItemInMem | undefined | null) {
    /* NOTE: interestingly, setting empty string in tinymce only syncs to app in firefox when editor losing focus
      not really, coz editing adding chars also does not sync the last chars until losing editor focus / could be related to throttleTime vs debounce?
     */
    if ( this.fieldNameHack && this.initialDataArrived ) {
      const lastValFromDbElement = (this.lastValFromDb as any)?.[this.fieldNameHack]
      const newDataFromDbElement = (dataFromDb as any)?.[this.fieldNameHack]
      if ( lastValFromDbElement === newDataFromDbElement ) {
        // console.log(`handleIncomingDbValue: lastValFromDbElement equal`, this.fieldNameHack, lastValFromDbElement, newDataFromDbElement)
        return // genuinely unchanged - nothing to apply or retry
      }
    }

    if ( this.pendingRetryTimeoutHandle ) {
      clearTimeout(this.pendingRetryTimeoutHandle)
      this.pendingRetryTimeoutHandle = undefined
    }

    if ( this.hasEnoughTimePassedFromLastUserEditToApplyFromDb() ) {
      this.applyFromDb(dataFromDb)
      return
    }

    const msUntilLockoutLifts = this.MIN_INTERVAL_MS - (Date.now() - this.lastLocalEditByUserMs)
    this.pendingRetryTimeoutHandle = setTimeout(() => {
      this.pendingRetryTimeoutHandle = undefined
      this.handleIncomingDbValue(dataFromDb)
    }, Math.max(msUntilLockoutLifts, 0) + 50 /* small buffer past the exact boundary */)
  }

  private applyFromDb(dataFromDb: TItemInMem | undefined | null) {
    if ( dataFromDb ) {
      // debugLog('ViewSyncer - applyFromDb -- initialDataArrived = true', dataFromDb)
      this.initialDataArrived = true
    }
    try {
      this.isApplyingFromDb = true
      // debugLog(`ViewSyncer this.formGroup.patchValue(dataFromDb)`, this.fieldNameHack)
      // convert plain to HTML:
      if ( this.fieldNameHack ) {
        (dataFromDb as any)[this.fieldNameHack] = convertToHtmlIfNeeded((dataFromDb as any)[this.fieldNameHack])
      }
      this.formGroup.patchValue(dataFromDb) // TODO: handle nullish
      this.lastValFromDb = dataFromDb
    } finally {
      this.isApplyingFromDb = false
    }
  }
}
