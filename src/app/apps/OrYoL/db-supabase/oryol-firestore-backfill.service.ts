import {Injectable} from '@angular/core'
import {ConcurrencyLimiter} from '../../../libs/AppFedShared/utils/promiseUtils'
import {CachedSubject} from '../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2'
// type-only - see the note in SupabaseTreeService.ts: a real import here would pull in
// TreeModel.ts's heavy runtime chain, which is fine only as long as nothing loads this file
// before that chain is fully defined.
import type {OryBaseTreeNode, OryNonRootTreeNode} from '../tree-model/TreeModel'
import {SupabaseTreeService} from './supabase-tree.service'

export interface OryolBackfillProgress {
  written: number
  failed: number
  total: number
  done: boolean
}

/** One-time copy of the already-loaded (Firestore-sourced) OrYoL tree into Supabase - see the
 * OrYoL tree migration plan. Triggered manually (the "Backfill to Supabase" button in the tree
 * toolbar's settings popover, gated behind debug mode) once the tree visually looks fully loaded
 * - Firestore's `onSnapshot` listeners are open-ended by design, so there's no reliable
 * from-code signal for "loading is done" to gate on automatically. `SupabaseTreeService
 * .backfillNode()` is an upsert, so re-running this (e.g. to pick up anything that streamed in
 * late, or to retry failures) is safe. */
@Injectable({providedIn: 'root'})
export class OryolFirestoreBackfillService {

  readonly progress$ = new CachedSubject<OryolBackfillProgress | undefined>(undefined)

  private running = false

  constructor(
    private supabaseTreeService: SupabaseTreeService,
  ) {
  }

  async run(root: OryBaseTreeNode): Promise<void> {
    if (this.running) {
      return
    }
    this.running = true
    try {
      const nodes = this.collectNonRootNodes(root)
      const limiter = new ConcurrencyLimiter(6)
      let written = 0
      let failed = 0
      this.progress$.next({written, failed, total: nodes.length, done: false})

      await Promise.all(nodes.map(({parent, node}) => limiter.run(async () => {
        try {
          await this.supabaseTreeService.backfillNode(parent, node)
          written++
        } catch (error) {
          failed++
          console.error('[OrYoL backfill] failed for node', node.itemId, error)
        }
        this.progress$.next({written, failed, total: nodes.length, done: false})
      })))

      this.progress$.next({written, failed, total: nodes.length, done: true})
    } finally {
      this.running = false
    }
  }

  private collectNonRootNodes(root: OryBaseTreeNode): Array<{parent: OryBaseTreeNode, node: OryNonRootTreeNode}> {
    const result: Array<{parent: OryBaseTreeNode, node: OryNonRootTreeNode}> = []
    const walk = (parent: OryBaseTreeNode) => {
      for (const child of parent.children ?? []) {
        result.push({parent, node: child})
        walk(child)
      }
    }
    walk(root)
    return result
  }
}
