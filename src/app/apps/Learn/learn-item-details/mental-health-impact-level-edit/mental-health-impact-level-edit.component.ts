import {Component, ChangeDetectionStrategy} from '@angular/core';
import {LearnItem$} from '../../models/LearnItem$'
import {mentalEffortLevels} from '../../models/fields/mental-effort-level.model'
import {
  createBalancedIntensityButtonsDescriptor,
  SyncedDescriptorFieldEditComponent,
} from '../../../../libs/LifeSuiteShared/edit-shared/descriptor-level-edit'

const levels = mentalEffortLevels

const buttonsDesc = createBalancedIntensityButtonsDescriptor(
  levels,
  [`🤒`, `🤒🤒`, `🤒🤒🤒`, `🤒🤒🤒🤒`],
  [`🧠`, `🧠🧠`, `🧠🧠🧠`, `🧠🧠🧠🧠`],
)


@Component({
  standalone: false,
  selector: 'app-mental-health-impact-level-edit',
  templateUrl: './mental-health-impact-level-edit.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./mental-health-impact-level-edit.component.sass'],
})
export class MentalHealthImpactLevelEditComponent extends SyncedDescriptorFieldEditComponent<LearnItem$> {

  readonly fieldName = 'mentalHealthImpact'

  buttonsDesc = buttonsDesc

}
