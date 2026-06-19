import {Component, ChangeDetectionStrategy} from '@angular/core';
import {mentalEffortLevels} from '../../models/fields/mental-effort-level.model'
import {LearnItem$} from '../../models/LearnItem$'
import {
  createBalancedIntensityButtonsDescriptor,
  SyncedDescriptorFieldEditComponent,
} from '../../../../libs/LifeSuiteShared/edit-shared/descriptor-level-edit'

const levels = mentalEffortLevels

const buttonsDesc = createBalancedIntensityButtonsDescriptor(
  levels,
  [`🤒`, `🤒🤒`, `🤒🤒🤒`, `🤒🤒🤒🤒`],
  [`🤸`, `🤸🤸`, `🤸🤸🤸`, `🤸🤸🤸🤸`],
)

@Component({
  standalone: false,
  selector: 'app-physical-health-impact-level-edit',
  templateUrl: './physical-health-impact-level-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./physical-health-impact-level-edit.component.sass'],
})
export class PhysicalHealthImpactLevelEditComponent extends SyncedDescriptorFieldEditComponent<LearnItem$> {

  readonly fieldName = 'physicalHealthImpact'

  buttonsDesc = buttonsDesc

}
