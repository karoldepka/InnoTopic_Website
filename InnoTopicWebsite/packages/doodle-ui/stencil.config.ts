import { Config } from '@stencil/core';
import { angularOutputTarget } from '@stencil/angular-output-target';

export const config: Config = {
  namespace: 'doodle-ui',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements' },
    { type: 'docs-readme' },
    // Generates Angular wrapper components (typed @Input/@Output, no CUSTOM_ELEMENTS_SCHEMA
    // needed) into the sibling doodle-ui-angular package - mirrors theme-ui/stencil.config.ts.
    angularOutputTarget({
      componentCorePackage: '@innotopic/doodle-ui',
      outputType: 'standalone',
      directivesProxyFile: '../doodle-ui-angular/src/directives/proxies.ts',
      directivesArrayFile: '../doodle-ui-angular/src/directives/index.ts',
    }),
  ],
};
