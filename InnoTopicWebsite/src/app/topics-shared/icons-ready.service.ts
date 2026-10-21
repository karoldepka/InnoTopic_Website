import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class IconsReadyService {
  private readonly pendingLoads = new Set<number>();
  private readonly readySubject = new BehaviorSubject(false);
  private nextLoadId = 0;
  private hasSeenIcon = false;
  private settleTimer?: ReturnType<typeof setTimeout>;
  /** When the first icon of the current not-yet-ready batch started loading. */
  private batchStartedAt?: number;
  private lastLoadFinishedAt = 0;

  /** True after all currently rendered topic icons finish loading/recoloring. */
  readonly iconsReady$: Observable<boolean> = this.readySubject.asObservable();

  beginLoad(source: string): () => void {
    const loadId = ++this.nextLoadId;
    this.pendingLoads.add(loadId);
    this.hasSeenIcon = true;
    this.batchStartedAt ??= performance.now();
    clearTimeout(this.settleTimer);
    this.readySubject.next(false);

    let completed = false;
    return () => {
      if (completed) return;
      completed = true;
      this.pendingLoads.delete(loadId);
      this.lastLoadFinishedAt = performance.now();
      this.scheduleReadyState();
    };
  }

  private scheduleReadyState() {
    if (!this.hasSeenIcon || this.pendingLoads.size > 0) return;

    // Let icons created by the same render/deferred section register before
    // announcing that the current page icon set is ready.
    clearTimeout(this.settleTimer);
    this.settleTimer = setTimeout(() => {
      if (this.pendingLoads.size === 0) {
        const tookSeconds = (this.lastLoadFinishedAt - (this.batchStartedAt ?? this.lastLoadFinishedAt)) / 1000;
        const sinceNavigationSeconds = this.lastLoadFinishedAt / 1000;
        this.batchStartedAt = undefined;
        this.readySubject.next(true);
        console.log(`ALL ICONS READY - can print now (took ${tookSeconds.toFixed(2)} s; `
          + `${sinceNavigationSeconds.toFixed(2)} s since navigation start)`);
      }
    }, 100);
  }
}
