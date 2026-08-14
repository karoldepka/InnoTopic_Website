import { Component, OnInit, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
// @innotopic/doodle-ui's <doodle-canvas> is Stencil dist-custom-elements output, which - unlike
// Angular components - never self-registers on import; defineCustomElements() is Stencil's own
// registration step (same pattern this app's app.module.ts uses for @innotopic/theme-ui). Safe to
// call more than once (Stencil no-ops if the tag is already defined), so every direct consumer of
// <doodle-canvas> - just this component, now that it's the sole place life-overviews reaches for
// the raw element - owns calling it rather than relying on some other file having done so first.
import { defineCustomElements } from '@innotopic/doodle-ui/loader';

defineCustomElements(window);

/**
 * Wraps any projected content (a diagram, in practice) with a transparent <doodle-canvas> layered
 * on top, sized to match via absolute positioning - lets a user freehand-annotate directly over an
 * existing SVG diagram without that diagram needing to be exported to a static image file first
 * (doodle-canvas's own `imageSrc` background prop only accepts a URL, not inline SVG markup, so an
 * overlay - rather than handing the diagram to doodle-canvas as its background - is what lets this
 * work against the life-overviews diagrams' existing inline-SVG Angular templates as-is).
 *
 * The overlay captures pointer events for drawing (that's the point), so it also intercepts clicks
 * on anything interactive inside the projected content while doodling is active - e.g.
 * growth-diagram's own tap-to-alert regions.
 */
@Component({
    selector: 'app-doodle-overlay',
    templateUrl: './doodle-overlay.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrls: ['./doodle-overlay.component.sass'],
    // <doodle-canvas> is a plain custom element, not an Angular component - Angular's template
    // compiler needs this schema to accept an unknown tag without erroring.
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DoodleOverlayComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
