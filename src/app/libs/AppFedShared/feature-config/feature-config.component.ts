import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../base/base.component'
import {FeatureService} from '../feature.service'
import { IonicModule } from '@ionic/angular';
import { TranslatePipe } from '@ngx-translate/core';
// import packageJson from '../../../../package.json'

@Component({
    selector: 'app-feature-config',
    templateUrl: './feature-config.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./feature-config.component.sass'],
    imports: [IonicModule, TranslatePipe],
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

  get niceLooking(): boolean {
    return this.featureConfigService.niceLooking
  }

  onChangeNiceLooking($event: any) {
    this.featureConfigService.setNiceLooking($event.detail.checked)
  }

  get showWhatIUse(): boolean {
    return this.featureConfigService.showWhatIUse
  }

  onChangeShowWhatIUse($event: any) {
    this.featureConfigService.setShowWhatIUse($event.detail.checked)
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

  get voiceMemoRecordingEnabled(): boolean {
    return this.featureConfigService.voiceMemoRecordingEnabled
  }

  onChangeVoiceMemoRecordingEnabled($event: any) {
    this.featureConfigService.setVoiceMemoRecordingEnabled($event.detail.checked)
  }

  get voiceMemoPlaybackEnabled(): boolean {
    return this.featureConfigService.voiceMemoPlaybackEnabled
  }

  onChangeVoiceMemoPlaybackEnabled($event: any) {
    this.featureConfigService.setVoiceMemoPlaybackEnabled($event.detail.checked)
  }

}
