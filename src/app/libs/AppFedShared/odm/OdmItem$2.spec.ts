import {
  OdmItem$2,
  ODM_ORDER_STEP,
  summarizePatch,
  convertUndefinedFieldValsToNull,
} from './OdmItem$2'

/** Minimal fake OdmService2 surface needed to construct + exercise OdmItem$2 in isolation. */
function makeFakeService(): any {
  const svc: any = {
    className: 'TestItem',
    throttleSaveToDbMs: 3000,
    throttleIntervalMs: 500,
    treeRootItemId: 'ROOT',
    saveNowToDb: jasmine.createSpy('saveNowToDb'),
    emitLocalItems: jasmine.createSpy('emitLocalItems'),
    itemHistoryService: { onPatch: jasmine.createSpy('onPatch') },
    syncStatusService: { handleSavingPromise: jasmine.createSpy('handleSavingPromise') },
    authService: { authUser$: { lastVal: { uid: 'user-1' } } },
    browserOdmStorage: {
      savePendingEdit: jasmine.createSpy('savePendingEdit').and.resolveTo(undefined),
      clearPendingEdit: jasmine.createSpy('clearPendingEdit').and.resolveTo(undefined),
      get: jasmine.createSpy('get').and.resolveTo(undefined),
    },
  }
  svc.createOdmItem$ = (id: any, data: any, parents: any, opts: any) =>
    new (OdmItem$2 as any)(svc, id, data, parents, opts)
  return svc
}

/** Construct an OdmItem$2 with the fake service. Args map onto the real ctor
 * (odmService, id, initialInMemData, parents, opts). */
function makeItem(svc: any, data?: any, parents?: any, id?: any, opts?: any): any {
  return new (OdmItem$2 as any)(svc, id, data, parents, opts)
}

describe('OdmItem$2 — tree traversal', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('getChildren / hasChildren reflect locally-added children', () => {
    const parent = makeItem(svc, { title: 'p' }, undefined, 'p')
    expect(parent.hasChildren).toBe(false)
    const c1 = makeItem(svc, { title: 'c1' }, [parent], 'c1')
    const c2 = makeItem(svc, { title: 'c2' }, [parent], 'c2')
    expect(parent.getChildren()).toEqual([c1, c2])
    expect(parent.hasChildren).toBe(true)
  })

  it('getItemDepth / getAncestorItemsPath / getPrimaryParent follow the primary-parent chain', () => {
    const root = makeItem(svc, { title: 'root' }, undefined, 'root')
    const child = makeItem(svc, { title: 'child' }, [root], 'child')
    const grand = makeItem(svc, { title: 'grand' }, [child], 'grand')
    expect(root.getItemDepth()).toBe(0)
    expect(grand.getItemDepth()).toBe(2)
    expect(grand.getAncestorItemsPath()).toEqual([root, child])
    expect(grand.getPrimaryParent()).toBe(child)
    expect(root.getPrimaryParent()).toBeUndefined()
  })

  it('findAncestorItemMatching returns the nearest matching ancestor (or undefined)', () => {
    const root = makeItem(svc, {}, undefined, 'root')
    const child = makeItem(svc, {}, [root], 'child')
    const grand = makeItem(svc, {}, [child], 'grand')
    expect(grand.findAncestorItemMatching((n: any) => n.id === 'root')).toBe(root)
    expect(grand.findAncestorItemMatching((n: any) => n.id === 'child')).toBe(child)
    expect(grand.findAncestorItemMatching((n: any) => n.id === 'nope')).toBeUndefined()
  })

  it('getParentIds returns explicit top-level metadata without requiring a root item', () => {
    const item = makeItem(svc, { parentIds: [] }, undefined, 'top-level')
    expect(item.getParentIds()).toEqual([])
  })

  it('getParentIds falls back to persisted parentIds when parents are not hydrated', () => {
    const item = makeItem(svc, { parentIds: ['p1', 'p2'] }, undefined, 'child')
    expect(item.getParentIds()).toEqual(['p1', 'p2'])
  })

  it('forEachDescendant / getDescendants visit depth-first, pre-order', () => {
    const root = makeItem(svc, {}, undefined, 'root')
    const c1 = makeItem(svc, {}, [root], 'c1')
    const gc1 = makeItem(svc, {}, [c1], 'gc1')
    const c2 = makeItem(svc, {}, [root], 'c2')
    expect(root.getDescendants().map((x: any) => x.id)).toEqual(['c1', 'gc1', 'c2'])
    const visited: Array<[string, number]> = []
    root.forEachDescendant((n: any, depth: number) => visited.push([n.id, depth]))
    expect(visited).toEqual([['c1', 1], ['gc1', 2], ['c2', 1]])
  })

  it('allDescendantsMatch is true only when every descendant matches', () => {
    const root = makeItem(svc, {}, undefined, 'root')
    const c1 = makeItem(svc, { isCategory: true }, [root], 'c1')
    makeItem(svc, { isCategory: true }, [root], 'c2')
    expect(root.allDescendantsMatch((n: any) => n.val?.isCategory === true)).toBe(true)
    makeItem(svc, { isCategory: false }, [c1], 'gc1')
    expect(root.allDescendantsMatch((n: any) => n.val?.isCategory === true)).toBe(false)
  })
})

describe('OdmItem$2 — sibling ordering', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('ODM_ORDER_STEP is 1,000,000', () => {
    expect(ODM_ORDER_STEP).toBe(1000 * 1000)
  })

  it('calculateOrderNumBetween handles every neighbour combination (OrYoL fractional scheme)', () => {
    const item = makeItem(svc, {}, undefined, 'i')
    expect(item.calculateOrderNumBetween(null, null)).toBe(0)
    expect(item.calculateOrderNumBetween(null, 1_000_000)).toBe(1_000_000 - ODM_ORDER_STEP)
    expect(item.calculateOrderNumBetween(1_000_000, null)).toBe(1_000_000 + ODM_ORDER_STEP)
    expect(item.calculateOrderNumBetween(0, 2_000_000)).toBe(1_000_000)
  })

  it('getChildrenOrdered sorts by orderNum, unordered last (stable)', () => {
    const parent = makeItem(svc, {}, undefined, 'p')
    makeItem(svc, { title: 'a', orderNum: 30 }, [parent], 'a')
    makeItem(svc, { title: 'b', orderNum: 10 }, [parent], 'b')
    makeItem(svc, { title: 'c' }, [parent], 'c') // no orderNum -> last
    makeItem(svc, { title: 'd', orderNum: 20 }, [parent], 'd')
    expect(parent.getChildrenOrdered().map((x: any) => x.id)).toEqual(['b', 'd', 'a', 'c'])
  })

  it('createChild persists appended children with increasing orderNum', () => {
    const parent = makeItem(svc, {}, undefined, 'p')
    const first = parent.createChild({ title: 'first' })
    const second = parent.createChild({ title: 'second' })
    expect(first.getOrderNum()).toBe(0)
    expect(second.getOrderNum()).toBe(ODM_ORDER_STEP)
    expect(parent.getChildren().length).toBe(2)
    expect(svc.saveNowToDb).toHaveBeenCalled()
  })
})

describe('OdmItem$2 — incremental DB patching', () => {
  let svc: any
  beforeEach(() => { svc = makeFakeService() })

  it('a not-yet-persisted item requires a whole-document write', () => {
    const item = makeItem(svc, { title: 'x' }, undefined, 'i')
    item.patchThrottled({ title: 'y' })
    expect(item.isPersistedInDb).toBe(false)
    expect(item.buildIncrementalDbPatch()).toBeUndefined()
    expect(item.snapshotPendingDbPatch()).toEqual({ title: 'y' })
  })

  it('a persisted item builds an incremental patch of only changed fields + metadata', () => {
    const item = makeItem(svc, {}, undefined, 'i')
    item.applyDataFromDbAndEmit({ title: 'loaded' }) // marks it persisted
    expect(item.isPersistedInDb).toBe(true)
    item.patchThrottled({ title: 'y' })
    const patch = item.buildIncrementalDbPatch()
    expect(patch).toBeTruthy()
    expect(patch.title).toBe('y')
    expect('whenLastModified' in patch).toBe(true)
    expect('answer' in patch).toBe(false)
  })

  it('onDbWriteResolved prunes written fields but keeps edits made while in-flight', () => {
    const item = makeItem(svc, {}, undefined, 'i')
    item.applyDataFromDbAndEmit({ title: 'loaded' })
    item.patchThrottled({ title: 'y', answer: 'A' })
    const snapshot = item.snapshotPendingDbPatch() // { title: 'y', answer: 'A' }
    item.patchThrottled({ title: 'z' })            // in-flight change to title
    item.onDbWriteResolved(snapshot)
    const remaining = item.snapshotPendingDbPatch()
    expect(remaining.answer).toBeUndefined()       // pruned (unchanged since write)
    expect(remaining.title).toBe('z')              // kept (changed while in flight)
  })
})

describe('OdmItem$2 — module helpers', () => {
  it('summarizePatch formats fields and truncates long values', () => {
    expect(summarizePatch({ title: 'Buy milk', importance: 3 })).toBe('title=Buy milk, importance=3')
    expect(summarizePatch(null)).toBe('')
    expect(summarizePatch('not-an-object')).toBe('')
    const long = 'x'.repeat(60)
    expect(summarizePatch({ note: long })).toBe('note=' + 'x'.repeat(40) + '\u2026')
  })

  it('convertUndefinedFieldValsToNull replaces undefined with null', () => {
    const obj: any = { a: undefined, b: 1, c: null }
    convertUndefinedFieldValsToNull(obj)
    expect(obj).toEqual({ a: null, b: 1, c: null })
  })
})
