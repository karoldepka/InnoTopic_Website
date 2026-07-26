import {ToastController, ToastOptions} from '@ionic/angular'

/** Every toast in the app should be dismissable both by swiping it away and by tapping it, not
 * just by waiting out its `duration` or hunting for a specific button (most callers don't have
 * one) - centralized here instead of repeating `swipeGesture` + a click-to-dismiss listener at
 * every toastController.create() call site across the app. A tap on an actual button inside the
 * toast (e.g. "Open") still runs that button's own handler as normal - Ionic already dismisses on
 * button click, so this listener just no-ops a second, harmless dismiss() in that case. */
export async function presentDismissableToast(toastController: ToastController, options: ToastOptions): Promise<HTMLIonToastElement> {
  const toast = await toastController.create({
    swipeGesture: 'vertical',
    ...options,
  })
  toast.addEventListener('click', () => toast.dismiss())
  await toast.present()
  return toast
}
