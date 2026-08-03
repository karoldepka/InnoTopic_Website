import { Component, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AiBackendService } from '../core/ai-backend.service';
import { stripHtml } from '../../../libs/AppFedShared/utils/html-utils';
import 'deep-chat';

@Component({
  selector: 'app-learn-ai-chat',
  templateUrl: './learn-ai-chat.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonicModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class LearnAiChatPage {

  deepChatConnect = {
    stream: {simulation: 6},
    handler: (body: any, signals: any) => this.handleDeepChatRequest(body, signals),
  }

  deepChatRequestBodyLimits = {
    maxMessages: 8,
    totalMessagesMaxCharLength: 10000,
  }

  deepChatIntroMessage = {
    text: 'What can we shape into the list?',
  }

  deepChatNames = {
    user: 'You',
    ai: 'LifeSuite',
  }

  deepChatTextInput = {
    placeholder: {
      text: 'Ask about the item...',
    },
  }

  deepChatChatStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '8px',
    border: '1px solid rgba(0, 0, 0, 0.12)',
    fontSize: '0.92rem',
  }

  deepChatMessageStyles = {
    default: {
      user: {
        bubble: {
          backgroundColor: 'var(--ion-color-primary)',
          color: 'var(--ion-color-primary-contrast)',
        },
      },
      ai: {
        bubble: {
          backgroundColor: '#f5f7fb',
          color: '#1f2937',
        },
      },
    },
  }

  constructor(private aiBackend: AiBackendService) {}

  private handleDeepChatRequest(body: any, signals: any) {
    const question = this.extractDeepChatText(body).trim()
    if (!question) {
      signals.onResponse({error: 'Write a message first.'})
      return
    }

    const subscription = this.aiBackend.generateAnswer(question, '').subscribe({
      next: response => signals.onResponse({text: response.answer || ''}),
      error: error => {
        console.error('Deep Chat request failed', error)
        signals.onResponse({error: this.formatDeepChatError(error)})
      },
    })

    signals.stopClicked.listener = () => subscription.unsubscribe()
  }

  private extractDeepChatText(body: any): string {
    if (body?.messages?.length) {
      const latestMessage = body.messages[body.messages.length - 1]
      return latestMessage?.text ?? ''
    }

    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      let formDataText = ''
      body.forEach((value: any) => {
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            if (parsed?.text) {
              formDataText = parsed.text
            }
          } catch (_) {}
        }
      })
      return formDataText
    }

    return body?.text ?? ''
  }

  private formatDeepChatError(error: any): string {
    return error?.error?.message
      ?? error?.message
      ?? 'The AI backend did not return a response.'
  }
}
