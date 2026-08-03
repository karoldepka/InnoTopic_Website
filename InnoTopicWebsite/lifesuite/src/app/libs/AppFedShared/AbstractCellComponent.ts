import {Directive, ElementRef, Injector, Input, OnDestroy, OnInit} from '@angular/core'
import {CellNavigationService} from './cell-navigation.service'
import {OdmCell} from './tree/cells/OdmCell'
import {BaseComponentLogic} from './base/base.component'

/** No selector: applied only via inheritance, never directly to an element - the standard
 * Angular pattern for an abstract base class that needs its own `@Input()`/`@Output()`s (`cell`
 * here) to actually be recognized on standalone `@Component()` subclasses. Was `@Injectable()`
 * until GH #89's unification work surfaced that subclasses' inherited `cell` input silently
 * wasn't being picked up by the compiler (NG8002 "Can't bind to 'cell'") - affected every
 * existing subclass (`RichTextEditComponent`, etc.), not just newly-added ones. Extends
 * `BaseComponentLogic` (the undecorated split-out of `BaseComponent`'s actual logic), NOT
 * `BaseComponent` itself - `BaseComponent` is a real `@Component()`, and Angular disallows a
 * `@Directive()` extending a `@Component()` (NG0903) - confirmed live: extending `BaseComponent`
 * here crashed the entire app at bootstrap the moment this became a `@Directive()`. */
@Directive()
export abstract class AbstractCellComponent extends BaseComponentLogic implements OnInit, OnDestroy {

  @Input()
  public cell!: OdmCell // = new OdmCell() /* FIXME: dummy */

  public cellNavigationService = this.injector.get(CellNavigationService)

  public elementRef = this.injector.get(ElementRef)

  get viewportTop() {
    return this.elementRef.nativeElement.getBoundingClientRect().top
  }


  constructor(
    injector: Injector,
  ) {
    super(injector)
  }

  /* override */ ngOnInit(): void {
    this.cellNavigationService.register(this)
  }

  /* override */ ngOnDestroy(): void {
    this.cellNavigationService.deregister(this)
  }

  abstract focus(): void

}
