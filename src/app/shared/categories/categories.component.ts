import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MessageService, TreeDragDropService, TreeNode, PrimeTemplate } from 'primeng/api'
import {NodeService} from './node.service'
import { OdmTreeComponent } from '../../libs/AppFedShared/tree/tree/odm-tree.component';
import { Bind } from 'primeng/bind';
import { Tree } from 'primeng/tree';

@Component({
    selector: 'app-categories',
    providers: [TreeDragDropService, MessageService],
    templateUrl: './categories.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./categories.component.sass'],
    imports: [
        OdmTreeComponent,
        Bind,
        Tree,
        PrimeTemplate,
    ],
})
export class CategoriesComponent implements OnInit {

  files1!: TreeNode[];

  files2!: TreeNode[];

  files3!: TreeNode[];

  files4!: TreeNode[];

  constructor(private nodeService: NodeService) { }

  ngOnInit() {
    this.nodeService.getFiles().then((files) => this.files1 = files);
    this.nodeService.getFiles().then((files) => this.files2 = files);
    this.files3 = [{
      label: "Backup",
      data: "Backup Folder",
      expandedIcon: "pi pi-folder-open",
      collapsedIcon: "pi pi-folder"
    }
    ];

    this.files4 = [{
      label: "Storage",
      data: "Storage Folder",
      expandedIcon: "pi pi-folder-open",
      collapsedIcon: "pi pi-folder"
    }
    ];
  }
}
