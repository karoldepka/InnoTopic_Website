import {Component, Injector, OnInit, ChangeDetectionStrategy} from '@angular/core';
import {CommandsService} from '../../core/commands.service'
import {BaseComponent} from '../../../../libs/AppFedShared/base/base.component'

@Component({
  standalone: false,
  selector: 'app-tree-page',
  templateUrl: './tree-page.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./tree-page.component.scss']
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
