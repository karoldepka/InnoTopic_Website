import {describe, it, expect} from 'vitest'
import {Subject} from 'rxjs'
import {IndexedDbHealthToastService} from './IndexedDbHealthToastService'

/** Mock standing in for `BrowserOdmStorage` - only `connectionRecovered$` is used by the
 * service under test. */
class MockBrowserOdmStorage {
  connectionRecovered$ = new Subject<void>()
}

/** Mock standing in for Ionic's `ToastController` - records how many toasts were created and
 * presented, without touching any real Ionic component tree. */
class MockToastController {
  createCalls = 0
  presentCalls = 0

  async create(_opts: any): Promise<{present: () => Promise<void>, addEventListener: () => void}> {
    this.createCalls++
    return {
      present: async () => {
        this.presentCalls++
      },
      addEventListener: () => {}, // presentDismissableToast() wires a click-to-dismiss listener
    }
  }
}

async function flushMicrotasks(): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 0))
}

describe('IndexedDbHealthToastService', () => {
  it('shows a toast when the connection recovers', async () => {
    const storage = new MockBrowserOdmStorage()
    const toastController = new MockToastController()
    new IndexedDbHealthToastService(storage as any, toastController as any)

    storage.connectionRecovered$.next()
    await flushMicrotasks()

    expect(toastController.createCalls).toBe(1)
    expect(toastController.presentCalls).toBe(1)
  })

  it('throttles repeated recoveries instead of showing a toast for each one', async () => {
    const storage = new MockBrowserOdmStorage()
    const toastController = new MockToastController()
    new IndexedDbHealthToastService(storage as any, toastController as any)

    storage.connectionRecovered$.next()
    storage.connectionRecovered$.next()
    storage.connectionRecovered$.next()
    await flushMicrotasks()

    expect(toastController.createCalls).toBe(1)
  })

  it('does nothing before any recovery happens', async () => {
    const storage = new MockBrowserOdmStorage()
    const toastController = new MockToastController()
    new IndexedDbHealthToastService(storage as any, toastController as any)

    await flushMicrotasks()

    expect(toastController.createCalls).toBe(0)
  })
})
