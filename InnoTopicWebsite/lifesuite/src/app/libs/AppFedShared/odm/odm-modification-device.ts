/** Stable per-browser-install marker carried with each locally edited ODM item. It lets the
 * cache distinguish this device's delayed realtime/fanout echoes from a genuinely different
 * device editing under the same user account. */
const STORAGE_KEY = 'odmModificationDeviceId'
let inMemoryDeviceId: string | undefined

export function getOdmModificationDeviceId(): string {
  if (inMemoryDeviceId) {
    return inMemoryDeviceId
  }
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY)
    if (stored) {
      return inMemoryDeviceId = stored
    }
    const generated = globalThis.crypto?.randomUUID?.() ?? `odm-${Date.now()}-${Math.random().toString(36).slice(2)}`
    globalThis.localStorage?.setItem(STORAGE_KEY, generated)
    return inMemoryDeviceId = generated
  } catch {
    // Storage can be unavailable in private/restricted contexts. A session-stable marker still
    // prevents this tab from mistaking its own immediate echoes for another editor's work.
    return inMemoryDeviceId = `odm-${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}
