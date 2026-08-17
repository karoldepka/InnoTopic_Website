import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommandsService} from '../../core/commands.service'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'
import { IonicModule } from '@ionic/angular';
import { NgIf } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { SyncStatusIconComponent } from '../../../../libs/AppFedShared/odm/sync-status/sync-status-icon.component';
import { TreeHostComponent } from '../../tree-host/tree-host/tree-host.component';

@Component({
    selector: 'app-tree-page',
    templateUrl: './tree-page.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./tree-page.component.scss'],
    imports: [IonicModule, NgIf, FaIconComponent, SyncStatusIconComponent, TreeHostComponent]
})
export class TreePageComponent extends BaseComponent implements OnInit {

  // TODO: route handling should be here, not in TreeHostComponent

  constructor(
    public commandsService: CommandsService,
    injector: Injector,
  ) {
    super(injector)
  }

  ngOnInit() {
  }

}
