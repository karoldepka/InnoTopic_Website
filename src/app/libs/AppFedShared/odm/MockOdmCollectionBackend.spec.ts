import { MockOdmCollectionBackend } from './MockOdmCollectionBackend'

interface Item { title: string; value?: number }

function makeListener() {
  return {
    onAdded:                    jasmine.createSpy('onAdded'),
    onModified:                 jasmine.createSpy('onModified'),
    onRemoved:                  jasmine.createSpy('onRemoved'),
    onFinishedProcessingChangeSet: jasmine.createSpy('onFinishedProcessingChangeSet'),
  }
}

const QUERY_OPTS: any = { comments: 'test', oneTimeGet: true }

// ---------------------------------------------------------------------------

describe('MockOdmCollectionBackend — setListener', () => {

  it('calls callback after attaching the listener', () => {
    const backend = new MockOdmCollectionBackend<Item>()
    const cb = jasmine.createSpy('callback')
    backend.setListener(makeListener(), QUERY_OPTS, cb)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('emits seeded items as onAdded when a listener subscribes', () => {
    const backend = new MockOdmCollectionBackend<Item>()
      .seed('a', { title: 'Alpha' })
      .seed('b', { title: 'Beta' })
    const listener = makeListener()
    backend.setListener(listener, QUERY_OPTS, () => {})
    expect(listener.onAdded).toHaveBeenCalledTimes(2)
    expect(listener.onAdded).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'a' }), { title: 'Alpha' })
    expect(listener.onAdded).toHaveBeenCalledWith(jasmine.objectContaining({ id: 'b' }), { title: 'Beta' })
    expect(listener.onFinishedProcessingChangeSet).toHaveBeenCalledTimes(1)
  })

  it('emits nothing and still calls callback when the store is empty', () => {
    const backend = new MockOdmCollectionBackend<Item>()
    const listener = makeListener()
    const cb = jasmine.createSpy('callback')
    backend.setListener(listener, QUERY_OPTS, cb)
    expect(listener.onAdded).not.toHaveBeenCalled()
    expect(cb).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------

describe('MockOdmCollectionBackend — saveNowToDb', () => {

  it('calls onAdded for a new item', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    const listener = makeListener()
    backend.setListener(listener, QUERY_OPTS, () => {})
    listener.onAdded.calls.reset()
    listener.onFinishedProcessingChangeSet.calls.reset()

    await backend.saveNowToDb({ title: 'New' }, 'n1')

    expect(listener.onAdded).toHaveBeenCalledOnceWith(jasmine.objectContaining({ id: 'n1' }), { title: 'New' })
    expect(listener.onModified).not.toHaveBeenCalled()
    expect(listener.onFinishedProcessingChangeSet).toHaveBeenCalledTimes(1)
  })

  it('calls onModified when updating an existing item', async () => {
    const backend = new MockOdmCollectionBackend<Item>().seed('x', { title: 'Old' })
    const listener = makeListener()
    backend.setListener(listener, QUERY_OPTS, () => {})
    listener.onAdded.calls.reset()
    listener.onFinishedProcessingChangeSet.calls.reset()

    await backend.saveNowToDb({ title: 'Updated' }, 'x')

    expect(listener.onModified).toHaveBeenCalledOnceWith(jasmine.objectContaining({ id: 'x' }), { title: 'Updated' })
    expect(listener.onAdded).not.toHaveBeenCalled()
  })

  it('persists data into storedItems', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    await backend.saveNowToDb({ title: 'Saved', value: 42 }, 'i1')
    expect(backend.storedItems.get('i1')).toEqual({ title: 'Saved', value: 42 })
  })

  it('records each call in calls.saveNowToDb', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    await backend.saveNowToDb({ title: 'A' }, 'id-a')
    await backend.saveNowToDb({ title: 'B' }, 'id-b', undefined, undefined, { title: 'B' })
    expect(backend.calls.saveNowToDb.length).toBe(2)
    expect(backend.calls.saveNowToDb[1].changedFieldsOnly).toEqual({ title: 'B' })
  })

  it('returns a resolved promise', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    await expectAsync(backend.saveNowToDb({ title: 'X' }, 'x')).toBeResolved()
  })
})

// ---------------------------------------------------------------------------

describe('MockOdmCollectionBackend — deleteWithoutConfirmation', () => {

  it('calls onRemoved and removes the item from the store', async () => {
    const backend = new MockOdmCollectionBackend<Item>().seed('del', { title: 'ToDelete' })
    const listener = makeListener()
    backend.setListener(listener, QUERY_OPTS, () => {})
    listener.onFinishedProcessingChangeSet.calls.reset()

    await backend.deleteWithoutConfirmation('del')

    expect(listener.onRemoved).toHaveBeenCalledOnceWith(jasmine.objectContaining({ id: 'del' }))
    expect(backend.storedItems.has('del')).toBe(false)
    expect(listener.onFinishedProcessingChangeSet).toHaveBeenCalledTimes(1)
  })

  it('records the deleted id in calls.deleteWithoutConfirmation', async () => {
    const backend = new MockOdmCollectionBackend<Item>().seed('r', { title: 'Remove' })
    await backend.deleteWithoutConfirmation('r')
    expect(backend.calls.deleteWithoutConfirmation).toEqual(['r'])
  })

  it('accepts an OdmItemId-shaped object as the id', async () => {
    const backend = new MockOdmCollectionBackend<Item>().seed('obj', { title: 'ObjId' })
    const listener = makeListener()
    backend.setListener(listener, QUERY_OPTS, () => {})
    await backend.deleteWithoutConfirmation({ id: 'obj' } as any)
    expect(backend.storedItems.has('obj')).toBe(false)
  })

  it('returns a resolved promise', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    await expectAsync(backend.deleteWithoutConfirmation('missing')).toBeResolved()
  })
})

// ---------------------------------------------------------------------------

describe('MockOdmCollectionBackend — round-trip: save → delete → verify', () => {

  it('item survives a save and is gone after delete', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    await backend.saveNowToDb({ title: 'Ephemeral' }, 'e1')
    expect(backend.storedItems.has('e1')).toBe(true)
    await backend.deleteWithoutConfirmation('e1')
    expect(backend.storedItems.has('e1')).toBe(false)
  })

  it('listener receives the full lifecycle: onAdded → onModified → onRemoved', async () => {
    const backend = new MockOdmCollectionBackend<Item>()
    const listener = makeListener()
    backend.setListener(listener, QUERY_OPTS, () => {})

    await backend.saveNowToDb({ title: 'v1' }, 'item')
    expect(listener.onAdded).toHaveBeenCalledTimes(1)

    await backend.saveNowToDb({ title: 'v2' }, 'item')
    expect(listener.onModified).toHaveBeenCalledTimes(1)

    await backend.deleteWithoutConfirmation('item')
    expect(listener.onRemoved).toHaveBeenCalledTimes(1)
  })
})
