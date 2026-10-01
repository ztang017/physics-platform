import { FeedbackForm } from '../components/feedback/FeedbackForm';
import { PageHeader } from '../components/layout/PageHeader';
import { usePageTitle } from '../components/layout/usePageTitle';
import styles from './Contact.module.css';

const REASONS = [
  { icon: '🐛', title: 'Report a bug', text: 'Something broken, confusing or not working on your device? Tell me what you saw.' },
  { icon: '💡', title: 'Suggest an idea', text: 'A topic you want covered, or a feature that would help you study.' },
  { icon: '✏️', title: 'Flag a mistake', text: 'A quiz question or explanation that looks wrong or unclear.' },
  { icon: '👋', title: 'Just say hello', text: "It's always good to hear that PhysicsLab helped, or how it could help more." },
];

export function Contact() {
  usePageTitle('Contact us');

  return (
    <>
      <PageHeader
        eyebrow="Get in touch"
        title="Contact us"
        lead="Found a bug, have an idea, or just want to say hello? Your feedback shapes what gets built next, and every message goes straight to the creator."
      />

      <div className={styles.container}>
        <div className={styles.layout}>
          <aside className={styles.reasons} aria-label="What to write about">
            <h2 className={styles.reasonsTitle}>What can you send?</h2>
            <ul className={styles.reasonList}>
              {REASONS.map((reason) => (
                <li key={reason.title} className={styles.reason}>
                  <span className={styles.reasonIcon} aria-hidden="true">{reason.icon}</span>
                  <div>
                    <h3>{reason.title}</h3>
                    <p>{reason.text}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className={styles.note}>Leave your email in the form if you would like a reply. It's optional.</p>
          </aside>

          <FeedbackForm />
        </div>
      </div>
    </>
  );
}
