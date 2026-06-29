import { DOCUMENT } from '@angular/common'
import { Inject, Injectable, type ListenerOptions } from '@angular/core'
import { GestureController, type Gesture, type GestureDetail } from '@ionic/angular'
import { EVENT_MANAGER_PLUGINS, EventManagerPlugin } from '@angular/platform-browser'

const PRESS_TIME_MS = 1000
const MAX_MOVE_PX = 10
const SUPPRESS_CLICK_MS = 750

interface LegacyGestureEvent {
  type: string
  srcEvent: UIEvent
  detail: GestureDetail
  altKey?: boolean
  preventDefault(): void
  stopPropagation(): void
}

interface GestureCallbacks {
  onStart?: (detail: GestureDetail) => void
  onMove?: (detail: GestureDetail) => void
  onEnd?: (detail: GestureDetail) => void
  notCaptured?: (detail: GestureDetail) => void
}

@Injectable()
export class PressEventPlugin extends EventManagerPlugin {
  constructor(
    @Inject(DOCUMENT) doc: Document,
    private gestureController: GestureController,
  ) {
    super(doc)
  }

  supports(eventName: string): boolean {
    return eventName === 'press' || eventName === 'tap'
  }

  addEventListener(
    element: HTMLElement,
    eventName: string,
    handler: Function,
    options?: ListenerOptions,
  ): Function {
    return eventName === 'press'
      ? this.addPressListener(element, handler, options)
      : this.addTapListener(element, handler, options)
  }

  private addPressListener(
    element: HTMLElement,
    handler: Function,
    _options?: ListenerOptions,
  ): Function {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    let suppressClickUntil = 0

    const clearTimer = () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const gesture = this.createGesture(element, 'legacy-press', {
      onStart: detail => {
        clearTimer()
        timeoutId = setTimeout(() => {
          timeoutId = null
          suppressClickUntil = Date.now() + SUPPRESS_CLICK_MS
          this.manager.getZone().run(() => handler(this.toLegacyEvent('press', detail)))
        }, PRESS_TIME_MS)
      },
      onMove: detail => {
        if (this.hasGestureMovedTooFar(detail)) {
          clearTimer()
        }
      },
      onEnd: () => {
        clearTimer()
      },
      notCaptured: () => clearTimer(),
    })

    const onClick = (event: MouseEvent) => {
      if (Date.now() >= suppressClickUntil) {
        return
      }
      event.preventDefault()
      event.stopPropagation()
    }

    const onContextMenu = (event: MouseEvent) => {
      if (timeoutId || Date.now() < suppressClickUntil) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    element.addEventListener('click', onClick, { capture: true })
    element.addEventListener('contextmenu', onContextMenu, { capture: true })
    gesture.enable(true)

    return () => {
      clearTimer()
      gesture.destroy()
      element.removeEventListener('click', onClick, { capture: true })
      element.removeEventListener('contextmenu', onContextMenu, { capture: true })
    }
  }

  private addTapListener(
    element: HTMLElement,
    handler: Function,
    _options?: ListenerOptions,
  ): Function {
    const gesture = this.createGesture(element, 'legacy-tap', {
      onEnd: detail => {
        const elapsed = detail.currentTime - detail.startTime
        const wasTap = elapsed < PRESS_TIME_MS && !this.hasGestureMovedTooFar(detail)
        if (wasTap) {
          this.manager.getZone().run(() => handler(this.toLegacyEvent('tap', detail)))
        }
      },
    })

    gesture.enable(true)
    return () => gesture.destroy()
  }

  private createGesture(
    element: HTMLElement,
    gestureName: string,
    callbacks: GestureCallbacks,
  ): Gesture {
    return this.gestureController.create({
      el: element,
      gestureName,
      threshold: 0,
      passive: false,
      ...callbacks,
    })
  }

  private toLegacyEvent(type: string, detail: GestureDetail): LegacyGestureEvent {
    const sourceEvent = detail.event
    const keyboardEvent = sourceEvent as UIEvent & { altKey?: boolean }
    return {
      type,
      srcEvent: sourceEvent,
      detail,
      altKey: keyboardEvent.altKey,
      preventDefault: () => sourceEvent.preventDefault(),
      stopPropagation: () => sourceEvent.stopPropagation(),
    }
  }

  private hasGestureMovedTooFar(detail: GestureDetail): boolean {
    return Math.hypot(detail.deltaX, detail.deltaY) > MAX_MOVE_PX
  }
}

export const PRESS_EVENT_PLUGIN_PROVIDER = {
  provide: EVENT_MANAGER_PLUGINS,
  useClass: PressEventPlugin,
  multi: true,
}
