import { NodeContentComponent } from './node-content.component'

describe('NodeContentComponent keyboard shortcuts', () => {
  function createComponent() {
    return new NodeContentComponent(
      {} as any,
      {detectChanges() {}} as any,
      {} as any,
      {
        config$: {
          subscribe(callback: (config: any) => void) {
            callback({showMinMaxColumns: false})
            return {unsubscribe() {}}
          },
        },
      } as any,
      {} as any,
      {} as any,
    )
  }

  function createKeyboardEvent(overrides: Partial<KeyboardEvent> = {}): KeyboardEvent {
    return {
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      defaultPrevented: false,
      preventDefault() {},
      stopImmediatePropagation() {},
      ...overrides,
    } as KeyboardEvent
  }

  it('handles alt+enter via child insertion only', () => {
    const component = createComponent()
    const event = createKeyboardEvent({altKey: true})
    spyOn(component, 'addChild')
    spyOn(event, 'preventDefault')
    spyOn(event, 'stopImmediatePropagation')

    component.keyPressAltEnter(event)

    expect(component.addChild).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.stopImmediatePropagation).toHaveBeenCalled()
  })

  it('does not also insert a sibling when enter is modified', () => {
    const component = createComponent()
    component.treeNode = {isVisualRoot: false} as any
    const event = createKeyboardEvent({altKey: true})
    spyOn(component, 'addNodeAfterThis')

    component.keyPressEnter(event)

    expect(component.addNodeAfterThis).not.toHaveBeenCalled()
  })

  it('still inserts a sibling on plain enter', () => {
    const component = createComponent()
    component.treeNode = {isVisualRoot: false} as any
    const newTreeNode = {} as any
    const event = createKeyboardEvent()
    spyOn(component, 'addNodeAfterThis').and.returnValue(newTreeNode)
    spyOn<any>(component, 'focusNewlyCreatedNode')
    spyOn(event, 'preventDefault')

    component.keyPressEnter(event)

    expect(component.addNodeAfterThis).toHaveBeenCalled()
    expect(component['focusNewlyCreatedNode']).toHaveBeenCalledWith(newTreeNode)
    expect(event.preventDefault).toHaveBeenCalled()
  })
})
