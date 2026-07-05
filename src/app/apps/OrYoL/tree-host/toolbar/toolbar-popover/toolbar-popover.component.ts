import {
  Component,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { TreeHostComponent } from '../../tree-host/tree-host.component'
import { DebugService } from '../../../core/debug.service'
import {
  Config,
  ConfigService,
} from '../../../core/config.service'
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms'
import { debugLog } from '../../../utils/log'
import { IonicModule } from '@ionic/angular';
import { AsyncPipe, NgIf } from '@angular/common';
import { OryolFirestoreBackfillService } from '../../../db-supabase/oryol-firestore-backfill.service'
import type {OryBaseTreeNode} from '../../../tree-model/TreeModel'

@Component({
    selector: 'app-toolbar-popover',
    templateUrl: './toolbar-popover.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./toolbar-popover.component.sass'],
    imports: [IonicModule, ReactiveFormsModule, AsyncPipe, NgIf]
})
export class ToolbarPopoverComponent implements OnInit {

  /* workaround for now */
  @Input() treeHost!: TreeHostComponent

  controls: { [K in keyof Config]: UntypedFormControl } = {
    showMinMaxColumns: new UntypedFormControl(),
    showMissingValuesCount: new UntypedFormControl(),
    showAggregateValues: new UntypedFormControl(),
    showTimeTrackedValue: new UntypedFormControl(),
    planExecutionNotificationsEnabled: new UntypedFormControl(),
    planExecutionNotificationTimePercentages: new UntypedFormControl(),
    useTinyMceTitleEditor: new UntypedFormControl(),
  }

  formGroup = new UntypedFormGroup(this.controls)

  constructor(
    public debugService: DebugService,
    public configService: ConfigService,
    public backfillService: OryolFirestoreBackfillService,
  ) { }

  /** Click the button once the item count above has visibly stopped climbing - see
   * OryolFirestoreBackfillService's doc comment for why that's a manual judgment call rather
   * than something this can detect and gate on automatically. */
  runBackfillToSupabase() {
    this.backfillService.run(this.treeHost.treeModel.root as unknown as OryBaseTreeNode)
  }

  ngOnInit() {
    console.log('ToolbarPopoverComponent ngOnInit')
    // this.configService.config$.subscribe(val => {
    //   this.formGroup.setValue(val)
    // })
    this.setFormValue()
    this.formGroup.valueChanges.subscribe(val => {
      this.configService.patchConfig(val)
    })
  }

  private setFormValue() {
    const formValue = this.configService.config$.lastVal as any
    this.formGroup.patchValue(formValue)
  }

  onDebugChange($event: any) {
    debugLog('$event', $event)
    this.debugService.isDebug$.next($event.target.checked)
  }

}
