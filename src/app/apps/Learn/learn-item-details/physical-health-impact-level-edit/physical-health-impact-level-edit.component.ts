import {Component, ChangeDetectionStrategy} from '@angular/core';
import {mentalEffortLevels} from '../../models/fields/mental-effort-level.model'
import {LearnItem$} from '../../models/LearnItem$'
import {
  createBalancedIntensityButtonsDescriptor,
  SyncedDescriptorFieldEditComponent,
} from '../../../../libs/LifeSuiteShared/edit-shared/descriptor-level-edit'
import { NumericPickerComponent } from '../../../../libs/AppFedSharedIonic/ratings/numeric-picker/numeric-picker.component';
import { ReactiveFormsModule } from '@angular/forms';

const levels = mentalEffortLevels

/** Exported for `LearnSlotDescriptors.ts` (GH #89's unified cell registry), which reuses this
 * same button set for `physicalHealthImpact`'s `app-intensity-cell` rather than duplicating it. */
export const buttonsDesc = createBalancedIntensityButtonsDescriptor(
  levels,
  [`🤒`, `🤒🤒`, `🤒🤒🤒`, `🤒🤒🤒🤒`],
  [`🤸`, `🤸🤸`, `🤸🤸🤸`, `🤸🤸🤸🤸`],
)

@Component({
    selector: 'app-physical-health-impact-level-edit',
    templateUrl: './physical-health-impact-level-edit.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./physical-health-impact-level-edit.component.sass'],
    imports: [NumericPickerComponent, ReactiveFormsModule],
})
export class PhysicalHealthImpactLevelEditComponent extends SyncedDescriptorFieldEditComponent<LearnItem$> {

  readonly fieldName = 'physicalHealthImpact'

  buttonsDesc = buttonsDesc

}
