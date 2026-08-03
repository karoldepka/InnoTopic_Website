import {ChangeDetectorRef, Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {g} from '../g'
import {FeatureService} from '../feature.service'
import {FeaturesConfig} from '../FeaturesConfig'
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {Config, ConfigService} from '../../../apps/OrYoL/core/config.service'

/** Plain, undecorated base holding `BaseComponent`'s actual logic (DI/config/`feat` bookkeeping)
 * - split out so a `@Directive()` (e.g. `AbstractCellComponent`) can share this logic too.
 * Angular disallows a `@Directive()` extending a `@Component()` (NG0903, "Directives cannot
 * inherit Components") - confirmed live: `AbstractCellComponent extends BaseComponent` crashed
 * the whole app at bootstrap the moment `AbstractCellComponent` became a `@Directive()` (needed
 * so its `@Input() cell` is recognized on subclasses - see that file's doc comment). An
 * undecorated class has no such restriction either way. */
export class BaseComponentLogic {

  configService = this.injector.get(ConfigService)

  config$: CachedSubject<Config> = this.configService.config$

  /** to have it in template scope */
  public g = g

  /** this way we refer to features specific to this component (enabled per page/feature basis)
   *
   * Initializing this could actually work nicely as injection token on feature modules!
   * */
  public feat = g.feat

  constructor(
    public injector: Injector
  ) {
    this.injector.get(FeatureService).config$.subscribe((cfg: FeaturesConfig) => {
      this.feat = cfg
      this.injector.get(ChangeDetectorRef).markForCheck()
      // TODO this could also trigger change detection
    })
  }

  // could have automatic rxjs subscribe/unsubscribe
  subscribeAuto() {

  }

}

/** This is syntactic sugar and automation to improve DX where angular has DX shortcomings
 * and to reduce boilerplate and distractions when coding ACTUAL FEATURES
 *
 * Provides basic bookkeeping and lifecycle and DI, reactivity, config
 * */
@Component({
  standalone: true,
  imports: [],
  selector: 'app-base',
  templateUrl: './base.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./base.component.sass'],
})
export class BaseComponent extends BaseComponentLogic /*implements OnInit*/ {
  constructor(injector: Injector) {
    super(injector)
  }
}
