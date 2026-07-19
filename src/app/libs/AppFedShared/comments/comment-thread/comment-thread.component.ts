import {ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges} from '@angular/core'
import {AsyncPipe, DatePipe} from '@angular/common'
import {FormsModule} from '@angular/forms'
import {IonicModule} from '@ionic/angular'
import {Observable} from 'rxjs'
import {FieldCommentsService, FieldCommentWithId} from '../field-comments.service'
import {OdmTimestampToDatePipe} from '../../odm/odm-timestamp-to-date.pipe'

/** Comment thread for any node id - real or virtual/fabricated (a bare slot) - per GH #89
 * "every field should be commentable-on". Deliberately node-agnostic: it only needs a
 * `targetNodeId` string, not an `OdmCell`/`OdmTreeNode`, so it attaches the same way under a
 * real field's cell or a bare slot with no scalar value of its own. */
@Component({
  selector: 'app-comment-thread',
  templateUrl: './comment-thread.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./comment-thread.component.sass'],
  imports: [AsyncPipe, DatePipe, FormsModule, IonicModule, OdmTimestampToDatePipe],
})
export class CommentThreadComponent implements OnChanges {

  @Input() targetNodeId!: string

  comments$?: Observable<FieldCommentWithId[]>

  newCommentText = ''

  constructor(
    private fieldCommentsService: FieldCommentsService,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['targetNodeId']) {
      this.comments$ = this.fieldCommentsService.getCommentsForNode$(this.targetNodeId)
    }
  }

  submitComment(): void {
    if (!this.targetNodeId || !this.newCommentText.trim()) {
      return
    }
    this.fieldCommentsService.addComment(this.targetNodeId, this.newCommentText)
    this.newCommentText = ''
  }

  onTextareaEnter(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return
    }
    event.preventDefault()
    this.submitComment()
  }

}
