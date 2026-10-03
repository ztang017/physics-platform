import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type BankedParams,
  type BankStatus,
  type BucketParams,
  type BucketSample,
  G,
  SPEED_TOLERANCE,
  bankAngleFromDesignSpeed,
  bankedBand,
  bankedForcesAt,
  bankedSlideAcceleration,
  bucketAt,
  bucketOutcome,
  bucketSampleAt,
  generateBucketTimeline,
  gradeSpeedGuess,
  minLoopBottomSpeed,
  slackAngleDeg,
} from '../../core/physics/circular';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import styles from './CircularGames.module.css';

const W = 600;

const COLOR = {
  road: '#64748b',
  ground: '#e2e5ee',
  car: '#2563eb',
  carBad: '#dc2626',
  weight: '#7c3aed',
  normal: '#15803d',
  friction: '#dc2626',
  rope: '#475569',
  text: 'rgba(23,27,38,0.7)',
};

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, color: string, label: string, labelDx = 0, labelDy = 0) {
  const len = Math.hypot(dx, dy);
  if (len < 3) return;
  const ux = dx / len, uy = dy / len;
  const tx = x + dx, ty = y + dy;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(tx, ty); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(tx - ux * 9 - uy * 5, ty - uy * 9 + ux * 5);
  ctx.lineTo(tx - ux * 9 + uy * 5, ty - uy * 9 - ux * 5);
  ctx.closePath(); ctx.fill();
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeText(label, tx + labelDx, ty + labelDy);
  ctx.fillText(label, tx + labelDx, ty + labelDy);
}

function useCanvasDraw(height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [redrawTick, setRedrawTick] = useState(0);
  const paint = useCallback(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) draw(ctx);
  }, [draw]);
  // The hook wipes the canvas whenever layout changes its size, so it repaints via onResize.
  useHiDPICanvas(ref, W, height, () => setRedrawTick((n) => n + 1));
  useEffect(() => { paint(); }, [paint, redrawTick]);
  return ref;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** A running clock in seconds. It restarts from zero whenever `resetKey` changes, and stops while paused. */
function useClock(playing: boolean, resetKey: string, rate = 1) {
  const [state, setState] = useState({ key: resetKey, t: 0 });
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last === null) last = now;
      const dt = ((now - last) / 1000) * rate;
      last = now;
      setState((prev) => (prev.key === resetKey ? { key: resetKey, t: prev.t + dt } : { key: resetKey, t: dt }));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, resetKey, rate]);
  return {
    time: state.key === resetKey ? state.t : 0,
    restart: () => setState({ key: resetKey, t: 0 }),
  };
}

function PlayControls({ playing, onToggle, onReplay, slow, onSlow }: {
  playing: boolean;
  onToggle: () => void;
  onReplay?: () => void;
  slow?: boolean;
  onSlow?: () => void;
}) {
  return (
    <div className={styles.controls}>
      <button className="btn btn--secondary" onClick={onToggle}>{playing ? '⏸ Pause' : '▶ Play'}</button>
      {onReplay && <button className="btn btn--secondary" onClick={onReplay}>↺ Replay</button>}
      {onSlow && <button className="btn btn--secondary" onClick={onSlow} aria-pressed={slow}>🐢 Slow motion {slow ? 'on' : 'off'}</button>}
    </div>
  );
}

// ═══ Banked curve: the Safe Speed Band ═══════════════════════════════════════
const BANK_H = 250;
/** Real laps are very slow (a 50 m bend at 11 m/s takes 28 s), so the picture runs faster than real time. */
const LAP_SPEEDUP = 3;

const STATUS_TEXT: Record<BankStatus, string> = {
  'slides-down': 'Too slow: the car slides down toward the inside',
  holds: 'Safe: the car holds its line',
  'slides-up': 'Too fast: the car slides up and out',
};

function drawBank(ctx: CanvasRenderingContext2D, params: BankedParams, speed: number, time: number) {
  const status = bankedForcesAt(params, speed).status;
  const slideAccel = bankedSlideAcceleration(params, speed);
  const sliding = status !== 'holds';
  ctx.clearRect(0, 0, W, BANK_H);

  // ── Left: the car seen from above, going round the bend ──
  const tcx = 140, tcy = 135;
  ctx.fillStyle = '#d9dde8';
  ctx.beginPath(); ctx.arc(tcx, tcy, 105, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath(); ctx.arc(tcx, tcy, 55, 0, Math.PI * 2); ctx.fill();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(tcx, tcy, 80, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  const omega = (speed / params.radius) * LAP_SPEEDUP;
  const angle = time * omega;
  const phase = (time % 3) / 3;
  const drift = status === 'slides-down' ? -phase * 28 : status === 'slides-up' ? phase * 24 : 0;
  const rho = 80 + drift;
  const cx = tcx + rho * Math.cos(angle);
  const cy = tcy - rho * Math.sin(angle);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-angle - Math.PI / 2);
  ctx.fillStyle = sliding ? COLOR.carBad : COLOR.car;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(-8, -14, 16, 28, 4); ctx.fill(); ctx.stroke();
  ctx.restore();

  ctx.fillStyle = COLOR.text;
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('from above', tcx, 14);
  ctx.beginPath(); ctx.arc(tcx, tcy, 3, 0, Math.PI * 2); ctx.fill();

  // ── Right: a slice through the road, with the forces on the car ──
  const theta = (params.angleDeg * Math.PI) / 180;
  const forces = bankedForcesAt(params, speed);
  const ox = 450, oy = 165;
  const d = { x: Math.cos(theta), y: -Math.sin(theta) };   // up the slope (canvas y points down)
  const n = { x: -Math.sin(theta), y: -Math.cos(theta) };  // normal to the road, toward the centre side
  const p1 = { x: ox - d.x * 160, y: oy - d.y * 160 };
  const p2 = { x: ox + d.x * 160, y: oy + d.y * 160 };
  ctx.fillStyle = COLOR.ground;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p2.x, BANK_H); ctx.lineTo(p1.x, BANK_H);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = COLOR.road;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

  // The car slides along the slope when friction cannot hold it, then starts again
  const slideDir = slideAccel < 0 ? -1 : slideAccel > 0 ? 1 : 0;
  const along = slideDir * Math.min(70, (time % 2.4) ** 2 * 14);
  const carX = ox + d.x * along;
  const carY = oy + d.y * along;
  ctx.save();
  ctx.translate(carX, carY);
  ctx.rotate(-theta);
  ctx.fillStyle = sliding ? 'rgba(220,38,38,0.16)' : 'rgba(37,99,235,0.16)';
  ctx.strokeStyle = sliding ? COLOR.carBad : COLOR.car;
  ctx.lineWidth = 2;
  ctx.fillRect(-30, -26, 60, 26);
  ctx.strokeRect(-30, -26, 60, 26);
  ctx.fillStyle = sliding ? COLOR.carBad : COLOR.car;
  ctx.beginPath(); ctx.arc(-16, 0, 5, 0, Math.PI * 2); ctx.arc(16, 0, 5, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  const pc = { x: carX + n.x * 13, y: carY + n.y * 13 };
  const s = 3.4;
  arrow(ctx, pc.x, pc.y, 0, G * s, COLOR.weight, 'mg', 0, 15);
  arrow(ctx, pc.x, pc.y, n.x * forces.normal * s, n.y * forces.normal * s, COLOR.normal, 'N', n.x * 10 - 6, n.y * 10 - 4);
  if (Math.abs(forces.friction) > 0.02) {
    arrow(ctx, pc.x, pc.y, d.x * forces.friction * s, d.y * forces.friction * s, COLOR.friction, 'friction',
      d.x * 26, d.y * 16 + (forces.friction > 0 ? -6 : 14));
  }

  ctx.fillStyle = COLOR.text;
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('side view', 450, 14);
  ctx.textAlign = 'left';
  ctx.fillText('← centre', 304, 36);
}

function BankCanvas({ params, speed, time }: { params: BankedParams; speed: number; time: number }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => drawBank(ctx, params, speed, time), [params, speed, time]);
  const ref = useCanvasDraw(BANK_H, draw);
  return (
    <canvas
      ref={ref}
      className={styles.canvas}
      aria-label="A car going round a banked bend, seen from above and from the side, with the forces on the car"
      role="img"
    />
  );
}

interface BankRound {
  id: string;
  label: string;
  radius: number;
  mu: number;
  /** Either the banking angle is given, or only the speed the road is designed for. */
  angleDeg?: number;
  designSpeed?: number;
  ask: 'design' | 'band';
  goal: string;
}

const BANK_ROUNDS: BankRound[] = [
  { id: 'ice', label: 'Round 1: Ice', radius: 50, mu: 0, angleDeg: 15, ask: 'design', goal: 'Ice, no friction at all. Find the one speed that holds the bend.' },
  { id: 'wet', label: 'Round 2: Grip', radius: 50, mu: 0.15, angleDeg: 15, ask: 'band', goal: 'Now the tyres grip a little. Find the slowest and fastest safe speeds.' },
  { id: 'design', label: 'Round 3: Design speed', radius: 40, mu: 0.2, designSpeed: 12, ask: 'band', goal: 'The road is designed for 12 m/s on ice. Work out the angle first, then the safe band.' },
];

function roundParams(round: BankRound): BankedParams {
  const angleDeg = round.angleDeg ?? bankAngleFromDesignSpeed(round.designSpeed!, round.radius);
  return { radius: round.radius, angleDeg, mu: round.mu };
}

type BankAnswer = { low: number | null; high: number | null };
const EMPTY_ANSWER: BankAnswer = { low: null, high: null };

export function BankedCurveGame({
  attempts,
  cleared,
  onLock,
  active = true,
}: {
  attempts: number[];
  cleared: boolean[];
  onLock: (round: number, correct: boolean) => void;
  /** False while the tab is hidden, so the animation stops running in the background. */
  active?: boolean;
}) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [testSpeed, setTestSpeed] = useState(8);
  const [answers, setAnswers] = useState<BankAnswer[]>(() => BANK_ROUNDS.map(() => EMPTY_ANSWER));
  const [feedback, setFeedback] = useState<(string[] | null)[]>(() => BANK_ROUNDS.map(() => null));
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const { time } = useClock(playing && active, 'bank');

  const round = BANK_ROUNDS[roundIdx];
  const params = useMemo(() => roundParams(round), [round]);
  const band = useMemo(() => bankedBand(params), [params]);
  const forces = bankedForcesAt(params, testSpeed);
  const answer = answers[roundIdx];
  const ready = round.ask === 'design' ? answer.low !== null : answer.low !== null && answer.high !== null;
  const missed = (feedback[roundIdx] ?? []).some((line) => line.startsWith('✗'));

  const setAnswer = (patch: Partial<BankAnswer>) =>
    setAnswers((prev) => prev.map((a, i) => (i === roundIdx ? { ...a, ...patch } : a)));

  const lock = () => {
    const checks =
      round.ask === 'design'
        ? [{ name: 'design speed', guess: answer.low!, actual: band.designSpeed }]
        : [
            { name: 'slowest safe speed', guess: answer.low!, actual: band.vMin },
            { name: 'fastest safe speed', guess: answer.high!, actual: band.vMax },
          ];
    const lines = checks.map(({ name, guess, actual }) => {
      const grade = gradeSpeedGuess(guess, actual);
      if (grade.isCorrect) return `✓ Your ${name} (${guess.toFixed(1)} m/s) is right.`;
      return `✗ Your ${name} (${guess.toFixed(1)} m/s) is ${Math.abs(grade.errorPercent).toFixed(0)}% too ${grade.errorPercent > 0 ? 'high' : 'low'}.`;
    });
    setFeedback((prev) => prev.map((f, i) => (i === roundIdx ? lines : f)));
    onLock(roundIdx, lines.every((l) => l.startsWith('✓')));
  };

  const status = forces.status;

  return (
    <div className={styles.gameCard}>
      <div className={styles.roundTabs} role="tablist" aria-label="Choose a round">
        {BANK_ROUNDS.map((r, i) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={roundIdx === i}
            className={`${styles.roundTab} ${roundIdx === i ? styles.roundTabActive : ''}`}
            onClick={() => setRoundIdx(i)}
          >
            {r.label} {cleared[i] ? '✅' : ''}
          </button>
        ))}
      </div>

      <p className={styles.goal}>{round.goal}</p>
      <p className={styles.givens}>
        R = {round.radius} m · μₛ = {round.mu.toFixed(2)} ·{' '}
        {round.angleDeg !== undefined ? `θ = ${round.angleDeg}°` : `v₀ = ${round.designSpeed} m/s`}
      </p>

      <BankCanvas params={params} speed={testSpeed} time={time} />
      <div className={styles.speedRow}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="bank-test-speed">
            Test-drive speed <span className="value">{testSpeed.toFixed(1)} m/s ({(testSpeed * 3.6).toFixed(0)} km/h)</span>
          </label>
          <input id="bank-test-speed" type="range" min="0" max="25" step="0.1" value={testSpeed}
            onChange={(e) => setTestSpeed(+e.target.value)} />
        </div>
        <button className="btn btn--secondary" onClick={() => setPlaying((p) => !p)}>{playing ? '⏸' : '▶'}<span className="sr-only">{playing ? 'Pause' : 'Play'}</span></button>
      </div>
      <p className={status === 'holds' ? styles.verdictGood : styles.verdictBad} role="status">{STATUS_TEXT[status]}</p>

      <div className={styles.answerBlock}>
        <p className={styles.questionText}>
          {round.ask === 'design' ? 'What speed needs no friction?' : 'What is the safe band of speeds?'}
        </p>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="bank-answer-low">
            {round.ask === 'design' ? 'Design speed' : 'Slowest safe speed'}
            <span className="value">{answer.low === null ? 'move the slider' : `${answer.low.toFixed(1)} m/s`}</span>
          </label>
          <input id="bank-answer-low" type="range" min="0" max="25" step="0.1" value={answer.low ?? 0}
            onChange={(e) => setAnswer({ low: +e.target.value })} />
        </div>
        {round.ask === 'band' && (
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="bank-answer-high">
              Fastest safe speed
              <span className="value">{answer.high === null ? 'move the slider' : `${answer.high.toFixed(1)} m/s`}</span>
            </label>
            <input id="bank-answer-high" type="range" min="0" max="25" step="0.1" value={answer.high ?? 0}
              onChange={(e) => setAnswer({ high: +e.target.value })} />
          </div>
        )}
        <div className={styles.playRow}>
          <button className="btn btn--primary" onClick={lock} disabled={!ready}>🔒 Lock in</button>
          <span className={styles.gameStatus}>
            {attempts[roundIdx] > 0 ? `Tries: ${attempts[roundIdx]} · ` : ''}{cleared[roundIdx] ? '✅ Cleared · ' : ''}within ±{SPEED_TOLERANCE * 100}% counts
          </span>
        </div>
        {feedback[roundIdx] && (
          <ul className={styles.feedbackList} role="status">
            {feedback[roundIdx]!.map((line) => <li key={line}>{line}</li>)}
          </ul>
        )}
        {missed && !cleared[roundIdx] && (
          <details className={styles.moreInfo} open>
            <summary>Hint</summary>
            <p>
              {round.ask === 'design'
                ? 'With no friction, the horizontal part of the normal force does all the turning: N sin θ = mv²/R and N cos θ = mg. Divide one by the other.'
                : 'At the slowest speed friction is at its maximum pointing UP the slope. At the fastest it is at its maximum pointing DOWN the slope. Write F = ma along and across the slope for each, using f = μN.'}
              {round.angleDeg === undefined && ' Use tan θ = v₀²/(Rg) first.'}
            </p>
          </details>
        )}
      </div>
    </div>
  );
}

// ═══ Bucket in a vertical circle ═════════════════════════════════════════════
const BUCKET_H = 270;
const BUCKET: Omit<BucketParams, 'bottomSpeed'> = { mass: 1.5, radius: 0.8 };
const BUCKET_LOOP_TOLERANCE = 0.06;

const OUTCOME_TEXT = {
  'swings-back': 'Too slow: it swings back down without getting near the top',
  'goes-slack': 'Not quite: the rope goes slack and the bucket flies off',
  completes: 'The rope stays tight: the bucket goes all the way round',
} as const;

function drawBucket(ctx: CanvasRenderingContext2D, params: BucketParams, samples: BucketSample[], time: number) {
  const s = bucketSampleAt(samples, time);
  const cx = 170, cy = 140;
  const pxPerM = 105 / params.radius;
  const toX = (x: number) => cx + x * pxPerM;
  const toY = (y: number) => cy - y * pxPerM;
  ctx.clearRect(0, 0, W, BUCKET_H);

  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = 'rgba(23,27,38,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, 105, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // After the rope goes slack, trace the flight so far
  const freeSoFar = samples.filter((p) => !p.onRope && p.t <= s.t);
  if (freeSoFar.length > 1) {
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = 'rgba(220,38,38,0.6)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    freeSoFar.forEach((p, i) => (i === 0 ? ctx.moveTo(toX(p.x), toY(p.y)) : ctx.lineTo(toX(p.x), toY(p.y))));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  const bx = toX(s.x), by = toY(s.y);
  if (s.onRope) {
    ctx.strokeStyle = COLOR.rope;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
  }
  ctx.fillStyle = COLOR.rope;
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

  if (bx > -20 && bx < 360 + 20 && by > -20 && by < BUCKET_H + 20) {
    ctx.fillStyle = s.onRope ? 'rgba(37,99,235,0.22)' : 'rgba(220,38,38,0.2)';
    ctx.strokeStyle = s.onRope ? COLOR.car : COLOR.carBad;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const k = 2.4;
    arrow(ctx, bx, by, 0, params.mass * G * k, COLOR.weight, 'mg', 14, 4);
    if (s.onRope && s.tension > 0.5) {
      const ux = (cx - bx) / 105, uy = (cy - by) / 105;
      arrow(ctx, bx, by, ux * s.tension * k, uy * s.tension * k, COLOR.normal, 'T', -uy * 12, ux * 12 + 4);
    }
  }

  // Rope tension against angle, with a marker that follows the bucket
  const px = 385, py = 40, pw = 195, ph = 170;
  const samplesT = Array.from({ length: 181 }, (_, a) => bucketAt(params, a).tension);
  const tMax = Math.max(...samplesT), tMin = Math.min(0, ...samplesT);
  const sx = (a: number) => px + (a / 180) * pw;
  const sy = (t: number) => py + ph - ((t - tMin) / (tMax - tMin)) * ph;
  ctx.fillStyle = 'rgba(23,27,38,0.04)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(23,27,38,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, sy(0)); ctx.lineTo(px + pw, sy(0)); ctx.stroke();
  const reach = bucketOutcome(params) === 'completes' ? 180 : (slackAngleDeg(params) ?? 180);
  ctx.lineWidth = 2.5;
  for (let a = 0; a < 180; a++) {
    ctx.strokeStyle = a >= reach && bucketOutcome(params) !== 'swings-back' ? 'rgba(220,38,38,0.35)' : COLOR.normal;
    ctx.beginPath(); ctx.moveTo(sx(a), sy(samplesT[a])); ctx.lineTo(sx(a + 1), sy(samplesT[a + 1])); ctx.stroke();
  }
  if (s.onRope) {
    const folded = s.phiDeg > 180 ? 360 - s.phiDeg : s.phiDeg;
    ctx.fillStyle = COLOR.car;
    ctx.beginPath(); ctx.arc(sx(folded), sy(Math.max(tMin, Math.min(tMax, s.tension))), 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.fillStyle = COLOR.text;
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('rope tension', px, py - 10);
  ctx.fillText('bottom', px, py + ph + 15);
  ctx.textAlign = 'right';
  ctx.fillText('top', px + pw, py + ph + 15);
  ctx.textAlign = 'left';
  ctx.fillText('T = 0', px + 4, sy(0) - 4);
  ctx.textAlign = 'left';
  ctx.fillStyle = 'rgba(23,27,38,0.8)';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.fillText(s.onRope ? `T = ${Math.max(0, s.tension).toFixed(1)} N` : 'rope slack', 8, 18);
}

/** End the loop shortly after the bucket flies out of the picture, so students never watch an empty circle. */
function trimToView(samples: BucketSample[], radius: number): BucketSample[] {
  const limit = (y: number, x: number) => y < -1.15 * (0.8 / radius) || y > 1.1 * (0.8 / radius) || x > 1.6 * (0.8 / radius) || x < -1.4 * (0.8 / radius);
  const exit = samples.findIndex((p) => !p.onRope && limit(p.y, p.x));
  return exit < 0 ? samples : samples.slice(0, Math.min(samples.length, exit + 10));
}

function BucketCanvas({ params, samples, time }: { params: BucketParams; samples: BucketSample[]; time: number }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => drawBucket(ctx, params, samples, time), [params, samples, time]);
  const ref = useCanvasDraw(BUCKET_H, draw);
  return (
    <canvas
      ref={ref}
      className={styles.canvas}
      aria-label="A bucket on a rope moving in a vertical circle, with a graph of the rope tension against angle"
      role="img"
    />
  );
}

export function BucketGame({
  attempts,
  cleared,
  onLock,
  active = true,
}: {
  attempts: number;
  cleared: boolean;
  onLock: (correct: boolean) => void;
  /** False while the tab is hidden, so the animation stops running in the background. */
  active?: boolean;
}) {
  const [bottomSpeed, setBottomSpeed] = useState(4.5);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  const [slow, setSlow] = useState(false);

  const params: BucketParams = useMemo(() => ({ ...BUCKET, bottomSpeed }), [bottomSpeed]);
  const samples = useMemo(() => trimToView(generateBucketTimeline(params, 6), params.radius), [params]);
  const { time, restart } = useClock(playing && active, `bucket-${bottomSpeed}`, slow ? 0.35 : 1);
  const outcome = bucketOutcome(params);
  const minSpeed = minLoopBottomSpeed(BUCKET.radius);

  const lock = () => {
    const ok = bottomSpeed >= minSpeed && bottomSpeed <= minSpeed * (1 + BUCKET_LOOP_TOLERANCE);
    let text: string;
    if (ok) text = `✓ Just enough: ${bottomSpeed.toFixed(1)} m/s takes it all the way round with the rope only just tight at the top.`;
    else if (bottomSpeed < minSpeed) text = `✗ ${bottomSpeed.toFixed(1)} m/s is not enough to complete the loop.`;
    else text = `✗ It completes the loop, but ${bottomSpeed.toFixed(1)} m/s is more than needed. Find the slowest speed that works (within ${BUCKET_LOOP_TOLERANCE * 100}%).`;
    setVerdict({ ok, text });
    onLock(ok);
  };

  return (
    <div className={styles.gameCard}>
      <p className={styles.goal}>
        A {BUCKET.mass} kg bucket swings on a {BUCKET.radius} m rope. Find the <strong>slowest</strong> speed at the bottom that still gets it over the top.
      </p>

      <BucketCanvas params={params} samples={samples} time={time} />
      <PlayControls
        playing={playing}
        onToggle={() => setPlaying((p) => !p)}
        onReplay={() => { restart(); setPlaying(true); }}
        slow={slow}
        onSlow={() => setSlow((v) => !v)}
      />

      <div className="slider-wrap">
        <label className="slider-label" htmlFor="bucket-speed">
          Speed at the bottom <span className="value">{bottomSpeed.toFixed(1)} m/s</span>
        </label>
        <input id="bucket-speed" type="range" min="2" max="8" step="0.1" value={bottomSpeed}
          onChange={(e) => { setBottomSpeed(+e.target.value); setVerdict(null); }} />
      </div>
      <p className={outcome === 'completes' ? styles.verdictGood : styles.verdictBad} role="status">{OUTCOME_TEXT[outcome]}</p>

      <div className={styles.playRow}>
        <button className="btn btn--primary" onClick={lock}>🔒 This is the slowest that works</button>
        <span className={styles.gameStatus}>{attempts > 0 ? `Tries: ${attempts}` : ''}{cleared ? ' · ✅ Cleared' : ''}</span>
      </div>
      {verdict && <p className={verdict.ok ? styles.verdictGood : styles.verdictBad} role="status">{verdict.text}</p>}
      {attempts > 0 && !cleared && (
        <details className={styles.moreInfo} open>
          <summary>Hint</summary>
          <p>At the top the tension must not drop below zero, so v_top² ≥ gr. Energy then gives the bottom speed: v₀² = v_top² + 4gr.</p>
        </details>
      )}
    </div>
  );
}
