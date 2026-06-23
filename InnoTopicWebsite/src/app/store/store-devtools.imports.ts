import { StoreDevtoolsModule } from '@ngrx/store-devtools';

export const STORE_DEVTOOLS_IMPORTS = [
  StoreDevtoolsModule.instrument({ maxAge: 25, connectInZone: true }),
];
