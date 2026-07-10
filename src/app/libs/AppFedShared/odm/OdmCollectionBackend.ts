import {Injector} from "@angular/core";
import {OdmItemId} from "./OdmItemId";
import {OdmBackend} from "./OdmBackend";
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'
import {AuthService} from '../../../auth/auth.service'

/* FIXME: unify with OdmItemId */
export type ItemId = string & { type: 'ItemId' }

export type QueryOpts = {
  comments: string,
  limit?: number,
  offset?: number,
  fromLocalCache?: boolean,
  oneTimeGet: boolean,
}

export abstract class OdmCollectionBackendListener<
  TRaw,
  TItemId extends OdmItemId<TRaw> = OdmItemId<TRaw>
  >
{
  abstract onAdded(addedItemId: TItemId, addedItemData: TRaw): void
  abstract onModified(modifiedItemId: TItemId, modifiedItemData: TRaw): void
  abstract onRemoved(removedItemId: TItemId): void
  abstract onFinishedProcessingChangeSet(): void
}


export abstract class OdmCollectionBackend<
  TRaw,
  TItemId extends OdmItemId<TRaw> = OdmItemId<TRaw>
  > {

  listener ? : OdmCollectionBackendListener<TRaw>

  collectionBackendReady$ = this.odmBackend.backendReady$

  dbCollection$ = new CachedSubject<TRaw[]>([])

  authService = this.injector.get(AuthService)

  protected constructor(
    protected injector: Injector,
    protected className: string,
    protected odmBackend: OdmBackend,
  ) {
  }

  /** Resolves once auth has settled and this backend is ready to accept queries. Read paths
   * (setListener/loadChildrenOf/loadTreeDescendantsOf) already gate on collectionBackendReady$
   * before querying - writes (saveNowToDb/deleteWithoutConfirmation) need the same guard, since
   * calling requireUserId() synchronously throws immediately if a save is triggered before the
   * first post-login auth signal arrives (e.g. a UI action fired right as a page renders, before
   * authUser$'s first emission has landed) instead of just waiting the moment out. */
  protected waitUntilReady(): Promise<void> {
    // No unsubscribe here, matching every other collectionBackendReady$.subscribe(...) call in
    // this file's subclasses (setListener/loadChildrenOf/loadTreeDescendantsOf) - CachedSubject
    // replays its cached value synchronously to a new subscriber, so referencing a `const`
    // subscription handle inside this same callback would hit it mid-initialization.
    return new Promise<void>(resolve => {
      this.collectionBackendReady$.subscribe(() => resolve())
    })
  }

  abstract saveNowToDb(
    item: TRaw,
    id: ItemId,
    parentIds?: ItemId[],
    ancestorIds?: ItemId[],
    /** When provided, only these fields are written to the document (merge), instead of the
     * whole `item`. `item` is still used for full version-history snapshots. */
    changedFieldsOnly?: Partial<TRaw>,
  ): Promise<any>

  abstract deleteWithoutConfirmation(itemId: OdmItemId): Promise<any>

  public setListener(listener: OdmCollectionBackendListener<TRaw, TItemId>, queryOpts: QueryOpts, callback: () => void): void
    /*: Promise<any> | undefined*/ {
    this.listener = listener
  }

  abstract loadChildrenOf(id: TItemId, listener: OdmCollectionBackendListener<TRaw>): void

  abstract loadTreeDescendantsOf(ancestorId: TItemId, listener: OdmCollectionBackendListener<TRaw>): void

}
