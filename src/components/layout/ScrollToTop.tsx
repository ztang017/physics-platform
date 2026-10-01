import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** The router keeps the old scroll position when the page changes, so a link
 *  clicked in the footer of a long page would land halfway down the next one.
 *  Jump to the top on every route change instead. */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
