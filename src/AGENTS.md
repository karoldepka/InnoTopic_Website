Project constitution

This is an offline-first (but sync-enabled), mobile-first (but cross-platform).
User data is precious so we save it as quickly as reasonably possible (throttleTime).

The target group is self-improvement-conscious consumers with some power-users. We initially don't show power-user specific UI elements - we hide them under an appropriate expand action or dot dot dot / hamburger menu.

The app has to work really well on mobile, so we need to conserve horizontal space (e.g. not overload top toolbar with icons).


App should work properly even if not logged in (in guest mode or offline and cannot log in) - later an option to create account (bringing the guest data and the offline-edits with yourself).

We respect user focus and we display as little info and buttons & icons as possible (hiding more stuff under expandable).

Destructive or disturbing changes should require confirmation and should have undo in toast. E.g. delete.
Actions that are easy to undo manually (e.g. adding an object), should not have undo.


We want features that Firestore offers, but I found Firestore to be expensive and buggy. E.g. "Failed to obtain primary lease for action 'Release target'" - errors without explanation of what that entails or is there gonna be recovery/retry/respite.

We don't silently ignore errors. But if there are multiple instances of same error - we don't spam the user but report the error asynchronously, e.g. via toast, not errorAlert. Or first errorAlert, then just error log.

We want the IndexedDb to such a level of fidelity, to be able to recover from it in case server fails, even if server database is lost/corrupted (don't implement that yet, but keep as a possibility).

=== Future / considerations

Maybe we build on AFFiNE.
Consider CRDT.

Default sort is on whenLastTouchedByUser - that implies user has permission. New user will need new index?