import {BehaviorSubject} from 'rxjs'
import {
  createBalancedIntensityButtonsDescriptor,
  intensityBtnVariant,
  SyncedDescriptorFieldEditComponent,
} from './descriptor-level-edit'
import {PatchableObservable} from '../../AppFedShared/utils/rxUtils'

describe('descriptor-level-edit', () => {

  describe('intensityBtnVariant', () => {
    it('uses descriptor id for value, id, and readable sub-label', () => {
      const descriptor = {id: 'very_high', numeric: 20}

      const variant = intensityBtnVariant('!!', descriptor)

      expect(variant.value).toBe(descriptor)
      expect(variant.label).toBe('!!')
      expect(variant.id).toBe('very_high')
      expect(variant.subLabel).toBe('very high')
    })

    it('falls back to shortId when descriptor id is not initialized yet', () => {
      const variant = intensityBtnVariant('?', {shortId: 'Unk'})

      expect(variant.id).toBe('Unk')
      expect(variant.subLabel).toBe('Unk')
    })
  })

  describe('createBalancedIntensityButtonsDescriptor', () => {
    const levels = {
      somewhat_low: {id: 'somewhat_low'},
      low: {id: 'low'},
      very_low: {id: 'very_low'},
      extremely_low: {id: 'extremely_low'},
      medium: {id: 'medium'},
      unknown: {id: 'unknown'},
      undefined: {id: 'undefined'},
      somewhat_high: {id: 'somewhat_high'},
      high: {id: 'high'},
      very_high: {id: 'very_high'},
      extremely_high: {id: 'extremely_high'},
    }

    it('creates low, neutral, and high button groups in descriptor order', () => {
      const buttonsDescriptor = createBalancedIntensityButtonsDescriptor(
        levels,
        ['L1', 'L2', 'L3', 'L4'],
        ['H1', 'H2', 'H3', 'H4'],
      )

      expect(buttonsDescriptor.buttons.length).toBe(3)
      expect(buttonsDescriptor.buttons[0].btnVariants.map(v => v.id)).toEqual([
        'somewhat_low',
        'low',
        'very_low',
        'extremely_low',
      ])
      expect(buttonsDescriptor.buttons[1].btnVariants.map(v => v.id)).toEqual([
        'medium',
        'unknown',
        'undefined',
      ])
      expect(buttonsDescriptor.buttons[2].btnVariants.map(v => v.label)).toEqual([
        'H1',
        'H2',
        'H3',
        'H4',
      ])
    })
  })

  describe('SyncedDescriptorFieldEditComponent', () => {
    type TestItem = {mood?: {id: string}}

    class TestDescriptorEditComponent extends SyncedDescriptorFieldEditComponent<PatchableObservable<TestItem>> {
      readonly fieldName = 'mood'
    }

    it('creates a form control for the declared field and syncs incoming item data', () => {
      const mood = {id: 'medium'}
      const item$ = {
        locallyVisibleChanges$: new BehaviorSubject<TestItem>({mood}) as any,
        patchThrottled: jasmine.createSpy('patchThrottled'),
      } as PatchableObservable<TestItem>
      const component = new TestDescriptorEditComponent()

      component.item$ = item$
      component.ngOnInit()

      expect(component.formControls.mood).toBeTruthy()
      expect(component.formGroup.get('mood')?.value).toBe(mood)
      expect(component.viewSyncer.fieldNameHack).toBe('mood')
    })
  })

})
