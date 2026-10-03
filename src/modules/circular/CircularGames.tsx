import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type BankedParams,
  type BankStatus,
  type BucketParams,
  G,
  SPEED_TOLERANCE,
  bankAngleFromDesignSpeed,
  bankedBand,
  bankedForcesAt,
  bucketAt,
  bucketOutcome,
  gradeSpeedGuess,
  maxAngleDeg,
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
  weight: '#7c3aed',
  normal: '#15803d',
  friction: '#dc2626',
  accel: '#b45309',
  rope: '#475569',
  text: 'rgba(23,27,38,0.65)',
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
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeText(label, tx + labelDx, ty + labelDy);
  ctx.fillText(label, tx + labelDx, ty + labelDy);
}

function useCanvasDraw(height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  const paint = useCallback(() => {
    const ctx = ref.current?.getContext('2d');
    if (ctx) draw(ctx);
  }, [draw]);
  // The hook wipes the canvas whenever layout changes its size, so it repaints via onResize.
  useHiDPICanvas(ref, W, height, paint);
  useEffect(() => { paint(); }, [paint]);
  return ref;
}

// ═══ Banked curve: the Safe Speed Band ═══════════════════════════════════════
const BANK_H = 280;

const STATUS_TEXT: Record<BankStatus, string> = {
  'slides-down': 'Too slow: the car slides down toward the inside of the bend',
  holds: 'Safe: friction is enough to hold the car on its circle',
  'slides-up': 'Too fast: the car slides up and out toward the edge',
};

function drawBank(ctx: CanvasRenderingContext2D, params: BankedParams, speed: number) {
  const theta = (params.angleDeg * Math.PI) / 180;
  const forces = bankedForcesAt(params, speed);
  const cx = 320, cy = 175;
  const d = { x: Math.cos(theta), y: -Math.sin(theta) };      // up the slope (canvas y points down)
  const n = { x: -Math.sin(theta), y: -Math.cos(theta) };     // normal to the road, toward the centre side
  ctx.clearRect(0, 0, W, BANK_H);

  // Ground and road
  const p1 = { x: cx - d.x * 330, y: cy - d.y * 330 };
  const p2 = { x: cx + d.x * 330, y: cy + d.y * 330 };
  ctx.fillStyle = COLOR.ground;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p2.x, BANK_H); ctx.lineTo(p1.x, BANK_H);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = COLOR.road;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();

  // Banking angle marker
  const ax = cx - 190, ay = cy + 190 * Math.tan(theta);
  ctx.strokeStyle = 'rgba(23,27,38,0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax + 150, ay); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = COLOR.text;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`bank angle ${params.angleDeg.toFixed(1)}°`, ax + 70, ay - 6);

  // Car (sits on the road, tilted with it)
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-theta);
  ctx.fillStyle = 'rgba(37,99,235,0.16)';
  ctx.strokeStyle = COLOR.car;
  ctx.lineWidth = 2;
  ctx.fillRect(-36, -30, 72, 30);
  ctx.strokeRect(-36, -30, 72, 30);
  ctx.fillStyle = COLOR.car;
  ctx.beginPath(); ctx.arc(-20, 0, 6, 0, Math.PI * 2); ctx.arc(20, 0, 6, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // Forces per kilogram, drawn from the car's centre
  const pc = { x: cx + n.x * 15, y: cy + n.y * 15 };
  const s = 4.2;
  arrow(ctx, pc.x, pc.y, 0, G * s, COLOR.weight, 'mg', 0, 14);
  arrow(ctx, pc.x, pc.y, n.x * forces.normal * s, n.y * forces.normal * s, COLOR.normal, 'N', n.x * 10 - 6, n.y * 10 - 4);
  if (Math.abs(forces.friction) > 0.02) {
    arrow(ctx, pc.x, pc.y, d.x * forces.friction * s, d.y * forces.friction * s, COLOR.friction,
      forces.friction > 0 ? 'friction (up the slope)' : 'friction (down the slope)', d.x * 40, d.y * 24 + (forces.friction > 0 ? -6 : 14));
  }

  // Centre of the bend
  ctx.strokeStyle = COLOR.accel;
  ctx.fillStyle = COLOR.accel;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 4]);
  ctx.beginPath(); ctx.moveTo(60, 60); ctx.lineTo(18, 60); ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath(); ctx.moveTo(14, 60); ctx.lineTo(24, 55); ctx.lineTo(24, 65); ctx.closePath(); ctx.fill();
  ctx.font = 'bold 10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('toward the centre of the bend', 66, 64);

  // Readout
  ctx.fillStyle = 'rgba(23,27,38,0.78)';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`v = ${speed.toFixed(1)} m/s`, W - 8, 18);
  ctx.fillStyle = COLOR.text;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.fillText(`a = v²/R = ${forces.centripetal.toFixed(2)} m/s²`, W - 8, 34);
  ctx.fillText('cross-section of the road (forces per kg)', W - 8, 50);
}

function BankCanvas({ params, speed }: { params: BankedParams; speed: number }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => drawBank(ctx, params, speed), [params, speed]);
  const ref = useCanvasDraw(BANK_H, draw);
  return (
    <canvas
      ref={ref}
      className={styles.canvas}
      aria-label="Cross-section of a banked road with a car on it and the forces on the car"
      role="img"
    />
  );
}

interface BankRound {
  id: string;
  title: string;
  radius: number;
  mu: number;
  /** Either the banking angle is given, or only the speed the road is designed for. */
  angleDeg?: number;
  designSpeed?: number;
  ask: 'design' | 'band';
  intro: string;
}

const BANK_ROUNDS: BankRound[] = [
  {
    id: 'ice', title: 'Round 1 · Icy road', radius: 50, mu: 0, angleDeg: 15, ask: 'design',
    intro: 'The road is covered in ice, so there is no friction at all. Only one speed lets the car stay on its circle. Find it.',
  },
  {
    id: 'wet', title: 'Round 2 · A little grip', radius: 50, mu: 0.15, angleDeg: 15, ask: 'band',
    intro: 'Now the tyres grip a little. Find the slowest and the fastest speed at which the car stays put.',
  },
  {
    id: 'design', title: 'Round 3 · Given the design speed', radius: 40, mu: 0.2, designSpeed: 12, ask: 'band',
    intro: 'This time you are not told the banking angle, only that the road was designed so a car needs no friction at exactly 12 m/s. Work out the angle first, then the band.',
  },
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
}: {
  attempts: number[];
  cleared: boolean[];
  onLock: (round: number, correct: boolean) => void;
}) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [testSpeed, setTestSpeed] = useState(8);
  const [answers, setAnswers] = useState<BankAnswer[]>(() => BANK_ROUNDS.map(() => EMPTY_ANSWER));
  const [feedback, setFeedback] = useState<(string[] | null)[]>(() => BANK_ROUNDS.map(() => null));

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
  const fmt = (v: number) => v.toFixed(2);

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameHeader}>
        <span className={styles.gameIcon}>🚗</span>
        <div>
          <h4>Safe Speed Band <span className={styles.optionalTag}>optional · +15 XP per round, badge for three first tries</span></h4>
          <p>
            A car takes a banked bend. The slope helps push the car toward the centre, and friction tops up the rest.
            Drag the test-drive speed to see the forces, then work out the band of safe speeds with the formulas.
          </p>
        </div>
      </div>

      <div className={styles.roundTabs} role="tablist" aria-label="Choose a round">
        {BANK_ROUNDS.map((r, i) => (
          <button
            key={r.id}
            role="tab"
            aria-selected={roundIdx === i}
            className={`${styles.roundTab} ${roundIdx === i ? styles.roundTabActive : ''}`}
            onClick={() => setRoundIdx(i)}
          >
            {r.title.split(' · ')[0]} {cleared[i] ? '✅' : ''}
          </button>
        ))}
      </div>

      <p className={styles.roundTitle}>{round.title}</p>
      <p className={styles.hint}>{round.intro}</p>
      <div className={styles.givens}>
        <span>Radius of the bend <strong>R = {round.radius} m</strong></span>
        <span>Grip <strong>μₛ = {round.mu.toFixed(2)}</strong></span>
        {round.angleDeg !== undefined
          ? <span>Banking angle <strong>θ = {round.angleDeg}°</strong></span>
          : <span>Design speed <strong>v₀ = {round.designSpeed} m/s</strong></span>}
        <span>g = {G} m/s²</span>
      </div>

      <BankCanvas params={params} speed={testSpeed} />
      <div className="slider-wrap">
        <label className="slider-label" htmlFor="bank-test-speed">
          Test-drive speed <span className="value">{testSpeed.toFixed(1)} m/s · {(testSpeed * 3.6).toFixed(0)} km/h</span>
        </label>
        <input id="bank-test-speed" type="range" min="0" max="25" step="0.1" value={testSpeed}
          onChange={(e) => setTestSpeed(+e.target.value)} />
      </div>
      <p className={status === 'holds' ? styles.verdictGood : styles.verdictBad} role="status">
        {STATUS_TEXT[status]}.
        {' '}Friction needed: {fmt(Math.abs(forces.friction))} N/kg {forces.friction >= 0 ? 'up' : 'down'} the slope; the most available is {fmt(forces.maxFriction)} N/kg.
      </p>

      <div className={styles.answerBlock}>
        <p className={styles.questionText}>
          {round.ask === 'design' ? 'What is the speed at which no friction is needed?' : 'What is the band of safe speeds?'}
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
          <button className="btn btn--primary" onClick={lock} disabled={!ready}>🔒 Lock in my answer</button>
          <span className={styles.gameStatus}>
            Attempts: <strong>{attempts[roundIdx]}</strong>{cleared[roundIdx] && ' · ✅ Cleared'} · within ±{SPEED_TOLERANCE * 100}% counts
          </span>
        </div>
        {feedback[roundIdx] && (
          <ul className={styles.feedbackList} role="status">
            {feedback[roundIdx]!.map((line) => <li key={line}>{line}</li>)}
          </ul>
        )}
        {missed && !cleared[roundIdx] && (
          <p className={styles.hint}>
            💡 {round.ask === 'design'
              ? 'With no friction, the horizontal part of the normal force is the whole centripetal force: N sin θ = mv²/R, and N cos θ = mg. Divide one by the other.'
              : 'At the slowest speed friction is at its maximum pointing UP the slope; at the fastest it is at its maximum pointing DOWN the slope. Write Newton\'s second law along and across the slope for each case, using f = μN.'}
            {round.angleDeg === undefined && ' For this round use tan θ = v₀²/(Rg) first.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ═══ Bucket in a vertical circle ═════════════════════════════════════════════
const BUCKET_H = 300;
const BUCKET: Omit<BucketParams, 'bottomSpeed'> = { mass: 1.5, radius: 0.8 };
const BUCKET_LOOP_TOLERANCE = 0.06;

const OUTCOME_TEXT = {
  'swings-back': 'It swings back down without ever rising above the centre: the rope stays tight, but it never gets near the top',
  'goes-slack': 'The rope goes slack on the way up, and the bucket leaves its circle',
  completes: 'The rope stays tight all the way: the bucket completes the loop',
} as const;

function drawBucket(ctx: CanvasRenderingContext2D, params: BucketParams, phiDeg: number) {
  const state = bucketAt(params, phiDeg);
  const cx = 190, cy = 150, R = 105;
  const phi = (phiDeg * Math.PI) / 180;
  const bx = cx + R * Math.sin(phi);
  const by = cy + R * Math.cos(phi);
  ctx.clearRect(0, 0, W, BUCKET_H);

  ctx.setLineDash([4, 5]);
  ctx.strokeStyle = 'rgba(23,27,38,0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // Rope and pivot
  ctx.strokeStyle = state.tension > 0 ? COLOR.rope : 'rgba(220,38,38,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();
  ctx.fillStyle = COLOR.rope;
  ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

  // Bucket
  ctx.fillStyle = 'rgba(37,99,235,0.2)';
  ctx.strokeStyle = COLOR.car;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(bx, by, 11, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Forces on the bucket
  const s = 2.6;
  arrow(ctx, bx, by, 0, params.mass * G * s, COLOR.weight, 'mg', 14, 4);
  if (state.tension > 0.05) {
    const ux = (cx - bx) / R, uy = (cy - by) / R;
    arrow(ctx, bx, by, ux * state.tension * s, uy * state.tension * s, COLOR.normal, 'T', -uy * 12, ux * 12 + 4);
  }

  // Tension against angle
  const px = 360, py = 38, pw = 220, ph = 200;
  const tAt = (a: number) => bucketAt(params, a).tension;
  const samples = Array.from({ length: 181 }, (_, a) => tAt(a));
  const tMax = Math.max(...samples), tMin = Math.min(0, ...samples);
  const sx = (a: number) => px + (a / 180) * pw;
  const sy = (t: number) => py + ph - ((t - tMin) / (tMax - tMin)) * ph;
  ctx.fillStyle = 'rgba(23,27,38,0.04)';
  ctx.fillRect(px, py, pw, ph);
  ctx.strokeStyle = 'rgba(23,27,38,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, sy(0)); ctx.lineTo(px + pw, sy(0)); ctx.stroke();
  const reach = maxAngleDeg(params);
  ctx.lineWidth = 2.5;
  for (let a = 0; a < 180; a++) {
    ctx.strokeStyle = a >= reach ? 'rgba(220,38,38,0.35)' : COLOR.normal;
    ctx.beginPath(); ctx.moveTo(sx(a), sy(samples[a])); ctx.lineTo(sx(a + 1), sy(samples[a + 1])); ctx.stroke();
  }
  ctx.fillStyle = COLOR.car;
  ctx.beginPath(); ctx.arc(sx(phiDeg), sy(tAt(phiDeg)), 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = COLOR.text;
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('rope tension T against angle', px, py - 10);
  ctx.fillText('0° (bottom)', px, py + ph + 14);
  ctx.textAlign = 'right';
  ctx.fillText('180° (top)', px + pw, py + ph + 14);
  ctx.textAlign = 'left';
  ctx.fillText('T = 0', px + 4, sy(0) - 4);

  // Readout
  ctx.fillStyle = 'rgba(23,27,38,0.78)';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.fillText(`φ = ${phiDeg.toFixed(0)}°`, 8, 18);
  ctx.fillText(`v = ${state.speed.toFixed(2)} m/s`, 8, 34);
  ctx.fillText(`T = ${Math.max(0, state.tension).toFixed(1)} N`, 8, 50);
}

function BucketCanvas({ params, phiDeg }: { params: BucketParams; phiDeg: number }) {
  const draw = useCallback((ctx: CanvasRenderingContext2D) => drawBucket(ctx, params, phiDeg), [params, phiDeg]);
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
}: {
  attempts: number;
  cleared: boolean;
  onLock: (correct: boolean) => void;
}) {
  const [bottomSpeed, setBottomSpeed] = useState(4.5);
  const [phi, setPhi] = useState(90);
  const [verdict, setVerdict] = useState<{ ok: boolean; text: string } | null>(null);

  const params: BucketParams = useMemo(() => ({ ...BUCKET, bottomSpeed }), [bottomSpeed]);
  const outcome = bucketOutcome(params);
  const reach = maxAngleDeg(params);
  const shownPhi = Math.min(phi, reach);
  const state = bucketAt(params, shownPhi);
  const slack = slackAngleDeg(params);
  const minSpeed = minLoopBottomSpeed(BUCKET.radius);

  const lock = () => {
    const ok = bottomSpeed >= minSpeed && bottomSpeed <= minSpeed * (1 + BUCKET_LOOP_TOLERANCE);
    let text: string;
    if (ok) text = `✓ Just enough: ${bottomSpeed.toFixed(1)} m/s takes the bucket all the way round with the rope only just tight at the top.`;
    else if (bottomSpeed < minSpeed) text = `✗ Not fast enough: ${bottomSpeed.toFixed(1)} m/s is not enough, so the bucket does not complete the loop.`;
    else text = `✗ It completes the loop, but ${bottomSpeed.toFixed(1)} m/s is more than needed. Find the slowest speed that still works (within ${BUCKET_LOOP_TOLERANCE * 100}%).`;
    setVerdict({ ok, text });
    onLock(ok);
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameHeader}>
        <span className={styles.gameIcon}>🪣</span>
        <div>
          <h4>Full-Loop Bucket <span className={styles.optionalTag}>optional · +20 XP</span></h4>
          <p>
            A {BUCKET.mass} kg bucket swings on a {BUCKET.radius} m rope. Set its speed at the bottom, then slide the angle round the circle
            and watch the rope tension, and the forces along and across the path. Find the <strong>slowest</strong> bottom speed that
            still gets it over the top.
          </p>
        </div>
      </div>

      <div className="slider-wrap">
        <label className="slider-label" htmlFor="bucket-speed">
          Speed at the bottom (v₀) <span className="value">{bottomSpeed.toFixed(1)} m/s</span>
        </label>
        <input id="bucket-speed" type="range" min="2" max="8" step="0.1" value={bottomSpeed}
          onChange={(e) => { setBottomSpeed(+e.target.value); setVerdict(null); }} />
      </div>

      <BucketCanvas params={params} phiDeg={shownPhi} />

      <div className="slider-wrap">
        <label className="slider-label" htmlFor="bucket-angle">
          Angle round from the bottom (φ) <span className="value">{shownPhi.toFixed(0)}°</span>
        </label>
        <input id="bucket-angle" type="range" min="0" max="180" step="1" value={shownPhi}
          onChange={(e) => setPhi(+e.target.value)} />
      </div>
      <p className={outcome === 'completes' ? styles.verdictGood : styles.verdictBad} role="status">
        {OUTCOME_TEXT[outcome]}
        {slack !== null && ` (slack from about ${slack.toFixed(0)}° round)`}.
      </p>
      {shownPhi >= reach && outcome !== 'completes' && (
        <p className={styles.hint}>The slider stops where the bucket stops following the circle.</p>
      )}

      <div className={styles.readouts}>
        <div><span>Speed here</span><strong>{state.speed.toFixed(2)} m/s</strong></div>
        <div><span>Rope tension T</span><strong>{Math.max(0, state.tension).toFixed(1)} N</strong></div>
        <div><span>Along the path (changes speed)</span><strong>{state.tangentialForce.toFixed(1)} N</strong></div>
        <div><span>Toward the centre (mv²/r)</span><strong>{state.radialForce.toFixed(1)} N</strong></div>
      </div>

      <div className={styles.playRow}>
        <button className="btn btn--primary" onClick={lock}>🔒 This is the slowest speed that works</button>
        <span className={styles.gameStatus}>Attempts: <strong>{attempts}</strong>{cleared && ' · ✅ Cleared'}</span>
      </div>
      {verdict && <p className={verdict.ok ? styles.verdictGood : styles.verdictBad} role="status">{verdict.text}</p>}
      {attempts > 0 && !cleared && (
        <p className={styles.hint}>
          💡 The tension at the top must not drop below zero: T = mv_top²/r − mg ≥ 0, so v_top² ≥ gr. Then use energy to find what speed at the
          bottom gives that: v₀² = v_top² + 4gr.
        </p>
      )}
    </div>
  );
}
