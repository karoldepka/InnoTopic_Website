import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-experiments-page',
  templateUrl: './experiments.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IonicModule],
})
export class ExperimentsPage {
  readonly supported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  readonly isRecording = signal(false);
  readonly finalTranscript = signal('');
  readonly interimTranscript = signal('');
  readonly audioUrl = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any;
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start() {
    this.error.set(null);
    this.finalTranscript.set('');
    this.interimTranscript.set('');
    this.audioUrl.set(null);

    if (!this.supported) {
      this.error.set('SpeechRecognition API not supported in this browser — try Chrome or Edge.');
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      this.error.set('Microphone access denied.');
      return;
    }

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(this.stream);
    this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: 'audio/webm' });
      this.audioUrl.set(URL.createObjectURL(blob));
    };
    this.mediaRecorder.start();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognitionCtor();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = this.finalTranscript();
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      this.finalTranscript.set(final);
      this.interimTranscript.set(interim);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.recognition.onerror = (event: any) => {
      this.error.set(`Speech recognition error: ${event.error}`);
    };

    this.recognition.start();
    this.isRecording.set(true);
  }

  stop() {
    this.recognition?.stop();
    this.mediaRecorder?.stop();
    this.stream?.getTracks().forEach((t) => t.stop());
    this.isRecording.set(false);
  }
}
