import { useEffect } from 'react';

const SITE_NAME = 'PhysicsLab';

/** Sets the browser tab title for the page ("Courses | PhysicsLab"), so tabs
 *  and history entries are distinguishable. Pass nothing for the bare site title. */
export function usePageTitle(page?: string) {
  useEffect(() => {
    document.title = page ? `${page} | ${SITE_NAME}` : `${SITE_NAME} | Interactive Learning`;
  }, [page]);
}
