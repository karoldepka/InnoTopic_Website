import {
  Injectable,
  signal,
} from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HighlightService {

  readonly highlightedId = signal<string | undefined>(undefined)

  setHighlight(id: string) {
    this.highlightedId.set(id)
  }
}
