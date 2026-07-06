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
import { LEARN_LIST_OPTIONS_LOCAL_STORAGE_KEY } from '../search-or-add-learnable-item/list-processing'
import { ListOptionsData } from '../search-or-add-learnable-item/list-options'

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
    // GH issue #38: the fun-craving panic button - opens /learn's task/learn list pre-sorted by
    // fun descending, mental effort ascending, then most-recently-touched. Writes the preset
    // directly to the same localStorage key ListProcessing reads on construction (there's no
    // live instance of it here to patch - this page's ListProcessing doesn't exist until /learn
    // itself is navigated to).
    const optionsPatch: Partial<ListOptionsData> = { preset: 'funCravingPanic' }
    localStorage.setItem(LEARN_LIST_OPTIONS_LOCAL_STORAGE_KEY, JSON.stringify(optionsPatch))
    await this.router.navigateByUrl('/learn')
  }
}
