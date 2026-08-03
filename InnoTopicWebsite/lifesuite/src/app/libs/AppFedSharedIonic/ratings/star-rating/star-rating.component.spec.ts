import {describe, it, expect, beforeEach} from 'vitest'
import {ChangeDetectorRef} from '@angular/core'
import {StarRatingComponent} from './star-rating.component'

describe('StarRatingComponent', () => {
  let component: StarRatingComponent
  let emittedValues: number[]
  let formValues: number[]
  let markForCheckCallCount: number

  beforeEach(() => {
    markForCheckCallCount = 0
    const fakeChangeDetectorRef = {markForCheck: () => { markForCheckCallCount++ }} as unknown as ChangeDetectorRef
    component = new StarRatingComponent(fakeChangeDetectorRef)
    emittedValues = []
    formValues = []
    component.numericValue.subscribe(value => emittedValues.push(value))
    component.registerOnChange(value => formValues.push(value))
  })

  it('sets a new star to full value, then cycles the same star through fractional fills', () => {
    component.onStarClick(3)
    component.onStarClick(3)
    component.onStarClick(3)
    component.onStarClick(3)
    component.onStarClick(3)

    expect(emittedValues).toEqual([3, 2.5, 2.25, 2.75, 3])
    expect(formValues).toEqual(emittedValues)
    expect(component.currentValue).toBe(3)
  })

  it('starts a different clicked star at full value', () => {
    component.onStarClick(3)
    component.onStarClick(3)
    component.onStarClick(5)

    expect(emittedValues).toEqual([3, 2.5, 5])
    expect(component.currentValue).toBe(5)
  })

  it('a real [ngModel]-bound usage (journal-numeric-fields.component.html) round-trips the emitted value back in via writeValue() on every change-detection pass - clicking twice must still reach half-fill', () => {
    // Mirrors the actual integration: [ngModel]="starValueFor(descriptor)" is a *plain* (not
    // banana-in-a-box) one-way binding, but Eager change detection on the parent
    // (JournalNumericFieldsComponent) re-evaluates it on every tick regardless, including the
    // very tick right after this component's own click handler runs - so NgModel calls
    // writeValue() with whatever the parent's store now reports, synchronously interleaved with
    // each click, not just once at setup.
    const writeBack = () => component.writeValue(emittedValues[emittedValues.length - 1])

    component.onStarClick(3)
    writeBack()
    component.onStarClick(3)
    writeBack()

    expect(emittedValues).toEqual([3, 2.5])
    expect(component.currentValue).toBe(2.5)
    // The OnPush view must actually be told to re-check after each external writeValue() call -
    // this is the part that was missing before (see writeValue()'s comment): the state above was
    // already correct without it, but the star fill silently wouldn't have re-rendered to show it.
    expect(markForCheckCallCount).toBe(2)
  })

  it('can cycle the first star back to zero when clearing is allowed', () => {
    component.allowZero = true

    component.onStarClick(1)
    component.onStarClick(1)
    component.onStarClick(1)
    component.onStarClick(1)
    component.onStarClick(1)

    expect(emittedValues).toEqual([1, 0.5, 0.25, 0.75, 0])
    expect(component.currentValue).toBe(0)
  })
})
