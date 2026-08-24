import {Injectable, signal} from '@angular/core'

const STORAGE_KEY = 'odmBackfillProgress'

export interface OdmBackfillProgress {
  collectionName: string
  done: number
  total: number
  state: 'running' | 'done' | 'failed'
}

/** Shared, live progress for the explicit Supabase-to-peer ODM backfill. */
@Injectable({providedIn: 'root'})
export class OdmBackfillProgressService {
  readonly collections = signal<OdmBackfillProgress[]>(this.restore())

  start(collectionName: string): void {
    this.update({collectionName, done: 0, total: 0, state: 'running'})
  }

  setTotal(collectionName: string, total: number): void {
    this.update({...this.current(collectionName), total})
  }

  incrementDone(collectionName: string): void {
    const progress = this.current(collectionName)
    this.update({...progress, done: progress.done + 1})
  }

  finish(collectionName: string): void {
    const progress = this.current(collectionName)
    this.update({...progress, done: progress.total, state: 'done'})
  }

  fail(collectionName: string): void {
    this.update({...this.current(collectionName), state: 'failed'})
  }

  private current(collectionName: string): OdmBackfillProgress {
    return this.collections().find(progress => progress.collectionName === collectionName)
      ?? {collectionName, done: 0, total: 0, state: 'running'}
  }

  private update(next: OdmBackfillProgress): void {
    const collections = [
      ...this.collections().filter(progress => progress.collectionName !== next.collectionName),
      next,
    ].sort((a, b) => a.collectionName.localeCompare(b.collectionName))
    this.collections.set(collections)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collections))
    }
  }

  private restore(): OdmBackfillProgress[] {
    if (typeof localStorage === 'undefined') return []
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
      return Array.isArray(saved)
        ? saved.filter((progress): progress is OdmBackfillProgress =>
          typeof progress?.collectionName === 'string'
          && typeof progress.done === 'number'
          && typeof progress.total === 'number'
          && ['running', 'done', 'failed'].includes(progress.state))
        : []
    } catch {
      return []
    }
  }
}
