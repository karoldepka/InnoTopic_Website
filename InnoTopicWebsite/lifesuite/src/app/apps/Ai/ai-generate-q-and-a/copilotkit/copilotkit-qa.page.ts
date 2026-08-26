import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import 'deep-chat';
import { environment } from '../../../../../environments/environment';

import { AiQaWorkbenchComponent } from '../../shared/ai-qa-workbench.component';

const COPILOT_AGUI_URL = environment.backendUrl
  ? `${environment.backendUrl}/ai-api/copilotkit-agui`
  : '/ai-api/copilotkit-agui';

@Component({
  selector: 'app-copilotkit-qa-page',
  templateUrl: './copilotkit-qa.page.html',
  styleUrls: ['./copilotkit-qa.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [IonicModule, AiQaWorkbenchComponent],
})
export class CopilotkitQaPage {
  private readonly threadId = this.makeId('thread');
  private activeAbortController?: AbortController;

  readonly deepChatConnect = {
    handler: (body: any, signals: any) => this.handleCopilotRequest(body, signals),
  };

  readonly deepChatIntroMessage = { text: 'Ask anything about your Q&A generation.' };

  readonly deepChatChatStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '0',
    border: 'none',
    fontSize: '0.92rem',
  };

  readonly deepChatMessageStyles = {
    default: {
      user: {
        bubble: {
          backgroundColor: 'var(--ion-color-primary)',
          color: 'var(--ion-color-primary-contrast)',
        },
      },
    },
  };

  private handleCopilotRequest(body: any, signals: any): void {
    const abortController = new AbortController();
    this.activeAbortController = abortController;
    signals.stopClicked.listener = () => abortController.abort();

    const messages = (body?.messages ?? []).map((m: any) => ({
      id: this.makeId(m.role ?? 'msg'),
      role: m.role === 'ai' ? 'assistant' : (m.role ?? 'user'),
      content: m.text ?? '',
    }));

    this.streamToSignals(messages, abortController.signal, signals);
  }

  private async streamToSignals(messages: any[], signal: AbortSignal, signals: any): Promise<void> {
    let accumulated = '';
    try {
      const response = await fetch(COPILOT_AGUI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
        body: JSON.stringify({
          threadId: this.threadId,
          runId: this.makeId('run'),
          state: {},
          messages,
          tools: [],
          context: [],
          forwardedProps: { client: 'deep-chat-qa' },
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
