import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NestedTreeNodeComponent} from './nested-tree-node/nested-tree-node.component'
import {NestedTreeComponent} from './nested-tree/nested-tree.component'
import {TreeSharedModule} from '../tree-shared/tree-shared.module'

@NgModule({
    imports: [
        CommonModule,
        TreeSharedModule,
        NestedTreeComponent,
        NestedTreeNodeComponent,
    ],
    exports: [
        NestedTreeComponent,
    ]
})
export class TreeNestedModule { }
