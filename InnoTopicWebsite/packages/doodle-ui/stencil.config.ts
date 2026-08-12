import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'doodle-ui',
  outputTargets: [
    { type: 'dist', esmLoaderPath: '../loader' },
    { type: 'dist-custom-elements' },
    { type: 'docs-readme' },
  ],
};
