import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeatureFlagsService } from '../feature-flags/feature-flags.service';

@Component({
  selector: 'app-feature-flags-popover',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-flags-popover.component.html',
  styleUrls: ['./feature-flags-popover.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureFlagsPopoverComponent {

  protected readonly flagsService = inject(FeatureFlagsService);
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly open = signal(false);

  toggleOpen() {
    this.open.update(isOpen => !isOpen);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.open() && !this.elementRef.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.open.set(false);
  }
}
