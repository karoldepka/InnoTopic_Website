/* tslint:disable */
/* auto-generated angular directive proxies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Output, NgZone } from '@angular/core';

import { ProxyCmp } from './angular-component-lib/utils';

import type { Components } from '@innotopic/doodle-ui/components';

import { defineCustomElement as defineDoodleCanvas } from '@innotopic/doodle-ui/components/doodle-canvas.js';
@ProxyCmp({
  defineCustomElementFn: defineDoodleCanvas,
  inputs: ['colors', 'crossOrigin', 'disabled', 'fit', 'fontSize', 'imageAlt', 'imageSrc', 'maxFontSize', 'maxStrokeWidth', 'minFontSize', 'minStrokeWidth', 'showToolbar', 'strokeColor', 'strokeWidth'],
  methods: ['clear', 'undo', 'redo', 'getSnapshot', 'exportSvg', 'exportPng']
})
@Component({
  selector: 'doodle-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['colors', 'crossOrigin', 'disabled', 'fit', 'fontSize', 'imageAlt', 'imageSrc', 'maxFontSize', 'maxStrokeWidth', 'minFontSize', 'minStrokeWidth', 'showToolbar', 'strokeColor', 'strokeWidth'],
  outputs: ['doodleChange'],
})
export class DoodleCanvas {
  protected el: HTMLDoodleCanvasElement;
  @Output() doodleChange = new EventEmitter<DoodleCanvasCustomEvent<IDoodleCanvasStrokeSnapshot>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}


import type { DoodleCanvasCustomEvent } from '@innotopic/doodle-ui/components';
import type { StrokeSnapshot as IDoodleCanvasStrokeSnapshot } from '@innotopic/doodle-ui/components';

export declare interface DoodleCanvas extends Components.DoodleCanvas {
  /**
   * Fires after any mutation (stroke or text committed, clear, undo, redo, text moved) so a
host can drive its own save/undo button state without polling getSnapshot().
   */
  doodleChange: EventEmitter<DoodleCanvasCustomEvent<IDoodleCanvasStrokeSnapshot>>;
}


