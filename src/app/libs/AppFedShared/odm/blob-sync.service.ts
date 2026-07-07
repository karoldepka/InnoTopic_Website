import {Injectable} from '@angular/core'
import {v4 as uuid4} from 'uuid'
import {
  BrowserOdmStorage,
  BlobKind,
} from '../../AppFedSharedBrowser/odm-browser/BrowserOdmStorage'
import {SupabaseOdmClientService} from '../../AppFedSharedSupabase/odm-supabase/supabase-odm-client.service'
import {AuthService} from '../../../auth/auth.service'
import {ConcurrencyLimiter} from '../utils/promiseUtils'

/** Offline-safe upload/download of images/audio to the `media` Supabase Storage bucket, following
 * the exact same durable-journal + reconnect-drain shape `OdmService2`/`BrowserOdmStorage` already
 * use for row edits (`pending_edits`) - see those for the reasoning this mirrors. Storage paths
 * are `owner/{ownerUid}/{collection}/{itemId}/{blobId}.{ext}`, matching the bucket's owner-scoped
 * RLS policies. */
@Injectable({providedIn: 'root'})
export class BlobSyncService {

  private uploadLimiter = new ConcurrencyLimiter(6)

  constructor(
    private browserOdmStorage: BrowserOdmStorage,
    private supabaseOdmClientService: SupabaseOdmClientService,
    private authService: AuthService,
  ) {
    this.authService.authUser$.subscribe(() => this.resumePendingUploadsNow())
    window.addEventListener('online', () => this.resumePendingUploadsNow())
  }

  /** Caches the blob locally immediately (so a paste-time thumbnail renders instantly, offline or
   * not) and returns a `blob_id` reference right away - the actual upload to Storage happens in
   * the background (bounded by `uploadLimiter`, durably retried on failure/offline via the
   * pending-blob-uploads journal), never blocking the caller on the network round-trip.
   * `originalBlobId` links a thumbnail back to its full-size original (both already storable per
   * `odm_item_blobs.original_blob_id`) - omit it when uploading the original itself, or a blob
   * with no such relationship (e.g. audio). `fieldId` tags which field on the item this blob
   * belongs to (see `BrowserOdmStorage.PendingBlobUpload.field_id`'s doc comment) - only voice
   * memos pass this today. */
  async upload(collection: string, itemId: string, blob: Blob, kind: BlobKind, contentType: string, originalBlobId?: string, fieldId?: string): Promise<string> {
    const blobId = uuid4()
    await this.browserOdmStorage.cacheBlob(blobId, blob)
    await this.browserOdmStorage.savePendingBlobUpload({
      collection,
      item_id: itemId,
      blob_id: blobId,
      blob,
      content_type: contentType,
      kind,
      original_blob_id: originalBlobId,
      field_id: fieldId,
      whenCreatedLocally: new Date().toISOString(),
    })
    this.uploadLimiter.run(() => this.uploadNow(collection, itemId, blobId, blob, kind, contentType, originalBlobId, fieldId))
      .catch(error => console.error('BlobSyncService upload failed (durably queued, will retry on reconnect)', error))
    return blobId
  }

  private async uploadNow(collection: string, itemId: string, blobId: string, blob: Blob, kind: BlobKind, contentType: string, originalBlobId?: string, fieldId?: string): Promise<void> {
    const owner = this.authService.userId
    if (!owner) {
      // No signed-in user yet (or anonymous/guest) - leave it queued; the authUser$ subscription
      // above re-triggers resumePendingUploadsNow() once sign-in completes.
      return
    }
    const ext = contentType.split('/')[1]?.split(';')[0] ?? 'bin'
    const storagePath = `owner/${owner}/${collection}/${itemId}/${blobId}.${ext}`
    const client = this.supabaseOdmClientService.getClient()

    const {error: uploadError} = await client.storage.from('media').upload(storagePath, blob, {contentType, upsert: true})
    if (uploadError) {
      throw uploadError
    }
    const {error: insertError} = await client.from('odm_item_blobs').insert({
      blob_id: blobId,
      collection,
      item_id: itemId,
      owner,
      storage_path: storagePath,
      content_type: contentType,
      kind,
      original_blob_id: originalBlobId ?? null,
      field_id: fieldId ?? null,
      byte_size: blob.size,
    })
    if (insertError) {
      throw insertError
    }
    await this.browserOdmStorage.clearPendingBlobUpload(collection, itemId, blobId)
  }


  /** Deletes a blob's Storage object and tracking row (both already RLS-scoped to the owner), and
   * cancels/clears any still-queued local upload for it - used when a user removes a bad voice
   * memo take. Best-effort on the Storage removal (swallowed): a dangling orphaned object with no
   * tracking row left is harmless clutter, whereas surfacing that failure to the user for what's
   * meant to be a quick "remove this recording" action is not worth it. */
  async deleteBlob(collection: string, itemId: string, blobId: string): Promise<void> {
    await this.browserOdmStorage.clearPendingBlobUpload(collection, itemId, blobId)
    const client = this.supabaseOdmClientService.getClient()
    const {data: row} = await client.from('odm_item_blobs').select('storage_path').eq('blob_id', blobId).maybeSingle()
    if (row?.storage_path) {
      await client.storage.from('media').remove([row.storage_path]).catch(error => console.error('BlobSyncService deleteBlob storage removal failed (row still deleted below)', error))
    }
    await client.from('odm_item_blobs').delete().eq('blob_id', blobId)
  }

  /** Local cache first, falling back to a signed URL + fetch (mirroring back into the cache) -
   * same read-through shape `CachingOdmCollectionBackend` uses for row data. */
  async resolve(blobId: string): Promise<Blob | undefined> {
    const cached = await this.browserOdmStorage.getCachedBlob(blobId)
    if (cached) {
      return cached
    }
    const client = this.supabaseOdmClientService.getClient()
    const {data: row} = await client.from('odm_item_blobs').select('storage_path').eq('blob_id', blobId).maybeSingle()
    if (!row?.storage_path) {
      return undefined
    }
    const {data: signedUrlData, error} = await client.storage.from('media').createSignedUrl(row.storage_path, 3600)
    if (error || !signedUrlData?.signedUrl) {
      return undefined
    }
    const response = await fetch(signedUrlData.signedUrl)
    if (!response.ok) {
      return undefined
    }
    const blob = await response.blob()
    await this.browserOdmStorage.cacheBlob(blobId, blob)
    return blob
  }

  private resumePendingUploadsNow() {
    this.browserOdmStorage.getAllPendingBlobUploadsEverywhere()
      .then(uploads => {
        for (const upload of uploads) {
          this.uploadLimiter.run(() => this.uploadNow(upload.collection, upload.item_id, upload.blob_id, upload.blob, upload.kind, upload.content_type, upload.original_blob_id))
            .catch(error => console.error('BlobSyncService resumed upload failed, still queued', error))
        }
      })
      .catch(error => console.error('BlobSyncService resumePendingUploadsNow failed', error))
  }
}
