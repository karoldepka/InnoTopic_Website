import {Component, ElementRef, Input, OnInit, ChangeDetectionStrategy} from '@angular/core';
import { NumericPickerVal } from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {
  StarRatingComponent,
  StarRatingVal,
} from '../../../../libs/AppFedSharedIonic/ratings/star-rating/star-rating.component'
import {JournalNumericDescriptor, JournalNumericDescriptors} from '../../models/JournalNumericDescriptors'
import {JournalCompositeFieldVal} from '../../models/JournalEntry'
import {JournalEntry$} from '../../models/JournalEntry$'
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { VoiceMemoFieldComponent } from '../../../../libs/AppFedShared/audio/voice-memo-field/voice-memo-field.component';

@Component({
    selector: 'app-journal-numeric-fields',
    templateUrl: './journal-numeric-fields.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./journal-numeric-fields.component.sass'],
    imports: [
        IonicModule,
        ReactiveFormsModule,
        FormsModule,
        NgIf,
        NgFor,
        StarRatingComponent,
        TranslatePipe,
        VoiceMemoFieldComponent,
    ],
})
export class JournalNumericFieldsComponent implements OnInit {

  private static readonly maxStoredRatingValue = 10

  numDescriptors = JournalNumericDescriptors.instance.array

  maxStars = 5

  search = ''

  @Input() journalEntry$ !: JournalEntry$

  showAny = false

  showAll = false

  openCommentFieldIds = new Set<string>()

  get isSearchEntered() {
    return this.search ?. trim() ?. length
  }

  /** A field with a rating or a note already entered should show up on its own (GH #57) - not
   * just when short-listed/showAll/matching a search - so opening an entry that already has data
   * actually shows that data instead of hiding it behind "Show core ratings"/"Show all". Either
   * one alone is enough, matching the issue's own "numeric-self-rating OR note" wording. */
  descriptorHasData(descriptor: JournalNumericDescriptor): boolean {
    const entry = this.journalEntry$?.currentVal
    if ( ! entry ) {
      return false
    }
    return entry.getCompositeFieldNumVal(descriptor) !== undefined || !! entry.getCompositeFieldComment(descriptor)?.trim()
  }

  get hasAnyFieldWithData(): boolean {
    return this.numDescriptors.some(descriptor => this.descriptorHasData(descriptor))
  }

  constructor(private elementRef: ElementRef<HTMLElement>) { }

  ngOnInit() {}

  starValueFor(descriptor: JournalNumericDescriptor): StarRatingVal {
    const numericValue = this.journalEntry$?.currentVal?.getCompositeFieldNumVal(descriptor) ?? 0
    return numericValue * (this.maxStars / JournalNumericFieldsComponent.maxStoredRatingValue)
  }

  onChangeStarValue(starValue: StarRatingVal, descriptor: JournalNumericDescriptor) {
    if ( starValue === 0 ) {
      this.clearNumericValue(descriptor)
      return
    }
    const numericPickerVal = starValue * (JournalNumericFieldsComponent.maxStoredRatingValue / this.maxStars)
    this.onChangeNumericValue(numericPickerVal, descriptor)
  }

  private onChangeNumericValue(numericPickerVal: NumericPickerVal, descriptor: JournalNumericDescriptor) {
    const patch: any = {}
    const existing: JournalCompositeFieldVal = (this.journalEntry$.currentVal as any)?.[descriptor.id!] ?? {}
    patch[descriptor.id!] = { ...existing, numVal: numericPickerVal }
    this.journalEntry$.patchThrottled(patch)
  }

  private clearNumericValue(descriptor: JournalNumericDescriptor) {
    const patch: any = {}
    const existing: JournalCompositeFieldVal = (this.journalEntry$.currentVal as any)?.[descriptor.id!] ?? {}
    const { numVal, ...withoutNumVal } = existing
    const hasRemainingValue = Object.values(withoutNumVal).some(
      value => value !== undefined && value !== null && value !== ''
    )
    patch[descriptor.id!] = hasRemainingValue ? { ...withoutNumVal, numVal: null } : null
    this.journalEntry$.patchThrottled(patch)
  }

  toggleComment(descriptor: JournalNumericDescriptor) {
    const id = descriptor.id!
    if (this.openCommentFieldIds.has(id)) {
      this.openCommentFieldIds.delete(id)
    } else {
      this.openCommentFieldIds.add(id)
      this.focusComment(id)
    }
  }

  /** The textarea is only in the DOM once opened (*ngIf), so wait a tick before focusing it. */
  private focusComment(descriptorId: string) {
    setTimeout(() => {
      const textarea = this.elementRef.nativeElement.querySelector(
        `ion-textarea[data-descriptor-id="${descriptorId}"]`
      ) as (HTMLElement & { setFocus?: () => Promise<void> }) | null
      textarea?.setFocus?.()
    })
  }

  isCommentOpen(descriptor: JournalNumericDescriptor): boolean {
    return this.openCommentFieldIds.has(descriptor.id!) || !!this.getComment(descriptor)
  }

  getComment(descriptor: JournalNumericDescriptor): string {
    return (this.journalEntry$.currentVal as any)?.[descriptor.id!]?.comment ?? ''
  }

  onChangeComment(comment: string | null | undefined, descriptor: JournalNumericDescriptor) {
    const patch: any = {}
    const existing: JournalCompositeFieldVal = (this.journalEntry$.currentVal as any)?.[descriptor.id!] ?? {}
    patch[descriptor.id!] = { ...existing, comment: comment ?? '' }
    this.journalEntry$.patchThrottled(patch)
  }

  /** Appends the transcribed voice memo to whatever's already in this comment (plain text, unlike
   * the rich-text fields' paragraph-append - this is a plain ion-textarea), opening the comment
   * field first if it wasn't already. */
  onTranscriptReady(transcript: string, descriptor: JournalNumericDescriptor) {
    this.openCommentFieldIds.add(descriptor.id!)
    const existingComment = this.getComment(descriptor)
    const joined = existingComment ? `${existingComment}\n${transcript}` : transcript
    this.onChangeComment(joined, descriptor)
  }

}
