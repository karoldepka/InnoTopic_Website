import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';

type ChatRole = 'user' | 'assistant';

type AngularChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
};

type AgUiEvent = {
  type: string;
  messageId?: string;
  delta?: string;
  message?: string;
};

@Component({
  standalone: false,
  selector: 'app-copilotkit-compare-page',
  templateUrl: './copilotkit-compare.page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./copilotkit-compare.page.scss'],
})
export class CopilotKitComparePage implements OnDestroy {
  endpointUrl = '/ai-api/copilotkit-agui';
  angularInput = '';
  angularBusy = false;
  angularError = '';
  angularMessages: AngularChatMessage[] = [
    {
      id: this.makeId('assistant'),
      role: 'assistant',
      content: 'Ask LifeSuite Copilot',
    },
  ];

  private angularThreadId = this.makeId('thread');
  private angularAbortController?: AbortController;

  ngOnDestroy(): void {
    this.angularAbortController?.abort();
  }

  async sendAngularMessage(): Promise<void> {
    const input = this.angularInput.trim();
    if (!input || this.angularBusy) {
      return;
    }

    this.angularInput = '';
    this.angularBusy = true;
    this.angularError = '';

    this.angularMessages.push({
      id: this.makeId('user'),
      role: 'user',
      content: input,
    });

    const assistantMessage: AngularChatMessage = {
      id: this.makeId('assistant'),
      role: 'assistant',
      content: '',
    };
    this.angularMessages.push(assistantMessage);

    try {
      await this.streamAngularResponse(assistantMessage);
    } catch (error) {
      this.angularError = error instanceof Error ? error.message : String(error);
      if (!assistantMessage.content) {
        assistantMessage.content = this.angularError;
      }
    } finally {
      this.angularBusy = false;
      this.angularAbortController = undefined;
    }
  }

  trackMessage(_: number, message: AngularChatMessage): string {
    return message.id;
  }

  private async streamAngularResponse(assistantMessage: AngularChatMessage): Promise<void> {
    this.angularAbortController?.abort();
    this.angularAbortController = new AbortController();

    const response = await fetch(this.endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        threadId: this.angularThreadId,
        runId: this.makeId('run'),
        state: {},
        messages: this.angularMessages
          .filter(message => message.content.trim().length > 0)
          .map(message => ({
            id: message.id,
            role: message.role,
            content: message.content,
          })),
        tools: [],
        context: [],
        forwardedProps: {
          client: 'angular-direct',
        },
      }),
      signal: this.angularAbortController.signal,
    });

    if (!response.ok) {
      throw new Error(`Backend returned HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error('Backend did not return a stream');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const readResult = await reader.read();
      if (readResult.done) {
        break;
      }

      buffer += decoder.decode(readResult.value, { stream: true });
      const frames = buffer.split(/\n\n/);
      buffer = frames.pop() ?? '';

      for (const frame of frames) {
        this.applyAgUiFrame(frame, assistantMessage);
      }
    }

    if (buffer.trim()) {
      this.applyAgUiFrame(buffer, assistantMessage);
    }
  }

  private applyAgUiFrame(frame: string, assistantMessage: AngularChatMessage): void {
    const data = frame
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trim())
      .join('\n');

    if (!data) {
      return;
    }

    const event = JSON.parse(data) as AgUiEvent;
    if (event.type === 'TEXT_MESSAGE_CONTENT' && event.delta) {
      assistantMessage.content += event.delta;
    }

    if (event.type === 'RUN_ERROR') {
      throw new Error(event.message ?? 'CopilotKit AG-UI run failed');
    }
  }

  private makeId(prefix: string): string {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
  }
}
