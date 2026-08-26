import {Injectable, Injector} from '@angular/core'
import {AuthService} from '../../../auth/auth.service'
import {OryItem$} from '../../OrYoL/db/OryItem$'
import {DbTreeService} from '../../OrYoL/tree-model/db-tree-service'
import {TimeTrackedEntry} from '../../OrYoL/time-tracking/TimeTrackedEntry'
import {TimeTrackingService} from '../../OrYoL/time-tracking/time-tracking.service'

function quizItemId(userId: string): string {
  return `_quiz_${userId}`
}

/** Persists Quiz sessions in the shared time-tracking history without interrupting another task. */
@Injectable({providedIn: 'root'})
export class QuizTrackingService {

  private entry?: TimeTrackedEntry

  constructor(
    private injector: Injector,
    private dbTreeService: DbTreeService,
    private timeTrackingService: TimeTrackingService,
    private authService: AuthService,
  ) {
  }

  async startTracking(): Promise<void> {
    if (!this.entry) {
      const itemId = quizItemId(this.authService.userId as string)
      await this.dbTreeService.upsertItemIfMissing(itemId, {
        title: 'Quiz',
        isArchived: false,
      })
      await this.dbTreeService.upsertRootInclusionIfMissing(itemId)
      this.entry = this.timeTrackingService.obtainEntryForItem(new OryItem$(this.injector, itemId))
    }
    this.entry.startOrResumeTrackingIfNeeded({inParallel: true})
  }

  stopTrackingIfNeeded(): void {
    this.entry?.pauseOrNoop()
  }
}
