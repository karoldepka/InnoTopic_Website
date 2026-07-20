import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core'
import {IonicModule} from '@ionic/angular'
import {AuthService} from '../../auth/auth.service'
import {GenericItemsService} from '../../libs/AppFedShared/tree/generic-items.service'
import {getUserTreeRootId} from '../../libs/AppFedShared/tree/UserTreeRoot'
import {fieldVirtualNodeId} from '../../libs/AppFedShared/tree/cells/SlotDescriptor'
import {createChildUnderSlot, getBareSlotChildren$} from '../../libs/AppFedShared/tree/BareSlotChildren'
import {OdmTreeNode} from '../../libs/AppFedShared/tree/tree-node/OdmTreeNode'
import {GenericItem} from '../../libs/AppFedShared/tree/GenericItem'
import {GenericItem$} from '../../libs/AppFedShared/tree/GenericItem$'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {AsyncPipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {CategoryTreeNodeComponent} from '../../libs/AppFedShared/tree/category-tree-node/category-tree-node.component'

/** GH #89's real categories tree - previously a dead PrimeNG demo scratchpad (placeholder text,
 * hardcoded mock arrays, an unbound `<app-tree>` that accidentally rendered Learn's tree root).
 * Top-level categories are a bare slot (`kind: 'slot'` convention, no `dataFieldKey`) off the
 * one per-user root (`getUserTreeRootId()`, `libs/AppFedShared/tree/UserTreeRoot.ts` - built
 * earlier in this same unification effort but not wired to anything real until now) - real
 * `GenericItem` category items nest arbitrarily deep underneath via the normal parent-child
 * mechanism (`CategoryTreeNodeComponent`), same as any other tree. */
@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./categories.component.sass'],
  imports: [IonicModule, AsyncPipe, FormsModule, CategoryTreeNodeComponent],
})
export class CategoriesComponent implements OnInit {

  private userRootItem$!: GenericItem$
  private categoriesSlotId!: string

  topLevelCategoryNodes$!: Observable<OdmTreeNode<GenericItem$>[]>

  newCategoryTitle = ''

  constructor(
    private authService: AuthService,
    private genericItemsService: GenericItemsService,
  ) {
  }

  ngOnInit(): void {
    // Every route this component is reachable from already requires auth (matches every other
    // per-user well-known root - OdmService2.treeRootItem, VirtualSlotStatesOdmService.
    // obtainItem$ById(), etc. - none of which handle a logged-out fallback either).
    const userRootId = getUserTreeRootId(this.authService.userId as string)
    this.userRootItem$ = this.genericItemsService.obtainItem$ById(userRootId as any)
    this.categoriesSlotId = fieldVirtualNodeId(userRootId, 'categories')

    this.topLevelCategoryNodes$ = getBareSlotChildren$(this.userRootItem$, this.categoriesSlotId).pipe(
      map(children => children.map(child$ => new OdmTreeNode(undefined, child$))),
    )
  }

  addTopLevelCategory(): void {
    const title = this.newCategoryTitle.trim()
    if (!title) {
      return
    }
    createChildUnderSlot(this.userRootItem$, this.categoriesSlotId, Object.assign(new GenericItem(), {title}))
    this.newCategoryTitle = ''
  }

}
