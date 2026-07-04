import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../base/base.component'
import {FeatureService} from '../feature.service'
import { IonicModule } from '@ionic/angular';
// import packageJson from '../../../../package.json'

@Component({
    selector: 'app-feature-config',
    templateUrl: './feature-config.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./feature-config.component.sass'],
    imports: [IonicModule],
})
export class FeatureConfigComponent extends BaseComponent implements OnInit {



  constructor(
    public featureConfigService: FeatureService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  get enableAll(): boolean {
    return this.featureConfigService.enableAll
  }

  onChangeAllFeatures($event: any) {
    this.featureConfigService.setEnableAll($event.detail.checked)
    // enableAll = $event.target.value
  }

  get beforeProductization(): boolean {
    return this.featureConfigService.beforeProductization
  }

  onChangeBeforeProductization($event: any) {
    this.featureConfigService.setBeforeProductization($event.detail.checked)
  }

  get firestoreEnabled(): boolean {
    return this.featureConfigService.firestoreEnabled
  }

  onChangeFirestoreEnabled($event: any) {
    this.featureConfigService.setFirestoreEnabled($event.detail.checked)
  }

}
