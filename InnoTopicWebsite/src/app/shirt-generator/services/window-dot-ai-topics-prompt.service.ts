import { Injectable } from '@angular/core';
import { AbstractTopicsPromptService } from '../models/abstract-topics-prompt.service';
import { defer, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WindowDotAiTopicsPromptService extends AbstractTopicsPromptService {

  constructor() {
    super();
  }

  public override prompt(text: string): Observable<string[]> {
    return defer(async () => {
      const notSupportedError = new Error('Browser is not AI supported');

      if (!window.ai) {
        throw notSupportedError;
      }

      const support = await window.ai.canCreateTextSession();
      if (support === 'no') {
        throw notSupportedError;
      }

      const session = await window.ai.createTextSession();
      try {
        const result = await session.prompt(text);
        return result.split(',').map(item => item.trim()).filter(Boolean);
      } finally {
        session.destroy();
      }
    });
  }

}
