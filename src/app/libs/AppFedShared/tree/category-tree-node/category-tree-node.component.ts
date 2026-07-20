import {ChangeDetectionStrategy, Component, Input, OnInit, forwardRef} from '@angular/core'
import {AsyncPipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {OdmTreeNode} from '../tree-node/OdmTreeNode'
import {OdmCell} from '../cells/OdmCell'
import {GenericItem} from '../GenericItem'
import {GenericItem$} from '../GenericItem$'
import {RichTextEditCellComponent} from '../cells/rich-text-edit-cell/rich-text-edit-cell.component'

/** One node in the real (GH #89 "build it for real") categories tree - a plain `GenericItem`
 * with a `title`, nested arbitrarily deep via the normal parent-child mechanism every other
 * `OdmItem$2`-based tree already uses (not a bare-slot grouping - only the tree's overall root is
 * a bare slot, see `CategoriesComponent`). Self-recursive rather than reusing the existing
 * `OdmTreeNode`/`OdmTreeNodeComponent`/`OdmTreeNodeContentComponent` stack - that stack turned out
 * to be Learn-specific in practice (`OdmTreeNodeComponent.addChild()` hardcodes a new `LearnItem`;
 * `OdmTreeNodeContentComponent` hardcodes a `title`+`answer` two-column layout, `answer` having
 * no meaning for a category) despite its generic-looking `OdmTreeNode<OdmItem$2<any,...>>` typing
 * - safer to keep this small and dedicated than to generalize actively-used Learn code as a
 * side-effect of an unrelated feature. */
@Component({
  selector: 'app-category-tree-node',
  templateUrl: './category-tree-node.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./category-tree-node.component.sass'],
  imports: [IonicModule, FormsModule, AsyncPipe, RichTextEditCellComponent, forwardRef(() => CategoryTreeNodeComponent)],
})
export class CategoryTreeNodeComponent implements OnInit {

  @Input() treeNode!: OdmTreeNode<GenericItem$>

  titleCell!: OdmCell

  newChildTitle = ''

  ngOnInit(): void {
    this.titleCell = new OdmCell(this.treeNode, {id: 'title', type: 'text'})
    this.treeNode.requestLoadChildren()
  }

  toggleExpanded(): void {
    this.treeNode.isExpanded = !this.treeNode.isExpanded
  }

  addChild(): void {
    const title = this.newChildTitle.trim()
    if (!title) {
      return
    }
    const parent$ = this.treeNode.item$
    const odmService = parent$.odmService
    const newItem = odmService.newItem(undefined, Object.assign(new GenericItem(), {title}), [parent$], {createdLocally: true})
    newItem.saveNowToDb()
    this.newChildTitle = ''
    this.treeNode.isExpanded = true
  }

}
