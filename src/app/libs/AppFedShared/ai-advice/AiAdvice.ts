import {OdmItemId} from '../odm/OdmItemId'
import {OdmInMemItem} from '../odm/OdmItem$2'

export type AiAdviceId = OdmItemId<AiAdvice>

/** A single piece of AI-generated advice, persisted local+server via the normal ODM sync path
 * (same as any other item - IndexedDB-durable, then synced) rather than being lost the moment its
 * popover closes. One row per "get advice" click (a running history), not a singleton - shared
 * across features (Journal today, potentially Learn/OrYoL later) via `source` rather than each
 * feature growing its own near-identical collection/model/service trio. */
export class AiAdvice extends OdmInMemItem {
  /** Which feature/app area asked for this - e.g. 'journal' - so a shared collection can filter
   * back to just its own history without seeing other features' advice. */
  source?: string
  advice?: string
  modelName?: string
  /** See GH #138 - true when the model/proxy stopped before finishing (cut off mid-answer). */
  truncated?: boolean
}
