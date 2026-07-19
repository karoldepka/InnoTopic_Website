import {Injectable, Injector} from '@angular/core'
import {Observable} from 'rxjs'
import {map} from 'rxjs/operators'
import {BaseService} from '../base.service'
import {odmTimestampToMillis} from '../odm/utils'
import {FieldComment} from './FieldComment'
import {FieldCommentsOdmService} from './field-comments-odm.service'

/** `FieldComment.val` doesn't itself carry the owning `OdmItem$2`'s id (that lives on the
 * wrapper, not the in-mem value) - `CommentThreadComponent`'s `@for` needs a stable identity to
 * track by, so it's attached here rather than the template re-deriving it. */
export type FieldCommentWithId = FieldComment & {id: string}

/** Comments attachable to any node id - real (a normal item) or virtual/fabricated (a bare slot
 * id like `abcdefgh_field_mood`), per GH #89 "every field should be commentable-on". Client-side
 * filtered from the already-loaded flat collection, same reasoning/volume as
 * `TimeTrackingPeriodsService.getPeriodsForItem()`. */
@Injectable({
  providedIn: 'root'
})
export class FieldCommentsService extends BaseService {

  constructor(
    injector: Injector,
    private commentsOdmService: FieldCommentsOdmService,
  ) {
    super(injector)
  }

  /** Reactive, oldest-first list of comments for one node - updates live as comments are added
   * (via `localItems$`, not a one-shot Promise) so a mounted `CommentThreadComponent` doesn't
   * need to poll or re-fetch. */
  getCommentsForNode$(targetNodeId: string): Observable<FieldCommentWithId[]> {
    return this.commentsOdmService.localItems$.pipe(
      map(items => (items ?? [])
        .filter(item$ => item$.val?.targetNodeId === targetNodeId)
        .map(item$ => ({...item$.val, id: item$.id} as FieldCommentWithId))
        .sort((a, b) => (odmTimestampToMillis(a.whenCreated) ?? 0) - (odmTimestampToMillis(b.whenCreated) ?? 0))
      ),
    )
  }

  addComment(targetNodeId: string, text: string): void {
    const trimmed = text.trim()
    if (!trimmed) {
      return
    }
    this.commentsOdmService.add(Object.assign(new FieldComment(), {
      targetNodeId,
      text: trimmed,
    }))
  }
}
