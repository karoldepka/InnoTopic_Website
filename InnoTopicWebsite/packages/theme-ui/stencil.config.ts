import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'theme-ui',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements' },
    { type: 'docs-readme' },
    // Generates Angular wrapper components (typed @Input/@Output, no CUSTOM_ELEMENTS_SCHEMA
    // needed) into the sibling theme-ui-angular package - see that package's own
    // src/directives/index.ts for what actually gets exported/consumed.
    angularOutputTarget({
      componentCorePackage: '@innotopic/theme-ui',
      outputType: 'standalone',
      directivesProxyFile: '../theme-ui-angular/src/directives/proxies.ts',
      directivesArrayFile: '../theme-ui-angular/src/directives/index.ts',
    }),
  ],
  // Without this, Stencil's Rollup step inlines a *second* copy of @innotopic/topics-ui into
  // theme-configurator's own lazy-loaded chunk (it imports topics-ui for the live preview) -
  // that second copy's Lit @customElement decorators re-run customElements.define() for tags
  // (e.g. topic-chip) the app's own topics-ui import already registered, which throws
  // (NotSupportedError: the name has already been used) and breaks theme-configurator's own
  // registration along with it. Marking it external makes both consumers resolve to the one
  // real module instance instead.
  rollupConfig: {
    inputOptions: {
      external: ['@innotopic/topics-ui'],
    },
  },
};
