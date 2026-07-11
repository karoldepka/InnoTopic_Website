import {
  Component,
  OnInit,
  ChangeDetectionStrategy
} from '@angular/core';
import { TreeDragDropService } from 'primeng/api'
import { TreeService } from '../../tree-model/tree.service'
import {
  ApfBaseTreeNode, NodeFocusOptions, TreeCell,
  TreeModel,
} from '../../tree-model/TreeModel'
import { NodeContentComponent } from '../../tree-shared/node-content/node-content.component'
import { OryColumn } from '../../tree-shared/OryColumn'
import { debugLog } from '../../utils/log'
import { ActivatedRoute, Router } from '@angular/router'
import { DebugService } from '../../core/debug.service'
import {Command, CommandsService} from '../../core/commands.service'
import { NavigationService } from '../../core/navigation.service'
import {TreeTableNodeContent} from '../../tree-model/TreeTableNodeContent'
import {ApfNonRootTreeNode, RootTreeNode} from '../../tree-model/TreeNode'
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { NgIf } from '@angular/common';
import { PrimeNgTreeComponent } from '../../tree-primeng/prime-ng-tree/prime-ng-tree.component';
import { NestedTreeComponent } from '../../tree-nested/nested-tree/nested-tree.component';
import { IonicModule } from '@ionic/angular';


@Component({
    selector: 'app-tree-host',
    templateUrl: './tree-host.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./tree-host.component.scss'],
    imports: [ToolbarComponent, NgIf, PrimeNgTreeComponent, NestedTreeComponent, IonicModule]
})
export class TreeHostComponent implements OnInit {

  treeModel: TreeModel<TreeTableNodeContent>// = new TreeModel(this.treeService2)

  showTree = false

  pendingListeners = 0

  mapNodeToComponent = new Map<RootTreeNode, NodeContentComponent>()

  useNestedTree = true

  public showAllCols: boolean = true

  /** Set while a deep-linked rootNodeId from the URL hasn't resolved to a loaded node yet
   * (e.g. a fresh page load, before the tree stream has delivered it) - retried as items
   * arrive. Also suppresses the visualRoot->URL sync below from clobbering the still-pending
   * deep link back to '/tree'. */
  private pendingRootNodeIdFromRoute: string | undefined

  /** Same idea as pendingRootNodeIdFromRoute, but for navigationService.navigation$ (search
   * results, the time-tracking toolbar's "jump to tracked item") - navigation$ is a CachedSubject
   * that replays its last-ever value to a brand new TreeHostComponent (e.g. a fresh page load),
   * so the target node may genuinely not have streamed in yet. */
  private pendingNavigationTargetItemId: string | undefined

  constructor(
    public treeService: TreeService,
    public treeDragDropService: TreeDragDropService,
    private activatedRoute : ActivatedRoute,
    private router: Router,
    private debugService: DebugService,
    private commandsService: CommandsService,
    private navigationService: NavigationService,
  ) {
    // Assigned before any subscription below: navigation$/commands$ are CachedSubjects that
    // replay their last value synchronously on subscribe, so a navigation/command that already
    // happened before this component was constructed would otherwise fire into these callbacks
    // while treeModel is still undefined.
    this.treeModel = this.treeService.getRootTreeModel()

    this.navigationService.navigation$.subscribe((nodeId: string) => {
      this.tryNavigateToNodeId(nodeId)
    })

    commandsService.commands$.subscribe((command: Command) => {
      const lastFocusedNode = this.treeModel.focus.lastFocusedNode as ApfNonRootTreeNode // (RootTreeNode | OryTreeNode)
      /*  */ if ( command === 'reorderUp' ) {
        lastFocusedNode ?. reorderUp ?. ()
      } else if ( command === 'reorderDown' ) {
        lastFocusedNode ?. reorderDown ?. ()
      } else if ( command === 'toggleDone' ) {
        lastFocusedNode ?. content.toggleDone ?. ()
      } else if ( command === 'indentLeft' ) {
        lastFocusedNode ?. indentDecrease ?. ()
      } else if ( command === 'indentRight' ) {
        lastFocusedNode ?. indentIncrease ?. ()
      }
    })
    treeDragDropService.dragStop$.subscribe((...args: any[]) => {
      console.log('dragStop$', args)
    })

    const thisComponent = this
    this.treeModel.treeListener = {
      onAfterNodeMoved() {
        thisComponent.reFocusLastFocused()
      }
    }

  }

  reFocusLastFocused() {
    debugLog('reFocusLastFocused')
    setTimeout(() => {
      debugLog('reFocusLastFocused in setTimeout, ', this.treeModel.focus.lastFocusedNode, this.treeModel.focus.lastFocusedColumn)
      this.focus(this.treeModel.focus.lastFocusedCell)
    })
  }

  ngOnInit() {
    // router -> visualRoot. Drives both the initial deep link and browser back/forward.
    this.activatedRoute.params.subscribe(params => {
      this.applyRouteParamToVisualRoot(params['rootNodeId'])
    })

    // Data streams in async (Firestore/ODM), so a fresh deep link may target a node that
    // hasn't loaded yet - retry as items arrive rather than erroring out immediately.
    this.treeModel.dataItemsService.onItemAddedOrModified$.subscribe(() => {
      if (this.pendingRootNodeIdFromRoute) {
        this.applyRouteParamToVisualRoot(this.pendingRootNodeIdFromRoute)
      }
      if (this.pendingNavigationTargetItemId) {
        this.tryNavigateToNodeId(this.pendingNavigationTargetItemId)
      }
    })

    // visualRoot -> router. Centralized here so every navigateInto() call site (menu, toolbar,
    // "go to milestones", etc.) gets URL sync for free without touching each one - a past
    // attempt to call router.navigate() directly from a single call site (tree-node-menu-popover)
    // was flaky/racy, so this is intentionally the one place that owns the sync.
    this.treeModel.navigation.visualRoot$.subscribe((visualRoot: RootTreeNode) => {
      if (this.pendingRootNodeIdFromRoute) {
        return // don't clobber a still-resolving deep link back to '/tree'
      }
      const itemId = visualRoot === this.treeModel.root ? undefined : visualRoot.itemId
      const currentParam = this.activatedRoute.snapshot.params['rootNodeId']
      if ((itemId ?? undefined) === (currentParam ?? undefined)) {
        return
      }
      this.router.navigate(itemId ? ['/tree', itemId] : ['/tree'])
    })

    // Fast subtree-scoped fetch when navigating into a node - a no-op on backends that don't
    // support it (e.g. Firestore, which already loads everything upfront). The whole-tree
    // cache-then-incremental sync from loadNodesTree() keeps running regardless, so this is
    // purely "paint this subtree sooner", not a different data path.
    this.treeModel.navigation.visualRoot$.subscribe((visualRoot: RootTreeNode) => {
      if (visualRoot !== this.treeModel.root) {
        this.treeModel.treeService.loadSubtreeFast(visualRoot.itemId)
      }
    })

    setTimeout(() => {
      this.showTree = true
    }, 0 /*2000*/)
  }

  private tryNavigateToNodeId(nodeId: string) {
    const node = this.treeModel.getNodesByItemId(nodeId)[0]
    if (!node) {
      this.pendingNavigationTargetItemId = nodeId
      return
    }
    this.pendingNavigationTargetItemId = undefined
    const dayPlanAncestor = node.findAncestorMatching((n: any) => (n.content as any)?.isDayPlan)
    this.treeModel.navigation.navigateInto(dayPlanAncestor ?? node)
    this.focusNode(node)
  }

  private applyRouteParamToVisualRoot(rootNodeId: string | undefined) {
    if (!rootNodeId) {
      this.pendingRootNodeIdFromRoute = undefined
      this.treeModel.navigation.navigateToRoot()
      return
    }
    const node = this.treeModel.getNodesByItemId(rootNodeId)[0]
    if (!node) {
      this.pendingRootNodeIdFromRoute = rootNodeId
      return
    }
    this.pendingRootNodeIdFromRoute = undefined
    this.treeModel.navigation.navigateInto(node)
  }

  appendNode() {
    const newNode = this.treeModel.navigation.visualRoot!.addChild()
    setTimeout(() => {
      this.focusNode(newNode)
    })
  }

  expandAll() {
    this.treeModel.navigation.visualRoot?.expansion?.setExpanded(true, true)
  }

  collapseAll() {
    this.treeModel.navigation.visualRoot?.expansion?.setExpanded(false, true)
  }

  registerNodeComponent(nodeContentComponent: NodeContentComponent) {
    this.mapNodeToComponent.set(nodeContentComponent.treeNode, nodeContentComponent)
  }

  onNodeContentComponentDestroyed(nodeContentComponent: NodeContentComponent) {
    this.mapNodeToComponent.delete(nodeContentComponent.treeNode)
  }

  getComponentForNode(node: ApfBaseTreeNode) {
    return this.mapNodeToComponent.get(node)
  }

  focusNode(node: ApfBaseTreeNode | null | undefined, column?: OryColumn | null, options?: NodeFocusOptions) {
    debugLog('focusNode', arguments)
    if ( ! node ) {
      return
    }
    node.expansion.setExpansionOnParentsRecursively(true)
    setTimeout(() => {
      this.treeModel.focus.ensureNodeVisibleAndFocusIt(node, column, options)
      const component: NodeContentComponent | undefined = this.getComponentForNode(node)
      if ( component ) {
        component.focus(column, options)
      }
    })
  }

  navigateUp($event: Event) {
    this.treeModel.navigation.navigateToParent()
    this.reFocusLastFocused() // FIXME: move this to treeModel or reaction to navigation (or maybe it is there already)
  }

  navigateToRoot($event: Event) {
    this.treeModel.navigation.navigateToRoot()
    this.reFocusLastFocused() // FIXME: move this to treeModel or reaction to navigation (or maybe it is there already)
  }

  newNodeAtVisualRoot() {
    const newTreeNode = this.treeModel.navigation.visualRoot!.addChild()
    this.focusNode(newTreeNode)
  }

  navigateIntoItemIdExpandAndFocus(itemId: string) {
    const parentNode = this.treeModel.getNodesByItemId(itemId)[0]
    parentNode.navigateInto()
    parentNode.expansion.setExpanded(true, {recursive: false})
    this.focusNode(parentNode)
  }

  goToMilestones() {
    this.navigateIntoItemIdExpandAndFocus('item_28cca5d5-6935-4fb1-907a-44f1f1898851')
  }

  goToShopping() {
    this.navigateIntoItemIdExpandAndFocus('item_dee48f04-4795-41d4-a609-2af6ac83f3d9')
  }

  private createChildNavigateAndFocus(itemId: string) {
    const newNode = this.treeModel.getNodesByItemId(itemId)[0].addChild()
    newNode.navigateInto()
    this.focusNode(newNode)
  }

  newJournalEntry() {
    this.createChildNavigateAndFocus('item_50872811-928d-4878-94c0-0df36667be0e')
  }

  newNote() {
    this.createChildNavigateAndFocus('item_91c761a4-0308-43a1-8634-5164cb4d5b0e')
  }

  planToday(createNew?: boolean) {
    this.commandsService.planToday()
    const plansNode = this.treeModel.getNodesByItemId('item_35023937-195c-4b9c-b265-5e8a01cf397e')[0]
    if ( !plansNode ) return
    let lastPlanNode = plansNode.lastChildNode
    if ( createNew ) {
      lastPlanNode = plansNode.addChild()
    }
    lastPlanNode?.navigateInto()
    lastPlanNode?.expansion.setExpanded(true, {recursive: false})
    this.focusNode(lastPlanNode)
  }

  public focus(cell: TreeCell) {
    this.focusNode(cell.node, cell.column)
  }
}
