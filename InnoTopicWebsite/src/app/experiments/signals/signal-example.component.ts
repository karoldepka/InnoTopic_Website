import {
  Component,
  Signal,
  signal,
  computed,
  WritableSignal,
} from '@angular/core';

@Component({
  selector: 'app-signal-example',
  template: `
    <h2>Angular Signals Example</h2>
    <!--    <p>Count: {{ count() }}</p>-->
    <p>Count: {{ countSignalReadOnly() }}</p>
    <p>Derived Signal Value: {{ derivedSignal() }}</p>
    <button (click)="increment()">Increment</button>

    <button (click)="decrement()">Decrement</button>
  `,
})
export class SignalExampleComponent {
  countSignal: WritableSignal<number> = signal(0);
  countSignalReadOnly: Signal<number> = this.countSignal.asReadonly();
  // countSignalReadOnly: Signal<number> = signal(0).asImmutable();
  // readonly count = this.countSignal.asImmutable()

  derivedSignal = computed(() => this.countSignal() * 2);

  increment() {
    this.countSignal.update((value) => value + 1);
  }

  decrement() {
    this.countSignal.update((value) => value - 1);
  }
}
