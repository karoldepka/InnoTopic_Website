import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild } from '@angular/core';

let nextId = 0;

/**
 * A header with an indented body beside a vertical line, as in the CV's work history and skills:
 * - the knob (a chevron) left of the header, where the line starts, collapses and expands the
 *   body, animated;
 * - the line itself leads back to the header (it scrolls the header into view).
 * Put the header element in with the `section-header` attribute and the body as the other content:
 *
 *   <app-indented-section label="Rithum">
 *     <h2 section-header>Rithum</h2>
 *     ...body...
 *   </app-indented-section>
 */
@Component({
  selector: 'app-indented-section',
  standalone: true,
  template: `
    <div class="head">
      <button
        type="button"
        class="knob"
        [attr.aria-expanded]="!collapsed()"
        [attr.aria-controls]="bodyId"
        [attr.aria-label]="(collapsed() ? 'Expand ' : 'Collapse ') + label()"
        [title]="collapsed() ? 'Expand' : 'Collapse'"
        (click)="collapsed.set(!collapsed())"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6l4 4 4-4" /></svg>
      </button>
      <div class="header" #header tabindex="-1"><ng-content select="[section-header]" /></div>
    </div>
    <div class="collapse" [class.collapse--collapsed]="collapsed()">
      <div class="collapse-inner" [id]="bodyId" [attr.inert]="collapsed() ? '' : null">
        <div class="body">
          <button
            type="button"
            class="rail"
            [attr.aria-label]="'Back to ' + label()"
            [title]="'Back to ' + label()"
            (click)="scrollToHeader()"
          ></button>
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styleUrl: './indented-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndentedSectionComponent {
  /** Names the section for the knob's and the line's labels ("Collapse Rithum", "Back to Rithum"). */
  readonly label = input.required<string>();
  protected readonly collapsed = signal(false);
  protected readonly bodyId = `indented-section-${nextId++}`;
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');

  protected scrollToHeader() {
    const header = this.header().nativeElement;
    const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    header.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
    header.focus({ preventScroll: true });
  }
}
