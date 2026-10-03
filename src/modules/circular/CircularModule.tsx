import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type TurntableParams,
  type TurntableState,
  RPM_TOLERANCE,
  SPIN_UP_TIME,
  computeTurntable,
  gradeRpmGuess,
  radPerSecToRpm,
  slipRpm,
  toTurntableFrame,
  turntableDuration,
  turntableStateAt,
} from '../../core/physics/circular';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { CIRCULAR_CONCEPTS, CIRCULAR_CHALLENGE } from './circularConcepts';
import { CIRCULAR_EXPLAIN_QUESTIONS } from './circularQuestions';
import { BankedCurveGame, BucketGame } from './CircularGames';
import styles from './CircularModule.module.css';

// ─── Scene geometry ───────────────────────────────────────────────────────────
const W = 600, H = 340;
const CX = W / 2, CY = H / 2;
const RING_PX = 58;     // where the coin sits, measured from the axis, in pixels
const TABLE_PX = 70;    // turntable radius in pixels (the coin is near the rim)
const COIN_PX = 8;

const COLOR = {
  table: '#2563eb',
  tableFill: 'rgba(37,99,235,0.07)',
  tick: 'rgba(37,99,235,0.45)',
  velocity: '#15803d',
  friction: '#dc2626',
  trail: 'rgba(37,99,235,0.5)',
  tangent: 'rgba(21,128,61,0.6)',
  radial: 'rgba(220,38,38,0.45)',
  coin: '#d4a017',
  coinEdge: '#8a6a0a',
  text: 'rgba(23,27,38,0.6)',
};

type ViewFrame = 'room' | 'turntable';
type PathChoice = 'tangent' | 'radial' | 'curve';

const PATH_OPTIONS: { id: PathChoice; label: string }[] = [
  { id: 'tangent', label: 'Straight on, along the tangent: it keeps going the way it was already moving' },
  { id: 'radial', label: 'Straight outward, along the radius: it is flung away from the centre' },
  { id: 'curve', label: 'It keeps curving, still bending the way the turntable spins' },
];

function arrow(ctx: CanvasRenderingContext2D, x: number, y: number, dx: number, dy: number, color: string, label: string) {
  const len = Math.hypot(dx, dy);
  if (len < 2) return;
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
  // Put the label beyond the arrowhead, centred a little further out the longer the word is, with a white halo
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  const half = ctx.measureText(label).width / 2;
  const lx = tx + ux * (12 + half);
  const ly = ty + uy * 14 + 4;
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeText(label, lx, ly);
  ctx.fillText(label, lx, ly);
}

function drawScene(ctx: CanvasRenderingContext2D, params: TurntableParams, state: TurntableState, view: ViewFrame) {
  const scale = RING_PX / params.radius;
  const result = computeTurntable(params);
  ctx.clearRect(0, 0, W, H);

  // Positions in the picture: y flips because canvas y points down.
  const toPx = (x: number, y: number) => {
    const p = view === 'room' ? { x, y } : toTurntableFrame(x, y, state.tableAngle);
    return { x: CX + p.x * scale, y: CY - p.y * scale };
  };

  // Turntable: spins in the room view, stands still in its own frame
  const spin = view === 'room' ? state.tableAngle : 0;
  ctx.fillStyle = COLOR.tableFill;
  ctx.strokeStyle = COLOR.table;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(CX, CY, TABLE_PX, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = COLOR.tick;
  ctx.lineWidth = 1.5;
  for (let k = 0; k < 8; k++) {
    const a = spin + (k * Math.PI) / 4;
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(a) * 18, CY - Math.sin(a) * 18);
    ctx.lineTo(CX + Math.cos(a) * 42, CY - Math.sin(a) * 42);
    ctx.stroke();
  }
  ctx.fillStyle = COLOR.table;
  ctx.beginPath(); ctx.arc(CX, CY, 3.5, 0, Math.PI * 2); ctx.fill();

  // Tangent / radial guides after release (room view only)
  const slip = turntableStateAt(params, SPIN_UP_TIME);
  if (view === 'room' && state.flying) {
    const p0 = toPx(slip.x, slip.y);
    const ux = slip.vx / slip.speed, uy = slip.vy / slip.speed; // tangent, in room coordinates
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = COLOR.tangent;
    ctx.beginPath(); ctx.moveTo(p0.x - ux * 90, p0.y + uy * 90); ctx.lineTo(p0.x + ux * 320, p0.y - uy * 320); ctx.stroke();
    ctx.strokeStyle = COLOR.radial;
    const rx = slip.x / params.radius, ry = slip.y / params.radius; // radial, outward
    ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p0.x + rx * 120, p0.y - ry * 120); ctx.stroke();
    ctx.setLineDash([]);
    // Labels sit at the far ends of their lines (clamped into view), with a halo so they stay readable
    const label = (text: string, ex: number, ey: number, color: string) => {
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      const width = ctx.measureText(text).width;
      const x = Math.min(W - width - 6, Math.max(6, ex - width / 2));
      const y = Math.min(H - 8, Math.max(62, ey));
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.textAlign = 'left';
      ctx.strokeText(text, x, y);
      ctx.fillStyle = color;
      ctx.fillText(text, x, y);
    };
    // behind the release point, where the coin never travels, so the text never sits on the coin
    label('tangent: where it goes', p0.x - ux * 100, p0.y + uy * 100 - 8, COLOR.velocity);
    label('radius: where it does NOT go', p0.x + rx * 120, p0.y - ry * 120 + (ry > 0 ? -8 : 14), 'rgba(185,28,28,0.95)');
  }

  // Trail of the coin's path so far
  ctx.setLineDash([3, 4]);
  ctx.strokeStyle = COLOR.trail;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let t = 0; t <= state.t; t += 0.05) {
    const s = turntableStateAt(params, t);
    const p = toPx(s.x, s.y);
    if (t === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
  }
  const here = toPx(state.x, state.y);
  ctx.lineTo(here.x, here.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Arrows
  if (view === 'room') {
    if (state.speed > 0) {
      const len = 16 + 38 * Math.min(1, state.speed / result.slipSpeed);
      arrow(ctx, here.x, here.y, (state.vx / state.speed) * len, -(state.vy / state.speed) * len, COLOR.velocity, 'v');
    }
    if (!state.flying && state.friction > 0) {
      const len = 8 + 40 * Math.min(1, state.friction / result.maxFriction);
      const dx = CX - here.x, dy = CY - here.y;
      const d = Math.hypot(dx, dy) || 1;
      arrow(ctx, here.x, here.y, (dx / d) * len, (dy / d) * len, COLOR.friction, 'friction');
    }
  } else if (state.flying) {
    // Relative velocity seen from the turntable: v minus the turntable's own motion at the coin's position
    const rel = toTurntableFrame(state.vx + state.omega * state.y, state.vy - state.omega * state.x, state.tableAngle);
    const mag = Math.hypot(rel.x, rel.y);
    if (mag > 0) {
      const len = 16 + 30 * Math.min(1, mag / (result.slipSpeed * 2));
      arrow(ctx, here.x, here.y, (rel.x / mag) * len, -(rel.y / mag) * len, COLOR.velocity, 'seems flung out');
    }
  }

  // Coin
  ctx.fillStyle = COLOR.coin;
  ctx.strokeStyle = COLOR.coinEdge;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(here.x, here.y, COIN_PX, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Readout
  ctx.fillStyle = 'rgba(23,27,38,0.75)';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`t = ${state.t.toFixed(2)} s`, 8, 18);
  ctx.fillText(`${radPerSecToRpm(state.omega).toFixed(1)} rpm`, 8, 34);
  ctx.fillStyle = COLOR.text;
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText(`ω = ${state.omega.toFixed(2)} rad/s`, 8, 50);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLOR.table;
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.fillText(view === 'room' ? 'Seen from the room' : 'Seen from the turntable', W - 8, 18);
  ctx.fillStyle = COLOR.text;
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText('looking down from above', W - 8, 32);
}

function TurntableCanvas({ params, state, view }: { params: TurntableParams; state: TurntableState; view: ViewFrame }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawScene(ctx, params, state, view);
  }, [params, state, view]);

  // The hook wipes the canvas whenever layout changes its size, so it repaints via onResize.
  useHiDPICanvas(canvasRef, W, H, draw);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-label="A coin riding near the rim of a turntable, seen from above, as the turntable speeds up"
      role="img"
    />
  );
}

// ─── Playback ─────────────────────────────────────────────────────────────────
function useTurntablePlayback(params: TurntableParams, autoplay: boolean) {
  const duration = useMemo(() => turntableDuration(params), [params]);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  const [slowMo, setSlowMo] = useState(false);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last: number | null = null;
    const tick = (now: number) => {
      if (last === null) last = now;
      const dt = (now - last) / 1000;
      last = now;
      elapsedRef.current = Math.min(duration, elapsedRef.current + dt * (slowMo ? 0.25 : 1));
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= duration) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, slowMo, duration]);

  const state = useMemo(() => turntableStateAt(params, elapsed), [params, elapsed]);
  const finished = elapsed >= duration;

  const seek = (t: number) => {
    elapsedRef.current = t;
    setElapsed(t);
    setPlaying(false);
  };
  const replay = () => {
    elapsedRef.current = 0;
    setElapsed(0);
    setPlaying(true);
  };

  return { duration, elapsed, playing, setPlaying, slowMo, setSlowMo, state, finished, seek, replay };
}

// ─── Friction gauge ───────────────────────────────────────────────────────────
function FrictionGauge({ state, maxFriction }: { state: TurntableState; maxFriction: number }) {
  const pct = Math.min(100, (state.friction / maxFriction) * 100);
  const atLimit = !state.flying && pct >= 99.8;
  const mN = (v: number) => `${(v * 1000).toFixed(1)} mN`;
  return (
    <div className={styles.gauge} role="group" aria-label="Friction the coin needs compared with the most friction available">
      <div className={styles.gaugeRow}>
        <span className={styles.gaugeLabel}>Friction needed</span>
        <div className={styles.gaugeTrack} aria-hidden="true">
          <div className={styles.gaugeFill} data-limit={atLimit} style={{ width: `${pct}%` }} />
        </div>
        <strong className={styles.gaugeValue}>{mN(state.friction)}</strong>
      </div>
      <div className={styles.gaugeRow}>
        <span className={styles.gaugeLabel}>Most available</span>
        <div className={styles.gaugeTrack} aria-hidden="true">
          <div className={styles.gaugeFull} />
        </div>
        <strong className={styles.gaugeValue}>{mN(maxFriction)}</strong>
      </div>
      <p className={styles.gaugeNote} role="status">
        {state.flying ? 'The coin has left, so no friction acts on it now.' : atLimit ? 'At the limit: friction cannot give any more.' : 'The coin holds on while the red bar stays below the purple one.'}
      </p>
    </div>
  );
}

// ─── Observe stage: three short experiments, one at a time ───────────────────
interface GameProps {
  bank: { attempts: number[]; cleared: boolean[]; onLock: (round: number, correct: boolean) => void };
  bucket: { attempts: number; cleared: boolean; onLock: (correct: boolean) => void };
}

type ObserveTab = 'turntable' | 'bank' | 'bucket';

function TurntableTab({ params, rpmGuess, path }: { params: TurntableParams; rpmGuess: number | null; path: PathChoice | null }) {
  const playback = useTurntablePlayback(params, true);
  const { state, elapsed, playing, finished, slowMo } = playback;
  const [view, setView] = useState<ViewFrame>('room');
  const result = useMemo(() => computeTurntable(params), [params]);
  const grade = rpmGuess !== null ? gradeRpmGuess(rpmGuess, result.slipRpm) : null;

  const caption =
    view === 'room'
      ? state.flying
        ? 'Nothing pulls the coin inward now, so it goes straight along the tangent.'
        : 'Friction (red) pulls the coin inward, so it keeps turning. Its velocity (green) is along the tangent.'
      : state.flying
        ? 'From the turntable the coin seems flung outward, but nothing pushes it. The table just turns underneath.'
        : 'From the turntable the coin looks still, so you would need an outward "centrifugal force". It is not real.';

  const aCentripetal = state.omega * state.omega * params.radius;
  const whatIf = [
    { label: 'A heavier coin', rpm: slipRpm(params.radius, params.mu), note: 'no change: the mass cancels' },
    { label: 'Twice as far from the centre', rpm: slipRpm(params.radius * 2, params.mu), note: 'slips sooner' },
    { label: 'Twice the grip', rpm: slipRpm(params.radius, params.mu * 2), note: 'holds on longer' },
  ];

  return (
    <div className={styles.tabBody}>
      {(grade || path) && (
        <div className={styles.feedbackStrip}>
          {grade && (
            <p>
              <strong className={grade.isCorrect ? 'text-green' : 'text-amber'}>{grade.isCorrect ? '✓' : '✗'}</strong>{' '}
              You guessed <strong>{rpmGuess} rpm</strong>. It slips at <strong>{result.slipRpm.toFixed(1)} rpm</strong>
              {grade.isCorrect ? ' (close enough).' : '.'}
            </p>
          )}
          {path && (
            <p>
              <strong className={path === 'tangent' ? 'text-green' : 'text-amber'}>{path === 'tangent' ? '✓' : '✗'}</strong>{' '}
              {path === 'tangent' ? 'It leaves along the tangent. 🧭 No Such Force!' : 'It actually leaves along the tangent, not along the radius. Watch the dashed lines.'}
            </p>
          )}
        </div>
      )}

      <div className={styles.viewToggle} role="group" aria-label="Choose where you are watching from">
        <button className={`btn ${view === 'room' ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setView('room')} aria-pressed={view === 'room'}>
          👁️ From the room
        </button>
        <button className={`btn ${view === 'turntable' ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setView('turntable')} aria-pressed={view === 'turntable'}>
          🎡 On the turntable
        </button>
      </div>

      <TurntableCanvas params={params} state={state} view={view} />
      <p className={styles.caption} role="status">{caption}</p>

      <div className={styles.controlsRow}>
        <button
          className={`btn ${playing ? 'btn--secondary' : 'btn--primary'}`}
          onClick={() => (playing ? playback.setPlaying(false) : finished ? playback.replay() : playback.setPlaying(true))}
        >
          {playing ? '⏸ Pause' : finished ? '↺ Replay' : '▶ Play'}
        </button>
        <button className="btn btn--secondary" onClick={() => playback.setSlowMo((s) => !s)} aria-pressed={slowMo}>
          🐢 Slow {slowMo ? 'on' : 'off'}
        </button>
        <button className="btn btn--secondary" onClick={() => playback.seek(SPIN_UP_TIME - 0.6)}>
          ⏭ Slip moment
        </button>
      </div>
      <input
        id="turntable-scrubber"
        type="range"
        min={0}
        max={playback.duration}
        step={0.01}
        value={elapsed}
        onChange={(e) => playback.seek(parseFloat(e.target.value))}
        aria-label="Scrub through the turntable run"
      />

      <FrictionGauge state={state} maxFriction={result.maxFriction} />

      <div className={styles.keyNumbers}>
        <div><span>Turntable</span><strong>{radPerSecToRpm(state.omega).toFixed(1)} rpm</strong></div>
        <div><span>Coin speed</span><strong>{state.speed.toFixed(2)} m/s</strong></div>
        <div><span>Turning acceleration</span><strong>{state.flying ? '—' : `${aCentripetal.toFixed(2)} m/s²`}</strong></div>
      </div>

      <details className={styles.moreInfo}>
        <summary>More: what-if, numbers and equations</summary>
        <div className={styles.whatIf}>
          <p className={styles.hint}>Your coin slips at {result.slipRpm.toFixed(1)} rpm. Change one thing at a time:</p>
          {whatIf.map((row) => (
            <div className={styles.whatIfRow} key={row.label}>
              <span>{row.label}</span>
              <strong>{row.rpm.toFixed(1)} rpm</strong>
              <em>×{(row.rpm / result.slipRpm).toFixed(2)} · {row.note}</em>
            </div>
          ))}
        </div>
        <FormulaPanel
          title="Circular Motion Equations"
          formulas={[
            { label: 'Speed on the circle', latex: 'v = \\omega r', liveValue: `= ${state.speed.toFixed(3)} m/s`, accentColor: 'green' },
            { label: 'Centripetal acceleration', latex: 'a_c = \\omega^2 r = \\dfrac{v^2}{r}', liveValue: state.flying ? 'coin has left' : `= ${aCentripetal.toFixed(2)} m/s²`, accentColor: 'amber' },
            { label: 'Friction needed', latex: 'f = m\\omega^2 r', liveValue: `= ${(state.friction * 1000).toFixed(1)} mN`, accentColor: 'cyan' },
            { label: 'Most friction available', latex: 'f_{max} = \\mu_s m g', liveValue: `= ${(result.maxFriction * 1000).toFixed(1)} mN`, accentColor: 'violet' },
            { label: 'Slipping speed', latex: '\\omega_{max} = \\sqrt{\\dfrac{\\mu_s g}{r}}', liveValue: `= ${result.slipOmega.toFixed(2)} rad/s`, accentColor: 'cyan' },
          ]}
        />
      </details>
    </div>
  );
}

function ObserveStage({
  params,
  rpmGuess,
  path,
  games,
}: {
  params: TurntableParams;
  rpmGuess: number | null;
  path: PathChoice | null;
  games: GameProps;
}) {
  const [tab, setTab] = useState<ObserveTab>('turntable');
  const tabs: { id: ObserveTab; label: string; done: boolean }[] = [
    { id: 'turntable', label: '🪙 Turntable', done: false },
    { id: 'bank', label: '🚗 Banked road', done: games.bank.cleared.every(Boolean) },
    { id: 'bucket', label: '🪣 Bucket loop', done: games.bucket.cleared },
  ];

  return (
    <div className={styles.observeWrap}>
      <div className={styles.stageTabs} role="tablist" aria-label="Choose an experiment">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.stageTab} ${tab === t.id ? styles.stageTabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label} {t.done ? '✅' : ''}
          </button>
        ))}
      </div>
      {tab !== 'turntable' && <p className={styles.optionalNote}>Optional challenge. Earns bonus XP.</p>}

      {tab === 'turntable' && <TurntableTab params={params} rpmGuess={rpmGuess} path={path} />}
      <div hidden={tab !== 'bank'}>
        <BankedCurveGame attempts={games.bank.attempts} cleared={games.bank.cleared} onLock={games.bank.onLock} active={tab === 'bank'} />
      </div>
      <div hidden={tab !== 'bucket'}>
        <BucketGame attempts={games.bucket.attempts} cleared={games.bucket.cleared} onLock={games.bucket.onLock} active={tab === 'bucket'} />
      </div>
    </div>
  );
}

// ─── Main Circular Motion Module ──────────────────────────────────────────────
const DEFAULTS = { radiusCm: 12, mu: 0.4, massG: 5 };
const DIAL_MIN = 5;
const DIAL_MAX = 150;

export function CircularModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();

  const [radiusCm, setRadiusCm] = useState(DEFAULTS.radiusCm);
  const [mu, setMu] = useState(DEFAULTS.mu);
  const [massG, setMassG] = useState(DEFAULTS.massG);
  // null = not chosen yet (a dial sitting at its minimum is not a guess)
  const [rpmGuess, setRpmGuess] = useState<number | null>(null);
  const [path, setPath] = useState<PathChoice | null>(null);
  const [predictionLocked, setPredictionLocked] = useState(false);
  // Phase 2 games: attempts and clears per Safe Speed Band round, and for the bucket
  const [bankAttempts, setBankAttempts] = useState([0, 0, 0]);
  const [bankCleared, setBankCleared] = useState([false, false, false]);
  const [bucketAttempts, setBucketAttempts] = useState(0);
  const [bucketCleared, setBucketCleared] = useState(false);

  const params: TurntableParams = useMemo(
    () => ({ radius: radiusCm / 100, mu, mass: massG / 1000 }),
    [radiusCm, mu, massG],
  );
  const result = useMemo(() => computeTurntable(params), [params]);
  const startState = useMemo(() => turntableStateAt(params, 0), [params]);
  const rpmGrade = rpmGuess !== null ? gradeRpmGuess(rpmGuess, result.slipRpm) : null;

  const handleLockPrediction = () => {
    // Only reward the first lock-in; going Back and re-locking must not pay twice.
    if (!predictionLocked) {
      setPredictionLocked(true);
      let xp = 10;
      if (rpmGrade?.isCorrect) xp += 10;
      if (path === 'tangent') {
        xp += 10;
        unlockBadge('no-such-force');
      }
      addXP(xp);
    }
    setPOEPhase('observe');
  };

  const handleBankLock = (round: number, correct: boolean) => {
    const attempts = bankAttempts.map((n, i) => (i === round ? n + 1 : n));
    const cleared = bankCleared.map((c, i) => (i === round ? c || correct : c));
    setBankAttempts(attempts);
    setBankCleared(cleared);
    if (correct && !bankCleared[round]) addXP(15);
    // Safe Driver: every round cleared, and each one on its very first check
    if (cleared.every(Boolean) && !bankCleared.every(Boolean) && attempts.every((n) => n === 1)) {
      unlockBadge('safe-driver');
    }
  };

  const handleBucketLock = (correct: boolean) => {
    setBucketAttempts((n) => n + 1);
    if (correct && !bucketCleared) {
      setBucketCleared(true);
      addXP(20);
    }
  };

  const handleComplete = (score: number, perfectExplain: boolean) => {
    addXP(50 + score);
    unlockBadge('spin-doctor');
    if (perfectExplain) unlockBadge('sharp-shooter');
    completeModule('circular');
  };

  // "Try Again" hands back a fresh attempt, so the first-lock-in rewards are available again.
  const handleTryAgain = () => {
    setRadiusCm(DEFAULTS.radiusCm);
    setMu(DEFAULTS.mu);
    setMassG(DEFAULTS.massG);
    setRpmGuess(null);
    setPath(null);
    setPredictionLocked(false);
    setBankAttempts([0, 0, 0]);
    setBankCleared([false, false, false]);
    setBucketAttempts(0);
    setBucketCleared(false);
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <p className={styles.scenario}>
        A {massG} g coin sits {radiusCm} cm from the centre of a turntable (grip μₛ = {mu.toFixed(2)}). The turntable starts at rest and
        speeds up slowly.
      </p>

      <TurntableCanvas params={params} state={startState} view="room" />

      <details className={styles.moreInfo}>
        <summary>Change the coin or the turntable (optional)</summary>
        <div className={styles.sliders}>
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="circ-radius">Distance from the centre <span className="value">{radiusCm} cm</span></label>
            <input id="circ-radius" type="range" min="6" max="20" step="1" value={radiusCm} onChange={(e) => setRadiusCm(+e.target.value)} />
          </div>
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="circ-mu">Grip (μₛ) <span className="value">{mu.toFixed(2)}</span></label>
            <input id="circ-mu" type="range" min="0.2" max="0.8" step="0.05" value={mu} onChange={(e) => setMu(+e.target.value)} />
          </div>
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="circ-mass">Coin mass <span className="value">{massG} g</span></label>
            <input id="circ-mass" type="range" min="2" max="20" step="1" value={massG} onChange={(e) => setMassG(+e.target.value)} />
          </div>
        </div>
      </details>

      <div className={styles.questionCard}>
        <div className={styles.dialBlock}>
          <label className="slider-label" htmlFor="circ-dial">
            1. At what speed will the coin slip off? (within ±{RPM_TOLERANCE * 100}%)
            <span className="value">{rpmGuess === null ? 'move the dial' : `${rpmGuess} rpm`}</span>
          </label>
          <input
            id="circ-dial"
            type="range"
            min={DIAL_MIN}
            max={DIAL_MAX}
            step="1"
            value={rpmGuess ?? DIAL_MIN}
            onChange={(e) => setRpmGuess(+e.target.value)}
            aria-valuetext={rpmGuess === null ? 'no prediction yet' : `${rpmGuess} revolutions per minute`}
          />
        </div>

        <p className={styles.questionText}>2. Seen from the room, which way does it move the instant it lets go?</p>
        <div className={styles.predOptions} role="radiogroup" aria-label="Predicted path after release">
          {PATH_OPTIONS.map((option) => (
            <button
              key={option.id}
              className={`${styles.predBtn} ${path === option.id ? styles.predBtnActive : ''}`}
              onClick={() => setPath(option.id)}
              role="radio"
              aria-checked={path === option.id}
            >
              {option.label}
            </button>
          ))}
        </div>

        {rpmGuess !== null && path !== null ? (
          <button className="btn btn--primary" onClick={handleLockPrediction}>
            🔮 Lock In Predictions
          </button>
        ) : (
          <p className={styles.hint}>Answer both to lock in.</p>
        )}
      </div>
    </div>
  );

  const ObservePhase = (
    <ObserveStage
      params={params}
      rpmGuess={rpmGuess}
      path={path}
      games={{
        bank: { attempts: bankAttempts, cleared: bankCleared, onLock: handleBankLock },
        bucket: { attempts: bucketAttempts, cleared: bucketCleared, onLock: handleBucketLock },
      }}
    />
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <h2>🎡 Circular Motion Turntable</h2>
        <p>Spin a turntable until a coin lets go, then take a banked bend and swing a bucket over the top.</p>
      </div>

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Circular Motion"
          intro="Radians, rpm, and why turning needs a force toward the centre (but never an outward one)."
          sections={CIRCULAR_CONCEPTS}
        />
        <ConceptNotes
          variant="challenge"
          title="Circular Motion"
          intro="Calculus behind circular motion."
          sections={CIRCULAR_CHALLENGE}
        />
      </div>

      <POEShell
        moduleId="circular"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={CIRCULAR_EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
        onTryAgain={handleTryAgain}
        predictHint="Friction is the only sideways force on the coin, so friction has to supply the centripetal force: f = mω²r. Friction can give at most μmg. The coin slips when the force it needs equals the most friction can give: mω²r = μmg. What happens to m? Solve for ω in rad/s, then multiply by 60 ÷ 2π (about 9.55) to get rpm. For the path: after it lets go, what real force is left acting sideways on it?"
      />
    </div>
  );
}
