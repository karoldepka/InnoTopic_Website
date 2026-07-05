import {Injectable} from '@angular/core'
import {Bytes, collection as firestoreCollection, doc, getDoc, setDoc} from 'firebase/firestore'
import {SyncStatusService} from '../odm/sync-status.service'
import {getAppFirestore} from '../../AppFedSharedFirebase/firebase-app'

/** Duck-typed rather than `OdmItem$2` itself, so MicComponent/PlayButtonComponent also work
 * against OrYoL's still-legacy `OryItem$` (tree nodes haven't migrated onto OdmItem$2 yet, but
 * already have the same `id`/`patchThrottled` shape). Callers whose item has no
 * `odmService.className` to infer a collection name from (i.e. OryItem$) must pass one via the
 * `collection` input instead. */
export interface VoiceAttachableItem {
  id?: string | null
  patchThrottled(patch: any): void
  odmService?: {className: string}
}

/** `collection`/`itemId` here are the same ODM collection name/item id used everywhere else
 * (`OdmItem$2.odmService.className`/`.id`), not a Firestore-specific concept - this stays on the
 * Firestore `LearnDoAudio` collection the pre-existing recording feature already used (a single
 * physical collection keyed by a compound id) rather than one Firestore collection per ODM
 * collection, since this whole mechanism is meant to be replaced by Phase 4's Supabase Storage
 * blob pipeline, not grown into its own schema. */
function audioDocId(collection: string, itemId: string): string {
  return `${collection}::${itemId}`
}

/** Lets any item (Learn, Quiz, Journal, OrYoL tree node) attach a voice recording to itself,
 * instead of MicComponent's original hardcoded behavior of always creating a brand new LearnItem
 * for the recording to live on. */
@Injectable({providedIn: 'root'})
export class VoiceAttachmentService {

  constructor(
    private syncStatusService: SyncStatusService,
  ) {}

  async attachRecording(collection: string, itemId: string, blob: Blob): Promise<void> {
    const int8Array = new Uint8Array(await blob.arrayBuffer())
    const promise = setDoc(doc(firestoreCollection(getAppFirestore(), 'LearnDoAudio'), audioDocId(collection, itemId)), {
      audio: Bytes.fromUint8Array(int8Array),
    })
    this.syncStatusService.handleSavingPromise(promise)
    await promise
  }

  async getRecording(collection: string, itemId: string): Promise<ArrayBuffer | undefined> {
    const primaryDoc = await getDoc(doc(firestoreCollection(getAppFirestore(), 'LearnDoAudio'), audioDocId(collection, itemId)))
    const data = primaryDoc?.data() as any
    if (data?.audio) {
      return data.audio.toUint8Array()?.buffer as ArrayBuffer
    }
    // Every recording made before this service existed was written keyed by the bare item id (no
    // collection prefix) - fall back to that so old recordings still play back.
    const legacyDoc = await getDoc(doc(firestoreCollection(getAppFirestore(), 'LearnDoAudio'), itemId))
    const legacyData = legacyDoc?.data() as any
    return legacyData?.audio?.toUint8Array()?.buffer as ArrayBuffer | undefined
  }
}
