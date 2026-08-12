import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import type { StrokeSnapshot } from '@innotopic/doodle-ui';
// @innotopic/doodle-ui's <doodle-canvas> is Stencil dist-custom-elements output, which - unlike
// Lit's auto-registering @customElement - never self-defines on import; defineCustomElements()
// is Stencil's own registration step (same pattern app.module.ts uses for @innotopic/theme-ui).
import { defineCustomElements } from '@innotopic/doodle-ui/loader';

defineCustomElements(window);

// Narrow local type for the one @Method() this page calls - avoids depending on how
// @innotopic/doodle-ui's ambient HTMLDoodleCanvasElement global gets resolved into this app's
// own tsconfig.
interface DoodleCanvasElement extends HTMLElement {
  exportPng(opts?: { includeBackground?: boolean }): Promise<string>;
}

/**
 * A dedicated demo page for @innotopic/doodle-ui's <doodle-canvas>, used directly (no Angular
 * wrapper), matching the pattern set by the topics-ui/theme-ui/plasma-ui demo pages.
 */
@Component({
  selector: 'app-doodle-demo',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './doodle-demo.component.html',
  styleUrls: ['./doodle-demo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DoodleDemoComponent {
  svgSrc = '/assets/images/logos/stenciljs.svg';
  bitmapSrc = '/assets/books/zero-to-one.jpg';

  exportedDataUrl: string | null = null;
  lastSnapshot: StrokeSnapshot | null = null;

  onDoodleChange(ev: CustomEvent<StrokeSnapshot>) {
    this.lastSnapshot = ev.detail;
  }

  async onExport(canvas: DoodleCanvasElement) {
    this.exportedDataUrl = await canvas.exportPng();
  }
}
