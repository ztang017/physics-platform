import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  lead?: string;
  /** Extra content under the lead, e.g. a progress summary. */
  children?: ReactNode;
}

/** The intro block at the top of every subpage, so Courses and Contact us share one look. */
export function PageHeader({ eyebrow, title, lead, children }: PageHeaderProps) {
  return (
    <section className={styles.header}>
      <div className={styles.inner}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
        {children}
      </div>
    </section>
  );
}
