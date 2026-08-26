import {describe, expect, it} from 'vitest'
import {isLoopbackApiUrlUnreachableFromBrowser, shouldEnableFanoutReplica} from './FanoutOdmBackend'

describe('FanoutOdmBackend replica reachability', () => {
  it('keeps localhost replicas enabled for desktop localhost dev', () => {
    expect(isLoopbackApiUrlUnreachableFromBrowser(
      'http://localhost:8000/api/odm',
      'http://localhost:8100/',
      'localhost',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    )).toBe(false)
  })

  it('skips localhost replicas when a phone is running the app', () => {
    expect(isLoopbackApiUrlUnreachableFromBrowser(
      'http://localhost:8000/api/odm',
      'http://localhost/',
      'localhost',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148',
    )).toBe(true)
  })

  it('skips localhost replicas when the app is served from a LAN host', () => {
    expect(isLoopbackApiUrlUnreachableFromBrowser(
      'http://localhost:8000/api/odm',
      'http://192.168.1.20:8100/',
      '192.168.1.20',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    )).toBe(true)
  })

  it('keeps hosted replicas enabled from mobile', () => {
    expect(shouldEnableFanoutReplica({
      enabled: true,
      odmApiUrl: 'https://life-suite-backend.vercel.app/api/odm',
    })).toBe(true)
  })

  it('honors explicit disabled replica config', () => {
    expect(shouldEnableFanoutReplica({
      enabled: false,
      odmApiUrl: 'https://life-suite-backend.vercel.app/api/odm',
    })).toBe(false)
  })
})
