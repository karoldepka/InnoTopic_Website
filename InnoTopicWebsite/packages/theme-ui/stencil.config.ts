import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'theme-ui',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements' },
    { type: 'docs-readme' },
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
