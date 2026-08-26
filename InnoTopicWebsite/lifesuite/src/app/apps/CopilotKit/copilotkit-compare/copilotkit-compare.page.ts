import { Component, OnDestroy, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import 'deep-chat';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-copilotkit-compare-page',
    templateUrl: './copilotkit-compare.page.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./copilotkit-compare.page.scss'],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [
        IonicModule,
    ],
})
export class CopilotKitComparePage implements OnDestroy {
  private readonly endpointUrl = environment.aiBackendUrl
    ? `${environment.aiBackendUrl}/copilotkit-agui`
    : '/ai-api/copilotkit-agui';
  private readonly threadId = this.makeId('thread');
  private activeAbortController?: AbortController;

  deepChatCopilotConnect = {
    handler: (body: any, signals: any) => this.handleCopilotRequest(body, signals),
  };

  deepChatIntroMessage = { text: 'Ask LifeSuite Copilot anything.' };

  deepChatChatStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0',
    border: 'none',
    fontSize: '0.95rem',
  };

  deepChatMessageStyles = {
    default: {
      user: {
        bubble: {
          backgroundColor: 'var(--ion-color-primary)',
          color: 'var(--ion-color-primary-contrast)',
        },
      },
    },
  };

  ngOnDestroy(): void {
    this.activeAbortController?.abort();
  }

  private handleCopilotRequest(body: any, signals: any): void {
    const abortController = new AbortController();
    this.activeAbortController = abortController;
    signals.stopClicked.listener = () => abortController.abort();

    const messages = (body?.messages ?? []).map((m: any) => ({
      id: this.makeId(m.role ?? 'msg'),
      role: m.role === 'ai' ? 'assistant' : (m.role ?? 'user'),
      content: m.text ?? '',
    }));

    this.streamCopilotToSignals(messages, abortController.signal, signals);
  }

  private async streamCopilotToSignals(messages: any[], signal: AbortSignal, signals: any): Promise<void> {
    let accumulated = '';
    try {
      const response = await fetch(this.endpointUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          threadId: this.threadId,
          runId: this.makeId('run'),
          state: {},
          messages,
          tools: [],
          context: [],
          forwardedProps: { client: 'deep-chat' },
        }),
        signal,
      });

      if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
      if (!response.body) throw new Error('No stream returned');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split(/\n\n/);
        buffer = frames.pop() ?? '';
        for (const frame of frames) {
          const dataLine = frame.split('\n').find(l => l.startsWith('data:'));
          if (!dataLine) continue;
          try {
            const event = JSON.parse(dataLine.slice(5).trim());
            if (event.type === 'TEXT_MESSAGE_CONTENT' && event.delta) {
              accumulated += event.delta;
              signals.onResponse({ text: accumulated, isPartial: true });
            }
          } catch { /* malformed SSE frame */ }
        }
      }
      signals.onResponse({ text: accumulated || '(No response)' });
    } catch (e: any) {
      if (e?.name !== 'AbortError') {
        signals.onResponse({ error: e?.message ?? 'Copilot error' });
      }
    }
  }

  private makeId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }
}
