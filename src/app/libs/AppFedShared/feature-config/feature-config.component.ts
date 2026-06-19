import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {BaseComponent} from '../base/base.component'
import {FeatureService} from '../feature.service'
// import packageJson from '../../../../package.json'

@Component({
  standalone: false,
  selector: 'app-feature-config',
  templateUrl: './feature-config.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./feature-config.component.sass'],
})
export class FeatureConfigComponent extends BaseComponent implements OnInit {



  constructor(
    public featureConfigService: FeatureService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {}

  onChangeAllFeatures($event: any) {
    this.featureConfigService.setEnableAll($event.detail.checked)
    // enableAll = $event.target.value
  }

}
