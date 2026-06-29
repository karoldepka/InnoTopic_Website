import {Injectable} from '@angular/core'
import {BehaviorSubject, fromEvent, merge} from 'rxjs'
import {map, startWith} from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {

  readonly isFullscreen$ = merge(
    fromEvent(document, 'fullscreenchange'),
    fromEvent(document, 'webkitfullscreenchange'),
  ).pipe(
    startWith(null),
    map(() => !!document.fullscreenElement),
  )

  get isFullscreen(): boolean {
    return !!document.fullscreenElement
  }

  async toggle() {
    if (this.isFullscreen) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }
}
