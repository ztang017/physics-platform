import { create } from 'zustand';
import { registerSW } from 'virtual:pwa-register';
import { UPDATE_CHECK_INTERVAL_MS } from './updatePolicy';

/** True once a newer version of the site has been downloaded and is waiting to take over. */
export const useUpdateStore = create<{ updateReady: boolean }>(() => ({ updateReady: false }));

let applyUpdate: ((reloadPage?: boolean) => Promise<void>) | null = null;
let started = false;

/**
 * Registers the service worker and keeps looking for new versions.
 *
 * A new version downloads in the background and then WAITS: it only takes over
 * (and the page reloads) when `applyUpdateNow` is called, so the app, not the
 * browser, decides when it is safe to interrupt the student. Without this a
 * deployed update only appears after the student happens to reload by hand,
 * because the page that is already open keeps running the old code.
 */
export function initUpdates() {
  if (started) return;
  started = true;

  applyUpdate = registerSW({
    immediate: true,
    onNeedRefresh() {
      useUpdateStore.setState({ updateReady: true });
    },
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      // Browsers only look for a new service worker when a page loads, so a tab
      // left open for hours would never find out. Ask periodically, whenever
      // the student comes back to the tab, and when the connection returns.
      const check = () => {
        if (navigator.onLine) registration.update().catch(() => { /* offline or server hiccup: try again next time */ });
      };
      window.setInterval(check, UPDATE_CHECK_INTERVAL_MS);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      window.addEventListener('online', check);
    },
  });
}

let applying = false;

/** Switch to the waiting version and reload the page.
 *
 *  The reload is done here rather than by registerSW's built-in `reloadPage`
 *  option, because that one only reloads for updates the library regards as its
 *  own. A version found by a later periodic check (more than a minute after the
 *  page loaded) counts as "external", gets activated, and then leaves the open
 *  page silently running old code. */
export function applyUpdateNow() {
  if (applying || !applyUpdate) return;
  applying = true;
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true });
  void applyUpdate(false);
  // If nothing took over (e.g. the waiting worker vanished), allow another try.
  window.setTimeout(() => { applying = false; }, 5000);
}
