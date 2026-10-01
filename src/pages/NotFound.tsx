import { Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { usePageTitle } from '../components/layout/usePageTitle';
import styles from './NotFound.module.css';

export function NotFound() {
  usePageTitle('Page not found');

  return (
    <PageHeader
      eyebrow="Error 404"
      title="Page not found"
      lead="That page doesn't exist. Head back to the homepage, or pick up where you left off in Courses."
    >
      <div className={styles.actions}>
        <Link to="/" className="btn btn--secondary">Go to the homepage</Link>
        <Link to="/courses" className="btn btn--primary">Browse Courses <span aria-hidden="true">→</span></Link>
      </div>
    </PageHeader>
  );
}
