import { Component, ElementRef, ViewChild, AfterViewChecked, signal } from '@angular/core';
import { Chat } from '@ai-sdk/angular';
import { TextStreamChatTransport, UIMessage } from 'ai';

@Component({
  standalone: false,
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements AfterViewChecked {
  @ViewChild('chatContent', { read: ElementRef }) private chatContent!: ElementRef;

  // Questions about the CV, answered by Claude on Amazon Bedrock (api/cv-chat.ts), streamed as plain text
  public chat = new Chat({
    transport: new TextStreamChatTransport({
      api: '/api/cv-chat',
    }),
    onError: (error) => {
      console.error('AI Chat Error:', error);
    }
  });

  // Signal to handle local input message state
  public inputMessage = signal('');

  public readonly exampleQuestions = [
    'What does Karol work on currently?',
    'How much experience does Karol have with Angular?',
    'Has Karol built anything with Amazon Bedrock or other LLMs?',
    'Which languages does Karol speak?',
  ];

  private shouldScroll = false;

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  /** Waiting for the answer to start (the model reads the CV and thinks first) or streaming it. */
  public get busy(): boolean {
    return this.chat.status === 'submitted' || this.chat.status === 'streaming';
  }

  public askExample(question: string) {
    this.inputMessage.set(question);
    this.sendMessage();
  }

  public sendMessage(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    const content = this.inputMessage().trim();
    if (!content || this.busy) {
      return;
    }

    // Send the message using the SDK's sendMessage method
    this.chat.sendMessage({ text: content });
    
    // Clear input message state
    this.inputMessage.set('');
    this.shouldScroll = true;
  }

  // Helper to extract text from a UIMessage's parts array for rendering
  public getMessageText(message: UIMessage): string {
    if (!message.parts) {
      return '';
    }
    return message.parts
      .filter(part => part.type === 'text')
      .map(part => (part as any).text || '')
      .join('');
  }

  private scrollToBottom(): void {
    try {
      const el = this.chatContent.nativeElement;
      el.scrollTop = el.scrollHeight;
    } catch (err) {
      console.warn('Scroll to bottom failed:', err);
    }
  }
}
