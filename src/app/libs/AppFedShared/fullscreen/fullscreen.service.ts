import {Injectable} from '@angular/core'
import {BehaviorSubject, fromEvent, merge} from 'rxjs'
import {map, startWith} from 'rxjs/operators'
import {Capacitor} from '@capacitor/core'
import {StatusBar} from '@capacitor/status-bar'

@Injectable({
  providedIn: 'root'
})
export class FullscreenService {

  /** The web Fullscreen API has nothing to do inside a native WebView - there's no browser
   * chrome to hide, so requestFullscreen() silently no-ops on Android. "Fullscreen" there
   * means hiding the status bar for an edge-to-edge look instead, which has no native
   * change event, so track it ourselves. */
  private isNativeFullscreen$ = new BehaviorSubject<boolean>(false)

  readonly isFullscreen$ = Capacitor.isNativePlatform()
    ? this.isNativeFullscreen$.asObservable()
    : merge(
        fromEvent(document, 'fullscreenchange'),
        fromEvent(document, 'webkitfullscreenchange'),
      ).pipe(
        startWith(null),
        map(() => !!document.fullscreenElement),
      )

  get isFullscreen(): boolean {
    return Capacitor.isNativePlatform() ? this.isNativeFullscreen$.value : !!document.fullscreenElement
  }

  async toggle() {
    if (Capacitor.isNativePlatform()) {
      const goingFullscreen = ! this.isNativeFullscreen$.value
      await (goingFullscreen ? StatusBar.hide() : StatusBar.show())
      this.isNativeFullscreen$.next(goingFullscreen)
      return
    }
    if (this.isFullscreen) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  }
}
