/** How often a long-lived tab asks the server whether a new version exists.
 *  (Tabs also check whenever they become visible again, and when the
 *  connection returns.) */
export const UPDATE_CHECK_INTERVAL_MS = 10 * 60 * 1000;

// Pages where a surprise reload would throw away work in progress: a module
// holds the student's current prediction and quiz answers, and the Contact
// page may hold a half-written message.
const BUSY_ROUTES = [/^\/module\//, /^\/contact\/?$/];

/** Is it fine to reload the page right now to pick up a new version? */
export function isSafeToRefresh(pathname: string): boolean {
  return !BUSY_ROUTES.some((route) => route.test(pathname));
}
