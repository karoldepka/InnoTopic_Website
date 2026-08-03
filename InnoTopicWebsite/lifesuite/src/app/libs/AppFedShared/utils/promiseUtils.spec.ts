import {describe, it, expect} from 'vitest'
import {ConcurrencyLimiter} from './promiseUtils'

describe('ConcurrencyLimiter', () => {
  it('never runs more than `limit` functions at once', async () => {
    const limiter = new ConcurrencyLimiter(2)
    let active = 0
    let maxActive = 0

    const task = () => limiter.run(async () => {
      active++
      maxActive = Math.max(maxActive, active)
      await new Promise(resolve => setTimeout(resolve, 10))
      active--
      return 'done'
    })

    const results = await Promise.all([task(), task(), task(), task(), task()])

    expect(maxActive).toBeLessThanOrEqual(2)
    expect(results).toEqual(['done', 'done', 'done', 'done', 'done'])
  })

  it('runs a queued call once a slot frees up, not before', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const order: string[] = []

    const first = limiter.run(async () => {
      order.push('first-start')
      await new Promise(resolve => setTimeout(resolve, 10))
      order.push('first-end')
    })
    const second = limiter.run(async () => {
      order.push('second-start')
    })

    await Promise.all([first, second])

    expect(order).toEqual(['first-start', 'first-end', 'second-start'])
  })

  it('propagates a rejection to the caller without blocking later calls', async () => {
    const limiter = new ConcurrencyLimiter(1)

    await expect(limiter.run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom')

    const after = await limiter.run(async () => 'still works')
    expect(after).toBe('still works')
  })

  it('an earlier call failing (e.g. a dropped connection) still frees its slot for calls already queued behind it', async () => {
    const limiter = new ConcurrencyLimiter(1)
    const order: string[] = []

    const first = limiter.run(async () => {
      order.push('first-start')
      throw new Error('connection interrupted')
    })
    const second = limiter.run(async () => {
      order.push('second-start')
      return 'second-done'
    })
    const third = limiter.run(async () => {
      order.push('third-start')
      return 'third-done'
    })

    const settled = await Promise.allSettled([first, second, third])

    expect(order).toEqual(['first-start', 'second-start', 'third-start'])
    expect(settled[0].status).toBe('rejected')
    expect(settled[1]).toEqual({status: 'fulfilled', value: 'second-done'})
    expect(settled[2]).toEqual({status: 'fulfilled', value: 'third-done'})
  })
})
