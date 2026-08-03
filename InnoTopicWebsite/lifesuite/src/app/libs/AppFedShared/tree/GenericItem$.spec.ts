import { GenericItem$ } from './GenericItem$'
import { GenericItem } from './GenericItem'

function makeFakeService(): any {
  return {
    className: 'GenericItem',
    throttleSaveToDbMs: 3000,
    throttleIntervalMs: 500,
    treeRootItemId: 'ROOT',
    saveNowToDb: jasmine.createSpy('saveNowToDb'),
    emitLocalItems: jasmine.createSpy('emitLocalItems'),
    itemHistoryService: { onPatch: jasmine.createSpy('onPatch') },
    syncStatusService: { handleSavingPromise: jasmine.createSpy('handleSavingPromise') },
    authService: { authUser$: { lastVal: { uid: 'user-1' } } },
  }
}

function makeItem(svc: any, data?: Partial<GenericItem>, parents?: GenericItem$[], id?: string): GenericItem$ {
  const item = Object.assign(new GenericItem(), data ?? {})
  return new GenericItem$(svc, id as any, item, parents as any)
}

// ---------------------------------------------------------------------------

describe('GenericItem$ — construction and initial state', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('currentVal reflects the initial data passed to the constructor', () => {
    const item$ = makeItem(svc, { title: 'My note' }, undefined, 'n1')
    expect(item$.currentVal?.title).toBe('My note')
  })

  it('val is an alias for currentVal', () => {
    const item$ = makeItem(svc, { title: 'A' }, undefined, 'n1')
    expect(item$.val).toBe(item$.currentVal)
  })

  it('isSelectedOrUnselected is accessible from currentVal', () => {
    const item$ = makeItem(svc, { isSelectedOrUnselected: true }, undefined, 'n1')
    expect(item$.currentVal?.isSelectedOrUnselected).toBe(true)
  })

  it('starts with no children', () => {
    const item$ = makeItem(svc, { title: 'solo' }, undefined, 'solo')
    expect(item$.getChildren().length).toBe(0)
    expect(item$.hasChildren).toBe(false)
  })
})

// ---------------------------------------------------------------------------

describe('GenericItem$ — patching', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('patchThrottled merges changes into currentVal', () => {
    const item$ = makeItem(svc, { title: 'Old' }, undefined, 'n1')
    item$.applyDataFromDbAndEmit(Object.assign(new GenericItem(), { title: 'Old' }))
    item$.patchThrottled({ title: 'New' })
    expect(item$.currentVal?.title).toBe('New')
  })

  it('patchThrottled can toggle isSelectedOrUnselected', () => {
    const item$ = makeItem(svc, { isSelectedOrUnselected: false }, undefined, 'n1')
    item$.applyDataFromDbAndEmit(Object.assign(new GenericItem(), { isSelectedOrUnselected: false }))
    item$.patchThrottled({ isSelectedOrUnselected: true })
    expect(item$.currentVal?.isSelectedOrUnselected).toBe(true)
  })

  it('patchThrottled accumulates into the pending DB patch', () => {
    const item$ = makeItem(svc, { title: 'A' }, undefined, 'n1')
    item$.applyDataFromDbAndEmit(Object.assign(new GenericItem(), { title: 'A' }))
    item$.patchThrottled({ title: 'B' })
    const pending = (item$ as any).snapshotPendingDbPatch?.()
    expect(pending?.title).toBe('B')
  })
})

// ---------------------------------------------------------------------------

describe('GenericItem$ — parent / child relationships', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('child is registered on the parent at construction time', () => {
    const parent = makeItem(svc, { title: 'Parent' }, undefined, 'p')
    const child  = makeItem(svc, { title: 'Child' }, [parent], 'c')
    expect(parent.getChildren()).toContain(child)
    expect(parent.hasChildren).toBe(true)
  })

  it('getPrimaryParent returns the first parent', () => {
    const parent = makeItem(svc, {}, undefined, 'p')
    const child  = makeItem(svc, {}, [parent], 'c')
    expect(child.getPrimaryParent()).toBe(parent)
  })

  it('getItemDepth reports 0 for root, 1 for child, 2 for grandchild', () => {
    const root  = makeItem(svc, {}, undefined, 'root')
    const child = makeItem(svc, {}, [root], 'child')
    const grand = makeItem(svc, {}, [child], 'grand')
    expect(root.getItemDepth()).toBe(0)
    expect(child.getItemDepth()).toBe(1)
    expect(grand.getItemDepth()).toBe(2)
  })

  it('getDescendants returns all descendants depth-first', () => {
    const root = makeItem(svc, {}, undefined, 'root')
    const c1   = makeItem(svc, {}, [root], 'c1')
    /* gc1 */   makeItem(svc, {}, [c1], 'gc1')
    /* c2  */   makeItem(svc, {}, [root], 'c2')
    expect(root.getDescendants().map((x: any) => x.id)).toEqual(['c1', 'gc1', 'c2'])
  })
})
