import {
  Component, Injector,
  Input,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { DebugService } from '../../core/debug.service'
import { TreeHostComponent } from '../tree-host/tree-host.component'
// import { NgbPopoverConfig } from '@ng-bootstrap/ng-bootstrap'
import {PopoverController} from '@ionic/angular'
import {ToolbarPopoverComponent} from './toolbar-popover/toolbar-popover.component'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SearchComponent } from '../../search/search/search.component';
import { NgIf, AsyncPipe } from '@angular/common';
import { TimeTrackingToolbarComponent } from '../../time-tracking/time-tracking-toolbar/time-tracking-toolbar.component';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-toolbar',
    templateUrl: './toolbar.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./toolbar.component.sass'],
    imports: [FaIconComponent, SearchComponent, NgIf, TimeTrackingToolbarComponent, AsyncPipe, IonicModule]
})
export class ToolbarComponent extends BaseComponent implements OnInit {

  /* workaround for now */
  @Input() treeHost!: TreeHostComponent

  showExtraNavIcons = false

  constructor(
    public debugService: DebugService,
    // ngbPopoverConfig: NgbPopoverConfig,
    public popoverController: PopoverController,
    injector: Injector,
  ) {
    super(injector)
    // ngbPopoverConfig.placement = 'bottom-left' // 'right' // 'hover';
  }

  ngOnInit() {
  }

  async onClickMenuIcon($event: MouseEvent) {
    const popover = await this.popoverController.create({
      component: ToolbarPopoverComponent,
      event: $event,
      translucent: true,
      mode: 'ios',
      componentProps: {
        treeHost: this.treeHost,
      }
    });
    return await popover.present();

  }
}
