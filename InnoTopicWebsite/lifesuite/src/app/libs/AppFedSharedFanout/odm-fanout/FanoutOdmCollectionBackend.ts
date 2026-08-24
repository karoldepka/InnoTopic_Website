import {Injector} from '@angular/core'
import {ItemId, OdmCollectionBackend, OdmCollectionBackendListener, QueryOpts} from '../../AppFedShared/odm/OdmCollectionBackend'
import {OdmItemId} from '../../AppFedShared/odm/OdmItemId'
import {ConcurrencyLimiter} from '../../AppFedShared/utils/promiseUtils'
import {FanoutOdmBackend} from './FanoutOdmBackend'
import {OdmBackfillProgressService} from '../../AppFedShared/odm/odm-backfill-progress.service'

export class FanoutOdmCollectionBackend<TRaw> extends OdmCollectionBackend<TRaw> {
  public collectionName = this.className

  /** Supabase, Neon, and Mongo - all equal, no distinguished "source of truth". */
  private peers: OdmCollectionBackend<TRaw>[]

  // A full-collection load / backfill replication can burst many writes at once - without a cap,
  // one fetch() per peer per item exhausts the browser's connection pool
  // (net::ERR_INSUFFICIENT_RESOURCES) and writes past that point just fail.
  private replicationLimiter = new ConcurrencyLimiter(6)

  private backfillSource: OdmCollectionBackend<TRaw>
  private backfillProgress: OdmBackfillProgressService

  constructor(
    injector: Injector,
    className: string,
    private fanoutBackend: FanoutOdmBackend,
    public readonly opts: { dontStoreVersionHistory: boolean },
  ) {
    super(injector, className, fanoutBackend)
    // A single peer's own failure shouldn't pop a window.alert() for the user - saveNowToDb()
    // below already aggregates all three into one promise/error the caller does see.
    const peerOpts = {...opts, silentErrors: true}
    this.peers = fanoutBackend.peerBackends.map(backend =>
      backend.createCollectionBackend<TRaw>(injector, className, peerOpts)
    )
    this.backfillSource = fanoutBackend.backfillSourceBackend.createCollectionBackend<TRaw>(injector, className, peerOpts)
    this.backfillProgress = injector.get(OdmBackfillProgressService)
    this.backfillFromSupabase()
  }

  /** One-time historical backfill: pages through every existing item this collection already has
   * in Supabase (the pre-fanout source of truth) and writes each one straight into the other
   * peers, so Neon/Mongo start out equivalent to Supabase instead of empty. Runs automatically
   * the first time this collection is constructed (mirrors how OdmService2 already auto-loads a
   * collection's data on construction) and is a no-op on every run after the first, tracked via a
   * localStorage flag per collection - there's a single user (this app has no multi-tenancy), so
   * one browser completing this once is enough to cover all the data that will ever need it. */
  /** Explicitly reruns a collection's historical replication for the Sync menu, even when the
   * one-time automatic backfill has already completed. */
  syncFromSupabaseNow(): Promise<void> {
    return this.backfillFromSupabase(true)
  }

  private async backfillFromSupabase(force = false): Promise<void> {
    if (typeof localStorage === 'undefined') return
    const flagKey = `fanoutBackfilled_${this.collectionName}`
    if (!force && localStorage.getItem(flagKey) === 'true') {
      this.backfillProgress.start(this.collectionName)
      this.backfillProgress.finish(this.collectionName)
      return
    }

    try {
      this.backfillProgress.start(this.collectionName)
      await this.waitUntilReady()
      const targets = this.peers.filter(peer => peer !== this.backfillSource)
      const pageSize = 1000
      const items: Array<{id: OdmItemId<TRaw>, data: TRaw}> = []
      for (let offset = 0; ; offset += pageSize) {
        const page = await this.fetchBackfillPage(offset, pageSize)
        items.push(...page)
        if (page.length < pageSize) break
      }
      this.backfillProgress.setTotal(this.collectionName, items.length)
      await Promise.all(items.map(async ({id, data}) => {
        await Promise.all(targets.map(target =>
          this.replicationLimiter.run(() => target.saveNowToDb(data, id as ItemId)).catch(() => undefined)
        ))
        this.backfillProgress.incrementDone(this.collectionName)
      }))
      localStorage.setItem(flagKey, 'true')
      this.backfillProgress.finish(this.collectionName)
    } catch (error) {
      this.backfillProgress.fail(this.collectionName)
      console.error('[Fanout ODM] backfillFromSupabase failed', 'collectionName', this.collectionName, error)
    }
  }

  private fetchBackfillPage(offset: number, limit: number): Promise<Array<{id: OdmItemId<TRaw>, data: TRaw}>> {
    return new Promise(resolve => {
      const items: Array<{id: OdmItemId<TRaw>, data: TRaw}> = []
      this.backfillSource.setListener(
        {
          onAdded: (id, data) => items.push({id, data}),
          onModified: (id, data) => items.push({id, data}),
          onRemoved: () => undefined,
          onFinishedProcessingChangeSet: () => resolve(items),
        },
        {
          comments: 'fanout backfill page',
          limit,
          offset,
          fromLocalCache: false,
          ignoreSyncCursor: true,
          oneTimeGet: true,
        },
        () => undefined,
      )
    })
  }

  /** Waits for every peer to confirm before resolving - a save is only "done" once Supabase,
   * Neon, and Mongo have all persisted it. Slower than racing, but no peer can silently miss a
   * write the others accepted. */
  saveNowToDb(item: TRaw, id: ItemId, parentIds?: ItemId[], ancestorIds?: ItemId[], changedFieldsOnly?: Partial<TRaw>): Promise<any> {
    return Promise.all(this.peers.map(peer => peer.saveNowToDb(item, id, parentIds, ancestorIds, changedFieldsOnly)))
  }

  deleteWithoutConfirmation(itemId: OdmItemId): Promise<any> {
    return Promise.all(this.peers.map(peer => peer.deleteWithoutConfirmation(itemId)))
  }

  override setListener(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    super.setListener(listener, queryOpts, callback)
    this.raceQuery(listener, (peer, wrapped) => peer.setListener(wrapped, queryOpts, callback))
  }

  loadChildrenOf(parentId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.raceQuery(listener, (peer, wrapped) => peer.loadChildrenOf(parentId, wrapped))
  }

  loadTreeDescendantsOf(ancestorId: ItemId, listener: OdmCollectionBackendListener<TRaw>): void {
    this.raceQuery(listener, (peer, wrapped) => peer.loadTreeDescendantsOf(ancestorId, wrapped))
  }

  /** Queries every peer at once. Whichever peer's change-set finishes first "wins" the race for
   * this query - its items are forwarded to the real listener (and backfilled into the other
   * peers, catching any drift). Peers that lose the race keep running (their own polling, if any,
   * isn't cancelled - the interfaces here don't expose a way to stop mid-flight), but their data is
   * never forwarded to the caller, since a fast-but-partial response from a peer still catching up
   * must never shadow a slower-but-complete one.
   *
   * The one case that invariant alone doesn't cover: a peer that responds fast because it's
   * *empty* (e.g. Neon/Mongo before their one-time backfillFromSupabase() finishes) rather than
   * because it's genuinely caught up. A literal first-response-wins race would let that empty
   * result "win" and shadow Supabase's real data arriving moments later. So an empty change-set
   * only wins once *every* peer has independently reported empty - real data from any peer always
   * preempts that, no matter how many peers already finished empty-handed. */
  private raceQuery(
    listener: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>,
    attach: (peer: OdmCollectionBackend<TRaw>, wrapped: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>>) => void,
  ): void {
    let winner: OdmCollectionBackend<TRaw> | null = null
    const emptyFinishers = new Set<OdmCollectionBackend<TRaw>>()

    const declareEmptyWinnerIfUnanimous = () => {
      if (winner === null && emptyFinishers.size === this.peers.length) {
        winner = this.peers[0] // arbitrary - every peer agrees there's nothing to show
        listener.onFinishedProcessingChangeSet()
      }
    }

    for (const peer of this.peers) {
      const wrapped: OdmCollectionBackendListener<TRaw, OdmItemId<TRaw>> = {
        onAdded: (id, data) => {
          winner ??= peer
          if (winner !== peer) return
          this.replicateToOtherPeers(peer, data, id)
          listener.onAdded(id, data)
        },
        onModified: (id, data) => {
          winner ??= peer
          if (winner !== peer) return
          this.replicateToOtherPeers(peer, data, id)
          listener.onModified(id, data)
        },
        onRemoved: id => {
          if (winner !== peer) return
          listener.onRemoved(id)
        },
        onFinishedProcessingChangeSet: () => {
          if (winner === peer) {
            listener.onFinishedProcessingChangeSet()
            return
          }
          if (winner !== null) return // another peer already won with real data
          emptyFinishers.add(peer)
          declareEmptyWinnerIfUnanimous()
        },
      }
      attach(peer, wrapped)
    }
  }

  private replicateToOtherPeers(
    winnerPeer: OdmCollectionBackend<TRaw>,
    item: TRaw,
    id: ItemId | OdmItemId<TRaw>,
  ): void {
    for (const peer of this.peers) {
      if (peer === winnerPeer) continue
      // Other peers already log their own failures (silentErrors) - nothing more to do here.
      this.replicationLimiter.run(() => peer.saveNowToDb(item, id as ItemId)).catch(() => undefined)
    }
  }
}
