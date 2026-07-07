import {Injectable} from '@angular/core'
import {collection as firestoreCollection, doc, getDoc} from 'firebase/firestore'
import {getAppFirestore} from '../../AppFedSharedFirebase/firebase-app'
import {BlobSyncService} from '../odm/blob-sync.service'

/** Duck-typed rather than `OdmItem$2` itself, so `VoiceMemoFieldComponent` also works against
 * OrYoL's still-legacy `OryItem$` (tree nodes haven't migrated onto OdmItem$2 yet, but already
 * have the same `id`/`patchThrottled` shape). Callers whose item has no `odmService.className` to
 * infer a collection name from (i.e. OryItem$) must pass one via the `collection` input instead. */
export interface VoiceAttachableItem {
  id?: string | null
  patchThrottled(patch: any): void
  odmService?: {className: string}
}

export interface VoiceMemoRef {
  blobId: string
  whenCreated: string
  /** True only for the single synthesized entry read from the legacy pre-unification Firestore
   * `LearnDoAudio` doc (see `getLegacyRecordingBytes`) - lets a surface that already had exactly
   * one recording under the old single-recording-per-item mechanism keep it playable, without a
   * data migration script. Never true for anything recorded through this service. */
  legacy?: boolean
}

/** `collection`/`itemId` here are the same ODM collection name/item id used everywhere else
 * (`OdmItem$2.odmService.className`/`.id`), matching the legacy Firestore `LearnDoAudio` doc id
 * scheme this reads as a fallback (a single physical collection keyed by a compound id). */
function legacyAudioDocId(collection: string, itemId: string): string {
  return `${collection}::${itemId}`
}

/** Unified recording/playback backing for `VoiceMemoFieldComponent` - supersedes the old
 * `MicComponent`/`PlayButtonComponent`/`VoiceAttachmentService` trio (one recording per whole
 * item, stored in a single overwritable Firestore doc) with multiple memos per *field* on an
 * item, stored in the Phase-4 Supabase Storage `media` bucket via `BlobSyncService` - already
 * offline-safe (cache-first reads, durably-queued uploads) with no extra work needed here. */
@Injectable({providedIn: 'root'})
export class VoiceMemoService {

  constructor(
    private blobSyncService: BlobSyncService,
  ) {}

  resolveCollection(item$: VoiceAttachableItem | undefined, collectionOverride: string | undefined): string | undefined {
    return collectionOverride ?? item$?.odmService?.className
  }

  async attachMemo(collection: string, itemId: string, fieldId: string, blob: Blob): Promise<string> {
    return this.blobSyncService.upload(collection, itemId, blob, 'audio', 'audio/ogg; codecs=opus', undefined, fieldId)
  }

  /** `includeLegacy` should only be set by the one field on each surface that the old
   * single-recording-per-item mic used to write to (Journal's 'general' field, OrYoL's per-node
   * popover note) - passing it for any other field would misattribute a pre-existing recording to
   * a field it was never actually about. */
  async listMemos(collection: string, itemId: string, fieldId: string, includeLegacy = false): Promise<VoiceMemoRef[]> {
    const memos = await this.blobSyncService.listBlobs(collection, itemId, 'audio', fieldId)
    if (!includeLegacy) {
      return memos
    }
    const hasLegacy = await this.getLegacyRecordingBytes(collection, itemId)
    return hasLegacy ? [{blobId: 'legacy', whenCreated: new Date(0).toISOString(), legacy: true}, ...memos] : memos
  }

  async resolveMemoBlob(collection: string, itemId: string, memoRef: VoiceMemoRef): Promise<Blob | undefined> {
    if (memoRef.legacy) {
      const bytes = await this.getLegacyRecordingBytes(collection, itemId)
      return bytes ? new Blob([bytes], {type: 'audio/ogg; codecs=opus'}) : undefined
    }
    return this.blobSyncService.resolve(memoRef.blobId)
  }

  async deleteMemo(collection: string, itemId: string, memoRef: VoiceMemoRef): Promise<void> {
    if (memoRef.legacy) {
      return // predates per-memo storage; nothing to delete server-side
    }
    await this.blobSyncService.deleteBlob(collection, itemId, memoRef.blobId)
  }

  /** Reads the single pre-unification recording (if any) from the legacy Firestore `LearnDoAudio`
   * doc this feature used before this service existed - read-only, never written to again. */
  private async getLegacyRecordingBytes(collection: string, itemId: string): Promise<ArrayBuffer | undefined> {
    const primaryDoc = await getDoc(doc(firestoreCollection(getAppFirestore(), 'LearnDoAudio'), legacyAudioDocId(collection, itemId)))
    const data = primaryDoc?.data() as any
    if (data?.audio) {
      return data.audio.toUint8Array()?.buffer as ArrayBuffer
    }
    // Every recording made before VoiceAttachmentService (the direct predecessor of this service)
    // existed was written keyed by the bare item id (no collection prefix) - fall back to that so
    // the very oldest recordings still play back.
    const legacyDoc = await getDoc(doc(firestoreCollection(getAppFirestore(), 'LearnDoAudio'), itemId))
    const legacyData = legacyDoc?.data() as any
    return legacyData?.audio?.toUint8Array()?.buffer as ArrayBuffer | undefined
  }
}
