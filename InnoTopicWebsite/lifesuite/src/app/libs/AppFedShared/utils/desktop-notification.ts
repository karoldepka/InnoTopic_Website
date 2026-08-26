/** Fire-and-forget Web Notification - requests permission on first use if not yet decided, and
 * silently no-ops if the browser lacks support or the user has denied it. Deliberately not routed
 * through BrowserNotificationsService/PlatformNotificationsService (AppFedSharedIonic) - that
 * abstraction is for scheduling a reminder for a future time via SchedulerService, whereas this is
 * for telling the user right now that an already-running task has just finished. */
export async function showDesktopNotification(title: string, options?: NotificationOptions): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return
  }
  if (Notification.permission === 'denied') {
    return
  }
  if (Notification.permission !== 'granted') {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return
    }
  }
  new Notification(title, options)
}

/** Call from a user gesture before a long-running task, when browsers allow permission prompts. */
export function requestDesktopNotificationPermission(): void {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'default') {
    return
  }
  void Notification.requestPermission()
}
