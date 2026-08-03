import {describe, it, expect, beforeEach, vi} from 'vitest'
import {FormControl} from '@angular/forms'
import {QuizAnswerRevealerComponent} from './quiz-answer-revealer.component'

describe('QuizAnswerRevealerComponent', () => {
  let component: QuizAnswerRevealerComponent

  beforeEach(() => {
    vi.useFakeTimers()
    component = new QuizAnswerRevealerComponent()
    component.formControl1 = new FormControl<string>('Categories, Tags and more')
  })

  it('a short click reveals one more character at a time (existing behavior)', () => {
    component.onPressStart()
    vi.advanceTimersByTime(100) // well under the long-press threshold
    component.onPressEnd()

    expect(component.getValue()).toBe('C')

    component.onPressStart()
    vi.advanceTimersByTime(100)
    component.onPressEnd()

    expect(component.getValue()).toBe('Ca')
  })

  it('a long press (GH #127) reveals the whole field value at once', () => {
    component.onPressStart()
    vi.advanceTimersByTime(500) // reaches the long-press threshold while still held down

    expect(component.getValue()).toBe('Categories, Tags and more')

    component.onPressEnd()

    // Releasing after a long-press must not also count as a short click and reveal further
    // (there's nothing further to reveal, but this also guards against any future off-by-one).
    expect(component.getValue()).toBe('Categories, Tags and more')
  })

  it('releasing before the long-press threshold cancels it and falls back to a normal single-character reveal', () => {
    component.onPressStart()
    vi.advanceTimersByTime(300) // released before the 500ms threshold
    component.onPressEnd()
    vi.advanceTimersByTime(1000) // the (now-cleared) long-press timer must not fire later

    expect(component.getValue()).toBe('C')
  })
})
