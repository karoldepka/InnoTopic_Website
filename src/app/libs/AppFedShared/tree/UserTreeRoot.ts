/** Deterministic, per-user root id (GH #89) - same "well-known id, lazily backed, doesn't
 * require a pre-existing row" spirit as `OdmService2.treeRootItemId` (`'_root_' + className`),
 * just scoped per-user instead of per-collection. Top-level bare slots that used to be anchored
 * wherever the user happened to invoke "add from template" (day-plan templates, etc.) attach here
 * instead - one canonical anchor per user, regardless of which page created it first. */
export function getUserTreeRootId(userId: string): string {
  return `tree_root_for_user_${userId}`
}
