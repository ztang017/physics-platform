import { useState } from 'react';
import styles from './FeedbackForm.module.css';

const CREATOR_EMAIL = 'tangzongnan17@gmail.com';

/** A no-backend feedback box: it never transmits anything itself — it just
 *  builds a pre-filled mailto: link and hands it to the visitor's own mail
 *  app, which they review and send themselves. That keeps a static site
 *  honest about not silently collecting form submissions anywhere. */
export function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [opened, setOpened] = useState(false);

  const canSend = message.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    const subject = 'PhysicsLab Feedback';
    const bodyLines = [
      message.trim(),
      '',
      email.trim() ? `Reply to: ${email.trim()}` : '(No reply email given)',
    ];
    const mailto = `mailto:${CREATOR_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailto;
    setOpened(true);
  };

  return (
    <div className={`card ${styles.card}`}>
      <h3 className={styles.title}>💌 Send Feedback</h3>
      <p className={styles.subtitle}>
        Found a bug, have an idea, or just want to say something? This opens a pre-filled email in your own mail app addressed to the creator — nothing is sent from here directly.
      </p>

      <label className={styles.label} htmlFor="feedback-message">Your feedback</label>
      <textarea
        id="feedback-message"
        className={styles.textarea}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What's on your mind?"
        rows={4}
      />

      <label className={styles.label} htmlFor="feedback-email">Your email (optional, so I can reply)</label>
      <input
        id="feedback-email"
        className={styles.input}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />

      <button className="btn btn--primary" onClick={handleSend} disabled={!canSend}>
        ✉️ Open Email to Send
      </button>

      {opened && (
        <p className={styles.confirmation} role="status">
          Your email app should now be open with this feedback pre-filled — just hit send there.
        </p>
      )}
    </div>
  );
}
