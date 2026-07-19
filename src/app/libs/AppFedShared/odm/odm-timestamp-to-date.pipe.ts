import {Pipe, PipeTransform} from '@angular/core'
import {odmTimestampToDate} from './utils'

/** `whenCreated`/`whenLastModified`-style fields can arrive as a live Firestore `Timestamp`
 * (`.toDate()`), a plain `Date`, an ISO string, or a plain `{seconds, nanoseconds}` object (e.g.
 * after an IndexedDB structured-clone round-trip, which drops a class instance's prototype/
 * methods) - calling `.toDate()` directly in a template throws for every shape but the first.
 * Use `value | odmDate` instead of `value?.toDate()` wherever a template displays one of these
 * fields. */
@Pipe({
  name: 'odmDate',
  standalone: true,
})
export class OdmTimestampToDatePipe implements PipeTransform {
  transform(value: any): Date | null {
    return odmTimestampToDate(value)
  }
}
