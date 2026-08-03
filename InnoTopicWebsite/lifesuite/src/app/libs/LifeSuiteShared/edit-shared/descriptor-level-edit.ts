import {Directive, Input, OnInit} from '@angular/core'
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms'
import {ViewSyncer} from '../../AppFedShared/odm/ui/ViewSyncer'
import {PatchableObservable} from '../../AppFedShared/utils/rxUtils'
import {Required} from '../../AppFedShared/utils/angular/Required.decorator'
import {btn, btnVariant, ButtonsDescriptor} from '../../AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component'

type DescriptorWithId = {
  id?: string
  shortId?: string
}

type IntensityLevels<TDescriptor> = {
  somewhat_low: TDescriptor
  low: TDescriptor
  very_low: TDescriptor
  extremely_low: TDescriptor
  medium: TDescriptor
  unknown: TDescriptor
  undefined: TDescriptor
  somewhat_high: TDescriptor
  high: TDescriptor
  very_high: TDescriptor
  extremely_high: TDescriptor
}

export function intensityBtnVariant<TDescriptor extends DescriptorWithId>(label: string, descr: TDescriptor) {
  const id = descr.id || descr.shortId || label
  return btnVariant({
    value: descr,
    label: label,
    subLabel: id.replace(/_/g, ` `),
    id: id,
  })
}

function intensityVariants<TDescriptor extends DescriptorWithId>(
  labels: string[],
  descriptors: TDescriptor[],
) {
  return labels.map((label, index) => intensityBtnVariant(label, descriptors[index]))
}

export function createBalancedIntensityButtonsDescriptor<TDescriptor extends DescriptorWithId>(
  levels: IntensityLevels<TDescriptor>,
  lowLabels: string[],
  highLabels: string[],
) {
  return new ButtonsDescriptor<TDescriptor, string>([
    btn({
      btnVariants: intensityVariants(lowLabels, [
        levels.somewhat_low,
        levels.low,
        levels.very_low,
        levels.extremely_low,
      ]),
    }),
    btn({
      btnVariants: intensityVariants([`~`, `?`, `-`], [
        levels.medium,
        levels.unknown,
        levels.undefined,
      ]),
    }),
    btn({
      btnVariants: intensityVariants(highLabels, [
        levels.somewhat_high,
        levels.high,
        levels.very_high,
        levels.extremely_high,
      ]),
    }),
  ])
}

@Directive()
export abstract class SyncedDescriptorFieldEditComponent<TItem extends PatchableObservable<any> = PatchableObservable<any>>
  implements OnInit {

  abstract readonly fieldName: string

  formGroup ! : UntypedFormGroup

  formControls: {[fieldName: string]: UntypedFormControl} = {}

  viewSyncer ! : ViewSyncer

  @Input()
  @Required()
  public item$ ! : TItem

  ngOnInit() {
    this.formControls[this.fieldName] = new UntypedFormControl()
    this.formGroup = new UntypedFormGroup(this.formControls)
    this.viewSyncer = new ViewSyncer(
      this.formGroup,
      this.item$,
      false,
      this.fieldName,
    )
  }

}
