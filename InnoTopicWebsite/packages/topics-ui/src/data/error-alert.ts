/**
 * Lifted out of the Angular app's utils.ts (which also pulls in @angular/forms for an
 * unrelated export) so this package has zero Angular dependency. Drops the original's
 * window.alert() - a blocking native alert is bad UX for a widget embedded in someone
 * else's page; console.error is enough for a data-lookup-failed warning.
 */
export function errorAlert(...args: any) {
  console.error('ERROR: errorAlert: ', ...args)
}
