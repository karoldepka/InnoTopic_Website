import {
  Injectable,
  Injector,
} from '@angular/core';
import {TreeModel} from './TreeModel'
import {NodeAddEvent} from './TreeListener'
import {DbTreeService} from './db-tree-service'
import { debugLog } from '../utils/log'
// import { AuthService } from '../core/auth.service'
import { TimeTrackingService } from '../time-tracking/time-tracking.service'
import {AuthService} from '../../../auth/auth.service'


@Injectable({providedIn: 'root'})
export class TreeService {

  private rootTreeModel: TreeModel<any> | undefined

  constructor(
    public injector: Injector,
    public dbTreeService: DbTreeService,
    public authService: AuthService,
    public timeTrackingService: TimeTrackingService /* just to ensure it subscribes for events before loadNodesTree */,
  ) { }

  /** Cached: every route-param-only navigation on /tree/:rootNodeId (e.g. "navigate into" a node)
   * makes Ionic's IonRouterOutlet construct a brand new TreeHostComponent for its page stack, even
   * though it's conceptually the same tree page. Before this cache, that meant a brand new,
   * initially-empty TreeModel + a brand new loadNodesTree() subscription reloading the *entire*
   * tree from scratch on every navigate-into - and since the freshly deep-linked node hadn't
   * streamed into *that* empty model yet, applyRouteParamToVisualRoot() in tree-host.component.ts
   * couldn't find it and fell back to the model's own default (its own root), which is exactly the
   * "visual root does not show" bug (title/breadcrumb missing right after navigating into a node -
   * *ngIf="! treeNode.isRoot" on app-node-content correctly hides content for an actual root).
   * Reusing one TreeModel for the app's lifetime fixes this and also stops the redundant reloads. */
  getRootTreeModel(/* TODO: specify root node(s) ID(s) */): TreeModel<any> {
    if (this.rootTreeModel) {
      return this.rootTreeModel
    }
    // const componentThis = this
    const treeModel = new TreeModel(this.injector, this.dbTreeService, this.authService, {
      onAfterNodeMoved() {

      }
    })
    this.dbTreeService.loadNodesTree(/* TODO: specify root node(s) ID(s) */{
      onNodeAddedOrModified(event: NodeAddEvent) {
        debugLog('loadNodesTree onNodeAddedOrModified', event)
        treeModel.onNodeAddedOrModified(event) // TODO around here I should handle incoming changes for reacting to TimeTracking change from remote
      },
      onNodeInclusionModified(nodeInclusionId, nodeInclusionData, newParentItemId: string) {
        // TODO: entry point for moving node to different parent?
        treeModel.onNodeInclusionModified(nodeInclusionId, nodeInclusionData, newParentItemId)
      }
    })
    this.rootTreeModel = treeModel
    return treeModel

  }
}
