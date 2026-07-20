import {Injectable} from '@angular/core'
import {collection as firestoreCollection, doc, getDoc} from 'firebase/firestore'
import {getAppFirestore} from '../../AppFedSharedFirebase/firebase-app'
import {BlobSyncService} from '../odm/blob-sync.service'
import {CachedSubject} from '../utils/cachedSubject2/CachedSubject2'

/** Anything currently holding an open microphone `MediaStream` (recording or just warm-kept
 * between recordings - see `VoiceMemoFieldComponent.stream`'s doc comment) that can be told to
 * let go of it. Kept as a minimal interface (rather than importing `VoiceMemoFieldComponent`
 * itself, which would make this service depend on its own consumer) purely so the global
 * "release mic" action below has something to call - any field holding a stream registers itself
 * here while it does. */
export interface ActiveMicHolder {
  /** Stops any in-progress recording (waiting for the final chunk if needed) and releases the
   * held MediaStream's tracks. Safe to call on a holder that's already released. */
  releaseMicIfActive(): void
}

/** Duck-typed rather than `OdmItem$2` itself, so `VoiceMemoFieldComponent` also works against
 * OrYoL's still-legacy `OryItem$` (tree nodes haven't migrated onto OdmItem$2 yet, but already
 * have the same `id`/`patchThrottled` shape). Callers whose item has no `odmService.className` to
 * infer a collection name from (i.e. OryItem$) must pass one via the `collection` input instead.
 *
 * `currentVal`/`itemData` are the same "read the item's current in-memory data" concept under two
 * different names - `OdmItem$2`-based items (`JournalEntry$`/`LearnItem$`) expose `.currentVal`,
 * while OrYoL's `OryItem$` exposes `.itemData` instead. Both are optional and read via
 * `readVoiceMemos()` below (`item.currentVal ?? item.itemData`) so callers never need to branch on
 * which kind of item they have. */
export interface VoiceAttachableItem {
  id?: string | null
  patchThrottled(patch: any): void
  odmService?: {className: string}
  currentVal?: any
  itemData?: any
}

export interface VoiceMemoRef {
  blobId: string
  whenCreated: string
  /** Wall-clock recording duration, measured from mic-start to mic-stop - absent for `legacy`
   * entries (that old single-recording mechanism never tracked duration at all). */
  durationMs?: number
  /** True only for the single synthesized entry read from the legacy pre-unification Firestore
   * `LearnDoAudio` doc (see `getLegacyRecordingBytes`) - lets a surface that already had exactly
   * one recording under the old single-recording-per-item mechanism keep it playable, without a
   * data migration script. Never true for anything recorded through this service. */
  legacy?: boolean
}

/** A recorded memo as actually stored on the item's own `voiceMemos` array - every field's memos
 * live in one flat array on the item (not one array per field), so `fieldId` is what
 * `readVoiceMemosForField()` filters on. This is the generalized replacement for the old
 * `BlobSyncService.listBlobs()` Supabase query: the list now lives wherever the item itself
 * already is (offline-safe for free, via the same pending-edit journal every other field patch
 * already uses), rather than requiring a separate round-trip to list a field's memos. */
export interface VoiceMemoRecord extends VoiceMemoRef {
  fieldId: string
}

/** Reads every voice memo recorded on this item, across all of its fields - `undefined`/`null`
 * itself (not yet loaded, or a brand new unsaved item) reads as no memos rather than throwing. */
export function readVoiceMemos(item: VoiceAttachableItem | undefined | null): VoiceMemoRecord[] {
  const data = item?.currentVal ?? item?.itemData
  return data?.voiceMemos ?? []
}

export function readVoiceMemosForField(item: VoiceAttachableItem | undefined | null, fieldId: string): VoiceMemoRecord[] {
  return readVoiceMemos(item).filter(memo => memo.fieldId === fieldId)
}

/** Total recorded duration across every memo on this item (every field) - `durationMs`-less
 * entries (only ever the synthesized `legacy` one) don't contribute. */
export function sumVoiceMemoDurationMs(voiceMemos: VoiceMemoRef[] | undefined | null): number {
  return (voiceMemos ?? []).reduce((sum, memo) => sum + (memo.durationMs ?? 0), 0)
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

  private activeMicHolders = new Set<ActiveMicHolder>()

  /** True while at least one field anywhere in the app currently holds an open mic stream -
   * drives the "Release Microphone" action in the sync popover, an escape hatch for a stream
   * left warm-kept (or, in principle, still recording) on a field the user has since navigated
   * away from and can no longer reach that field's own release button. */
  readonly hasActiveMic$ = new CachedSubject<boolean>(false)

  constructor(
    private blobSyncService: BlobSyncService,
  ) {}

  registerActiveMic(holder: ActiveMicHolder): void {
    this.activeMicHolders.add(holder)
    this.hasActiveMic$.next(this.activeMicHolders.size > 0)
  }

  unregisterActiveMic(holder: ActiveMicHolder): void {
    this.activeMicHolders.delete(holder)
    this.hasActiveMic$.next(this.activeMicHolders.size > 0)
  }

  /** Releases every currently-open microphone stream app-wide, regardless of which field(s)
   * opened them. */
  releaseAllActiveMics(): void {
    for (const holder of [...this.activeMicHolders]) {
      holder.releaseMicIfActive()
    }
  }

  resolveCollection(item$: VoiceAttachableItem | undefined, collectionOverride: string | undefined): string | undefined {
    return collectionOverride ?? item$?.odmService?.className
  }

  async attachMemo(collection: string, itemId: string, fieldId: string, blob: Blob, durationMs?: number): Promise<string> {
    return this.blobSyncService.upload(collection, itemId, blob, 'audio', 'audio/ogg; codecs=opus', undefined, fieldId, durationMs)
  }

  /** Only ever called once per field, at init, for the one field on each surface that the old
   * single-recording-per-item mic used to write to (Journal's 'general' field, OrYoL's per-node
   * popover note) - passing it for any other field would misattribute a pre-existing recording to
   * a field it was never actually about. Returns a synthesized ref (playable via
   * `resolveMemoBlob`) or `undefined` if there's nothing to fall back to. */
  async getLegacyMemoRef(collection: string, itemId: string): Promise<VoiceMemoRef | undefined> {
    const hasLegacy = await this.getLegacyRecordingBytes(collection, itemId)
    return hasLegacy ? {blobId: 'legacy', whenCreated: new Date(0).toISOString(), legacy: true} : undefined
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
