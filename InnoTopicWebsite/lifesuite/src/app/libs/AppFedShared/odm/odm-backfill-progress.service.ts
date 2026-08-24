import {Injectable, signal} from '@angular/core'

export interface OdmBackfillProgress {
  collectionName: string
  done: number
  total: number
  state: 'running' | 'done' | 'failed'
}

/** Shared, live progress for the explicit Supabase-to-peer ODM backfill. */
@Injectable({providedIn: 'root'})
export class OdmBackfillProgressService {
  readonly collections = signal<OdmBackfillProgress[]>([])

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
    this.collections.update(collections => [
      ...collections.filter(progress => progress.collectionName !== next.collectionName),
      next,
    ].sort((a, b) => a.collectionName.localeCompare(b.collectionName)))
  }
}
