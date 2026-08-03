import { TestBed } from '@angular/core/testing';
import { ListOptionsComponent } from './list-options.component';
import { ListOptionsData } from '../list-options';
import { PatchableObservable } from '../../../../libs/AppFedShared/utils/rxUtils';
import { CachedSubject } from '../../../../libs/AppFedShared/utils/cachedSubject2/CachedSubject2';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

class MockPatchableObservable implements PatchableObservable<ListOptionsData> {
  locallyVisibleChanges$ = new CachedSubject<ListOptionsData>()
  readonly patches: Partial<ListOptionsData>[] = []

  patchThrottled(patch: Partial<ListOptionsData>) {
    this.patches.push(patch)
    const current = this.locallyVisibleChanges$.lastVal ?? ({} as ListOptionsData)
    this.locallyVisibleChanges$.next({ ...current, ...patch })
  }
}

class MockItemsService {
  loadingAllItemsFromServerInitiated = false
  loadAllItemsFromServerCallCount = 0

  loadAllItemsFromServer() {
    this.loadAllItemsFromServerCallCount++
  }
}

async function createComponent(initialData?: ListOptionsData) {
  const listOptions = new MockPatchableObservable()
  if (initialData) {
    listOptions.locallyVisibleChanges$.next(initialData)
  }
  const itemsService = new MockItemsService()

  await TestBed.configureTestingModule({
    imports: [ListOptionsComponent, IonicModule.forRoot(), ReactiveFormsModule, NgIf],
  }).compileComponents()

  const fixture = TestBed.createComponent(ListOptionsComponent)
  const component = fixture.componentInstance
  component.listOptions$P = listOptions
  component.itemsService = itemsService as any
  fixture.detectChanges()

  return { component, fixture, listOptions, itemsService }
}

describe('ListOptionsComponent', () => {
  it('creates', async () => {
    const { component } = await createComponent()
    expect(component).toBeTruthy()
  })

  describe('setPreset', () => {
    it('patches the preset key on listOptions', async () => {
      const { component, listOptions } = await createComponent()
      component.setPreset('lastModified')
      expect(listOptions.patches).toEqual([{ preset: 'lastModified' }])
    })

    it('last patch wins when called multiple times', async () => {
      const { component, listOptions } = await createComponent()
      component.setPreset('allTasks')
      component.setPreset('importance_roi')
      expect(listOptions.patches[1]).toEqual({ preset: 'importance_roi' })
    })

    it('patches each valid preset key', async () => {
      const { component, listOptions } = await createComponent()
      const presets = ['lastModified', 'whenCreated', 'allTasks', 'tasks_by_importance_roi',
        'nearest_deadlines', 'importance_roi', 'roi', 'quickest', 'notEstimated', 'estimated']
      presets.forEach(p => component.setPreset(p))
      expect(listOptions.patches.map(p => p.preset)).toEqual(presets)
    })
  })

  describe('setHideAiGenerated', () => {
    it('patches hideAiGenerated: true', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideAiGenerated(true)
      expect(listOptions.patches).toEqual([{ hideAiGenerated: true }])
    })

    it('patches hideAiGenerated: false', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideAiGenerated(false)
      expect(listOptions.patches).toEqual([{ hideAiGenerated: false }])
    })

    it('updates locallyVisibleChanges$ after patch', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideAiGenerated(true)
      expect(listOptions.locallyVisibleChanges$.lastVal?.hideAiGenerated).toBeTrue()
    })

    it('can toggle hideAiGenerated on then off', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideAiGenerated(true)
      component.setHideAiGenerated(false)
      expect(listOptions.locallyVisibleChanges$.lastVal?.hideAiGenerated).toBeFalse()
    })
  })

  describe('setHideDrafts', () => {
    it('patches hideDrafts: true', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideDrafts(true)
      expect(listOptions.patches).toEqual([{ hideDrafts: true }])
    })

    it('patches hideDrafts: false', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideDrafts(false)
      expect(listOptions.patches).toEqual([{ hideDrafts: false }])
    })

    it('preserves other fields when patching hideDrafts', async () => {
      const { component, listOptions } = await createComponent({ preset: 'allTasks', hideAiGenerated: true } as ListOptionsData)
      component.setHideDrafts(true)
      expect(listOptions.locallyVisibleChanges$.lastVal).toEqual({
        preset: 'allTasks',
        hideAiGenerated: true,
        hideDrafts: true,
      })
    })
  })

  describe('setShowArchived', () => {
    it('patches showArchived: true', async () => {
      const { component, listOptions } = await createComponent()
      component.setShowArchived(true)
      expect(listOptions.patches).toEqual([{ showArchived: true }])
    })

    it('patches showArchived: false', async () => {
      const { component, listOptions } = await createComponent()
      component.setShowArchived(false)
      expect(listOptions.patches).toEqual([{ showArchived: false }])
    })
  })

  describe('loadAll', () => {
    it('delegates to itemsService.loadAllItemsFromServer', async () => {
      const { component, itemsService } = await createComponent()
      component.loadAll()
      expect(itemsService.loadAllItemsFromServerCallCount).toBe(1)
    })

    it('can be called multiple times', async () => {
      const { component, itemsService } = await createComponent()
      component.loadAll()
      component.loadAll()
      expect(itemsService.loadAllItemsFromServerCallCount).toBe(2)
    })
  })

  describe('checkbox state reflection', () => {
    it('reflects hideAiGenerated: true from initial data', async () => {
      const { listOptions } = await createComponent({ preset: 'all', hideAiGenerated: true } as ListOptionsData)
      expect(listOptions.locallyVisibleChanges$.lastVal?.hideAiGenerated).toBeTrue()
    })

    it('reflects hideAiGenerated: false from initial data', async () => {
      const { listOptions } = await createComponent({ preset: 'all', hideAiGenerated: false } as ListOptionsData)
      expect(listOptions.locallyVisibleChanges$.lastVal?.hideAiGenerated).toBeFalse()
    })

    it('reflects hideDrafts: true from initial data', async () => {
      const { listOptions } = await createComponent({ preset: 'all', hideDrafts: true } as ListOptionsData)
      expect(listOptions.locallyVisibleChanges$.lastVal?.hideDrafts).toBeTrue()
    })

    it('reflects showArchived: true from initial data', async () => {
      const { listOptions } = await createComponent({ preset: 'all', showArchived: true } as ListOptionsData)
      expect(listOptions.locallyVisibleChanges$.lastVal?.showArchived).toBeTrue()
    })
  })

  describe('independent patches do not interfere', () => {
    it('setHideAiGenerated and setHideDrafts are independent', async () => {
      const { component, listOptions } = await createComponent()
      component.setHideAiGenerated(true)
      component.setHideDrafts(true)
      expect(listOptions.patches[0]).toEqual({ hideAiGenerated: true })
      expect(listOptions.patches[1]).toEqual({ hideDrafts: true })
    })

    it('setShowArchived does not affect hideAiGenerated or hideDrafts', async () => {
      const { component, listOptions } = await createComponent({
        preset: 'all',
        hideAiGenerated: true,
        hideDrafts: true,
      } as ListOptionsData)
      component.setShowArchived(true)
      expect(listOptions.locallyVisibleChanges$.lastVal).toEqual({
        preset: 'all',
        hideAiGenerated: true,
        hideDrafts: true,
        showArchived: true,
      })
    })

    it('setPreset does not affect hideAiGenerated', async () => {
      const { component, listOptions } = await createComponent({ preset: 'all', hideAiGenerated: true } as ListOptionsData)
      component.setPreset('lastModified')
      expect(listOptions.locallyVisibleChanges$.lastVal?.hideAiGenerated).toBeTrue()
    })
  })
})
