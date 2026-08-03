import {describe, it, expect, vi} from 'vitest'
import {BlobSyncService} from './blob-sync.service'

/** Minimal fake covering exactly what BlobSyncService touches - cacheBlob/savePendingBlobUpload
 * just need to resolve, clearPendingBlobUpload is a no-op the real upload path calls on success. */
function makeFakeBrowserOdmStorage() {
  return {
    cacheBlob: vi.fn().mockResolvedValue(undefined),
    savePendingBlobUpload: vi.fn().mockResolvedValue(undefined),
    clearPendingBlobUpload: vi.fn().mockResolvedValue(undefined),
    getCachedBlob: vi.fn().mockResolvedValue(undefined),
    getAllPendingBlobUploadsEverywhere: vi.fn().mockResolvedValue([]),
  }
}

/** Records each insert's `kind` into `recordOrder` as it happens - the original's insert is
 * artificially delayed (a real network call would take measurably longer than an in-memory
 * mock's instant resolution) so a test relying on call order alone, rather than genuinely waiting
 * for the original, would show the thumbnail's insert landing first. */
function makeFakeSupabaseClient(recordOrder: string[]) {
  return {
    storage: {
      from: () => ({
        upload: vi.fn().mockResolvedValue({error: null}),
      }),
    },
    from: (_table: string) => ({
      insert: vi.fn().mockImplementation((row: any) => {
        const record = () => {
          recordOrder.push(row.kind)
          return {error: null}
        }
        if (row.kind === 'image-original') {
          return new Promise(resolve => setTimeout(() => resolve(record()), 20))
        }
        return Promise.resolve(record())
      }),
    }),
  }
}

describe('BlobSyncService - original-before-thumbnail upload ordering', () => {
  it('does not attempt the thumbnail insert until the original insert has settled', async () => {
    const recordOrder: string[] = []
    const fakeBrowserOdmStorage = makeFakeBrowserOdmStorage()
    const fakeClient = makeFakeSupabaseClient(recordOrder)
    const service = new BlobSyncService(
      fakeBrowserOdmStorage as any,
      {getClient: () => fakeClient} as any,
      {userId: 'user-1', authUser$: {subscribe: () => {}}} as any,
      {handleSavingPromise: (promise: Promise<any>) => promise.catch(() => {})} as any,
    )

    const originalBlob = new Blob(['original'], {type: 'image/png'})
    const thumbnailBlob = new Blob(['thumbnail'], {type: 'image/webp'})

    // Mirrors uploadPastedImage()'s real call sequence: the original's upload() call returns
    // (having only cached locally and queued - not actually uploaded yet) well before its real
    // network insert would land, and the thumbnail's upload() is called right after with that id.
    const originalBlobId = await service.upload('JournalEntry', 'item-1', originalBlob, 'image-original', 'image/png')
    const thumbnailBlobId = await service.upload('JournalEntry', 'item-1', thumbnailBlob, 'image-thumbnail', 'image/webp', originalBlobId)

    await Promise.all([
      (service as any).uploadPromiseByBlobId.get(originalBlobId),
      (service as any).uploadPromiseByBlobId.get(thumbnailBlobId),
    ])

    expect(recordOrder).toEqual(['image-original', 'image-thumbnail'])
  })
})
