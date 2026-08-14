import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { IkigaiDiagramComponent } from './ikigai-diagram/ikigai-diagram.component';
import { RadicalCandorComponent } from './radical-candor/radical-candor.component';
import { EnergyComponent } from './energy/energy.component';
import { FlowStateComponent } from './flow-state/flow-state.component';
import { GrowthDiagramComponent } from './growth-diagram/growth-diagram.component';
import { DoodleOverlayComponent } from './doodle-overlay/doodle-overlay.component';

@Component({
    selector: 'app-life-overviews',
    templateUrl: './life-overviews.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./life-overviews.page.scss'],
    imports: [
        IonicModule,
        IkigaiDiagramComponent,
        RadicalCandorComponent,
        EnergyComponent,
        FlowStateComponent,
        GrowthDiagramComponent,
        DoodleOverlayComponent,
    ],
})
export class LifeOverviewsPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
