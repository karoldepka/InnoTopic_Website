import { OdmCollectionBackendListener, QueryOpts } from './OdmCollectionBackend'
import { OdmItemId } from './OdmItemId'

/**
 * In-memory test double for OdmCollectionBackend.
 *
 * Stores items in a plain Map so tests can verify persistence without
 * touching Firebase.  Call `seed(id, data)` to pre-populate the store
 * before attaching a listener.
 */
export class MockOdmCollectionBackend<TRaw> {

  private store = new Map<string, TRaw>()
  private _listener?: OdmCollectionBackendListener<TRaw, any>
  readonly calls = {
    saveNowToDb: [] as Array<{ id: string; data: TRaw; changedFieldsOnly?: Partial<TRaw> }>,
    deleteWithoutConfirmation: [] as string[],
  }

  seed(id: string, data: TRaw): this {
    this.store.set(id, data)
    return this
  }

  get storedItems(): ReadonlyMap<string, TRaw> {
    return this.store
  }

  // ---------- OdmCollectionBackend surface ----------

  setListener(
    listener: OdmCollectionBackendListener<TRaw, any>,
    _queryOpts: QueryOpts,
    callback: () => void,
  ): void {
    this._listener = listener
    this.store.forEach((data, id) => {
      listener.onAdded({ id } as any, data)
    })
    listener.onFinishedProcessingChangeSet()
    callback()
  }

  saveNowToDb(
    item: TRaw,
    id: string,
    _parentIds?: string[],
    _ancestorIds?: string[],
    changedFieldsOnly?: Partial<TRaw>,
  ): Promise<void> {
    const isNew = !this.store.has(id)
    this.store.set(id, item)
    this.calls.saveNowToDb.push({ id, data: item, changedFieldsOnly })
    if (this._listener) {
      if (isNew) {
        this._listener.onAdded({ id } as any, item)
      } else {
        this._listener.onModified({ id } as any, item)
      }
      this._listener.onFinishedProcessingChangeSet()
    }
    return Promise.resolve()
  }

  deleteWithoutConfirmation(itemId: OdmItemId | string): Promise<void> {
    const id = typeof itemId === 'string' ? itemId : (itemId as any).id ?? String(itemId)
    this.store.delete(id)
    this.calls.deleteWithoutConfirmation.push(id)
    if (this._listener) {
      this._listener.onRemoved({ id } as any)
      this._listener.onFinishedProcessingChangeSet()
    }
    return Promise.resolve()
  }

  loadChildrenOf(_id: any, _listener: OdmCollectionBackendListener<TRaw>): void {}

  loadTreeDescendantsOf(_ancestorId: any, _listener: OdmCollectionBackendListener<TRaw>): void {}
}
