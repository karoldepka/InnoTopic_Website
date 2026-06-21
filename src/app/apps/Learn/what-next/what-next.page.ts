import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {ThemeService} from '../../../libs/AppFedShared/theme-config/theme.service'
import { Router, RouterLink } from '@angular/router'
import {FeatureService} from '../../../libs/AppFedShared/feature.service'
import {BaseComponent} from '../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { AppLogoComponent } from '../../Common/app-logo/app-logo.component';
import { SyncStatusIconComponent } from '../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { NgIf } from '@angular/common';
import { QuizButtonComponent } from '../shared/quiz-button/quiz-button.component';
import { EnergyGraphComponent } from '../energy-graph/energy-graph.component';

@Component({
    selector: 'app-what-next',
    templateUrl: './what-next.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./what-next.page.scss'],
    imports: [
        IonicModule,
        AppLogoComponent,
        SyncStatusIconComponent,
        NgIf,
        RouterLink,
        QuizButtonComponent,
        EnergyGraphComponent,
    ],
})
export class WhatNextPage extends BaseComponent implements OnInit {

  constructor(
    public themeService: ThemeService,
    public featureService: FeatureService,
    public router: Router,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

  async cravingFun() {
    // TODO: popup with fancy image of doing smth fun. Piorun, spread wings.
    this.themeService.applyRandomTheme()
    await this.router.navigateByUrl('/fun')
  }
}
