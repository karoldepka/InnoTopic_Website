import {OdmItemId} from "../../../libs/AppFedShared/odm/OdmItemId";
import {OdmInMemItem} from '../../../libs/AppFedShared/odm/OdmItem$2'
import {JournalNumericDescriptor, JournalNumericDescriptors} from './JournalNumericDescriptors'
import {NumericPickerVal} from '../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'
import {JournalTextDescriptor, JournalTextDescriptors} from './JournalTextDescriptors'
import {nullish} from '../../../libs/AppFedShared/utils/type-utils'
import {isNotNullish} from '../../../libs/AppFedShared/utils/utils'
import {VoiceMemoRecord} from '../../../libs/AppFedShared/audio/voice-memo.service'

export type JournalEntryId = OdmItemId<JournalEntry>

export type JournalFieldVal = string

/* Or: "metrics" */
export interface JournalCompositeFieldVal {
  numVal?: NumericPickerVal | null
  comment?: string
}



export class JournalEntry extends OdmInMemItem /*OdmItem<JournalEntry>*/ {

  general ?: JournalFieldVal

  importance ?: JournalCompositeFieldVal

  /** Every voice memo recorded against any field on this entry - see VoiceMemoRecord's doc
   * comment (one flat array, filtered per-field by `fieldId` at read time). */
  voiceMemos ?: VoiceMemoRecord[]

  constructor(
    // odmService: OdmService<JournalEntry>,
    // id?: OdmItemId<JournalEntry>,
    public text: string | null = null,
    public lastModifiedGeo: any | null = null,
  ) {
    super()
    // super(
    //   odmService,
    //   id,
    // )
  }

  getCompositeField(field: JournalNumericDescriptor): JournalCompositeFieldVal | undefined {
    // console.log(`getCompositeField`)
    // return undefined // {numVal: 999}
    // TODO: is this func too slow or called too many times?
    return (this as any) [field.id !]
  }

  getCompositeFieldNumVal(field: JournalNumericDescriptor): number | undefined {
    const compositeVal = this.getCompositeField(field)
    const numVal = compositeVal?.numVal
      ?? (compositeVal as any as number | undefined) /* compatibility with old */
    if ( typeof numVal === 'number' ) {
      return numVal
    } return undefined
  }

  getTextFieldVal(field: JournalTextDescriptor): string | nullish {
    return (this as any) [field.id !]
  }

  getCompositeFieldComment(field: JournalNumericDescriptor): string | undefined {
    return this.getCompositeField(field)?.comment || undefined
  }

  /** A descriptor with only a comment and no rating yet is still "present" (GH #57 - either a
   * numeric-self-rating OR a note is enough) - previously dropped entirely since this only
   * checked for a numeric value. */
  getPresentCompositeFieldEntries(): [JournalNumericDescriptor, number | undefined, string | undefined][] {
    const retArray = [] as Array<[JournalNumericDescriptor, number | undefined, string | undefined]>
    for ( let desc of JournalNumericDescriptors.instance.array ) {
      const fieldVal = this.getCompositeFieldNumVal(desc)
      const comment = this.getCompositeFieldComment(desc)
      if ( fieldVal !== undefined || comment ) {
        retArray.push([desc, fieldVal, comment])
      }
    }
    return retArray
  }

  getPresentTextFieldEntries(): [JournalTextDescriptor, string][] {
    const retArray = [] as Array<[JournalTextDescriptor, string]>
    for ( let desc of JournalTextDescriptors.instance.array ) {
      const fieldVal = this.getTextFieldVal(desc)
      if ( isNotNullish(fieldVal) ) {
        if ( ((fieldVal?.trim?.()?.length ?? 0) > 0) ) {
          retArray.push([desc, fieldVal!])
        } else {
          // console.log(`fieldVal`, fieldVal)
        }
      }
    }
    return retArray
  }


  // patchJournalField(fieldId: keyof JournalNumericDescriptors, patch: JournalFieldPatch)
}
