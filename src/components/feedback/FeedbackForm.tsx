import { useState } from 'react';
import styles from './FeedbackForm.module.css';

const CREATOR_EMAIL = 'tangzongnan17@gmail.com';
const FEEDBACK_API = 'https://physicslab-feedback.ztang017.workers.dev/api/feedback';

type SendState = 'idle' | 'sending' | 'sent' | 'error';

function buildMailto(message: string, email: string): string {
  const bodyLines = [
    message,
    '',
    email ? `Reply to: ${email}` : '(No reply email given)',
  ];
  return `mailto:${CREATOR_EMAIL}?subject=${encodeURIComponent('PhysicsLab Feedback')}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
}

/** Feedback is POSTed to a small Cloudflare Worker + D1 database, so
 *  submissions are actually collected and viewable by the creator (at
 *  /admin on the Worker), instead of only opening a local mail draft.
 *  If the request fails for any reason, we fall back to the mailto: link
 *  so a visitor's feedback is never silently lost. */
export function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [hp, setHp] = useState(''); // honeypot — real visitors never touch this
  const [state, setState] = useState<SendState>('idle');

  const canSend = message.trim().length > 0 && state !== 'sending';

  const handleSend = async () => {
    const trimmedMessage = message.trim();
    const trimmedEmail = email.trim();
    if (!trimmedMessage) return;

    setState('sending');
    try {
      const res = await fetch(FEEDBACK_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedMessage, email: trimmedEmail, hp }),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setState('sent');
      setMessage('');
      setEmail('');
    } catch {
      setState('error');
    }
  };

  const handleMailtoFallback = () => {
    window.location.href = buildMailto(message.trim(), email.trim());
  };

  return (
    <div className={`card ${styles.card}`}>
      <h3 className={styles.title}>💌 Send Feedback</h3>
      <p className={styles.subtitle}>
        Found a bug, have an idea, or just want to say something? This goes straight to the creator.
      </p>

      <label className={styles.label} htmlFor="feedback-message">Your feedback</label>
      <textarea
        id="feedback-message"
        className={styles.textarea}
        value={message}
        onChange={(e) => { setMessage(e.target.value); if (state !== 'sending') setState('idle'); }}
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

      {/* Honeypot: hidden from real visitors via CSS, but a form-filling bot
          will happily populate it, letting the backend quietly drop the spam. */}
      <input
        className={styles.honeypot}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
      />

      <button className="btn btn--primary" onClick={handleSend} disabled={!canSend}>
        {state === 'sending' ? 'Sending…' : '✉️ Send Feedback'}
      </button>

      {state === 'sent' && (
        <p className={styles.confirmation} role="status">
          Thanks! Your feedback has been received.
        </p>
      )}

      {state === 'error' && (
        <div className={styles.errorBox} role="alert">
          <p>Couldn't reach the server just now.</p>
          <button className="btn btn--secondary" onClick={handleMailtoFallback} disabled={!message.trim()}>
            ✉️ Email it directly instead
          </button>
        </div>
      )}
    </div>
  );
}
