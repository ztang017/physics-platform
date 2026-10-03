import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import {
  type EnergyBars,
  type EnergyBarsGrade,
  type EnergyRampParams,
  type EnergyRampResult,
  type EnergySample,
  type EnergyTimeline,
  type RampOutcome,
  BAR_KEYS,
  BAR_STEP,
  BAR_TOLERANCE,
  computeEnergyRamp,
  expectedRestBars,
  firstRestTime,
  generateEnergyTimeline,
  gradeEnergyBars,
  sampleTimelineAt,
  rampLength,
  RAMP_ANGLE_DEG,
  PATCH_LENGTH,
  G,
} from '../../core/physics/energy';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { ENERGY_CONCEPTS, ENERGY_CHALLENGE } from './energyConcepts';
import styles from './EnergyModule.module.css';

export const ENERGY_EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'zero-work-carrying',
    question: 'You carry a heavy bag at a steady height and constant speed across a level room. How much work does your upward supporting force do on the bag?',
    options: [
      'A large positive amount — you are exerting a big force',
      'Zero — the force is perpendicular to the direction of motion',
      'A negative amount — the force opposes gravity',
      'Exactly mgh, the bag\'s weight times the height',
    ],
    correctIndex: 1,
    hint: 'Work = F·s·cosθ. What is the angle between your upward force and the horizontal direction the bag is moving?',
    explanation: 'The supporting force points straight up while the bag moves horizontally, so θ = 90° and cos 90° = 0. The force does zero work — effort and work are not the same thing in physics. The bag\'s height and speed never change, so its energy doesn\'t change either.',
  },
  {
    id: 'gravity-work-sign-falling',
    question: 'A ball falls straight down. What is the sign of the work done on it by gravity?',
    options: [
      'Negative, because the ball moves in the negative y-direction',
      'Positive, because gravity and the displacement both point downward',
      'Zero, because gravity is a constant force',
      'It depends on which direction you call positive',
    ],
    correctIndex: 1,
    hint: 'Ignore axes and signs for a moment. Is gravity pushing in the same direction the ball is moving, or against it? What would cos θ be for that angle?',
    explanation: 'Gravity pulls down and the ball moves down, so the angle between force and displacement is 0° and W = Fs·cos 0° = +mgh. The work is positive: gravity is speeding the ball up. Choosing which axis direction is "positive" changes the signs of both force and displacement together, so it can never change the sign of the work.',
  },
  {
    id: 'net-work-constant-speed',
    question: 'A crate is pushed across a rough floor at a constant speed. What is the total (net) work done on the crate?',
    options: [
      'Zero — the push and friction do equal and opposite work',
      'Positive, equal to the push times the distance',
      'Negative, equal to the work done by friction',
      'It cannot be found without knowing the crate\'s mass',
    ],
    correctIndex: 0,
    hint: 'Use the work-energy theorem: net work = change in kinetic energy. Did the crate\'s kinetic energy change while it moved at constant speed?',
    explanation: 'Constant speed means no change in kinetic energy, so the net work is zero. Your push does positive work, friction does an equal amount of negative work, and they cancel. The energy you supply doesn\'t vanish — it leaves as heat in the floor and the crate.',
  },
  {
    id: 'ke-doubling-speed',
    question: 'A car doubles its speed. What happens to its kinetic energy?',
    options: ['It doubles', 'It quadruples', 'It increases eightfold', 'It stays the same'],
    correctIndex: 1,
    hint: 'Look at the formula K = ½mv². How does K depend on v — linearly, or in some other way?',
    explanation: 'K = ½mv² depends on the SQUARE of the speed, so doubling v multiplies K by 2² = 4. This is why braking distance grows so fast with speed: the brakes must remove four times as much energy.',
  },
  {
    id: 'pe-reference',
    question: 'Two students lift the same book by 0.5 m. One measures height from the floor, the other from the tabletop. What do they find when they compare the CHANGE in the book\'s gravitational potential energy?',
    options: [
      'The changes are identical — only the change in U is physically meaningful',
      'The student measuring from the floor finds a larger change',
      'The student measuring from the tabletop finds a larger change',
      'The changes can\'t be compared at all',
    ],
    correctIndex: 0,
    hint: 'ΔU = mgΔy. Does the change in height Δy depend on where you decided zero height is?',
    explanation: 'Moving the zero level shifts every height by the same amount, which cancels in Δy. Both students get ΔU = mg(0.5 m). Only changes in potential energy have physical meaning, so you are free to put the zero wherever makes the problem easiest.',
  },
  {
    id: 'spring-stretch-doubling',
    question: 'A spring is stretched 2 cm, storing some elastic energy. If it is stretched 4 cm instead, the stored energy becomes:',
    options: ['Twice as much', 'Four times as much', 'The same', 'Eight times as much'],
    correctIndex: 1,
    hint: 'The formula is U = ½kx². Is the extension x squared, or just multiplied?',
    explanation: 'U = ½kx² depends on the square of the extension, so doubling x multiplies U by 4. (Physically: the spring pushes back harder the further it is stretched, so each extra centimetre costs more work than the last.)',
  },
  {
    id: 'ramp-shape-same-speed',
    question: 'Two frictionless slides start at the same height. Slide A is a steep straight ramp; slide B is a long, gently curving one. A child slides down each from rest. How do the child\'s speeds at the bottom compare?',
    options: [
      'They are exactly the same',
      'Slide A gives the higher speed',
      'Slide B gives the higher speed',
      'It depends on the child\'s mass',
    ],
    correctIndex: 0,
    hint: 'Gravity is a conservative force. What does that say about how the energy gained depends on the path taken between the same two heights?',
    explanation: 'Gravity is conservative, so the energy converted depends only on the height dropped: mgh = ½mv², giving v = √(2gh) for both slides. Mass cancels, and so does the shape of the path. The long gentle slide takes more TIME, but the speed at the bottom is identical.',
  },
  {
    id: 'friction-heat',
    question: 'As the block slides across the rough patch it loses mechanical energy. Where does that energy go?',
    options: [
      'It is destroyed — energy is not conserved when friction acts',
      'It becomes thermal energy of the block and the surface; total energy is still conserved',
      'It is stored in the ramp as potential energy',
      'It is transferred to the spring',
    ],
    correctIndex: 1,
    hint: 'Friction is a non-conservative force. Think about what you feel if you rub your hands together hard — what has happened to the surfaces?',
    explanation: 'Friction converts mechanical energy into thermal energy, warming the block and the patch. Mechanical energy (K + U) drops, but the total energy — including the heat — is always conserved. In the simulation you can watch the heat bar grow by exactly what the other bars lose.',
  },
  {
    id: 'energy-chart-total',
    question: 'In an energy bar chart for the block sliding over the rough patch, the kinetic-energy bar has shrunk by 30% of the starting energy mgh. For the chart to stay balanced, what must have happened to the other bars?',
    options: [
      'Nothing — friction destroys that energy',
      'The heat bar has grown by 30% of mgh',
      'The gravitational bar has grown by 30% of mgh',
      'The spring bar has grown by 30% of mgh',
    ],
    correctIndex: 1,
    hint: 'The block is on a flat patch, so its height is not changing and it has not reached the spring. Friction is acting. Where does the energy friction removes from the motion end up?',
    explanation: 'Energy is conserved, so the bars must always add up to the starting energy. The block is level (no change in Ug) and not touching the spring, so the 30% that left the kinetic bar was converted by friction into thermal energy: the heat bar grows by exactly 30% of mgh. Friction moves energy between bars; it never makes it vanish.',
  },
  {
    id: 'incline-energy-calc',
    question: 'A crate slides from rest down a rough 5 m long incline at 30° with kinetic friction μₖ = 0.2. Using energy methods (g = 10 m/s², cos 30° ≈ 0.87), what is its speed at the bottom?',
    options: ['5.7 m/s', '7.1 m/s', '4.0 m/s', '10 m/s'],
    correctIndex: 0,
    hint: 'Write the energy balance: ½mv² = mgh − (friction force) × (distance along the slope). The drop in height is 5 × sin 30°, and friction is μₖ·mg·cos 30°. The mass cancels.',
    explanation: 'The height dropped is 5 sin 30° = 2.5 m, so gravity supplies mg(2.5) = 25m joules. Friction removes μₖmg cos 30° × 5 ≈ 8.7m joules. So ½mv² = (25 − 8.7)m, giving v² ≈ 32.6 and v ≈ 5.7 m/s. Ignoring friction would give √(2·10·2.5) ≈ 7.1 m/s — noticeably too fast. Energy did it in one line, with no need to resolve forces along the slope or find an acceleration.',
  },
  {
    id: 'stopping-distance-calc',
    question: 'A block is released from rest 0.6 m above a flat, rough floor by way of a smooth ramp. The floor has μ = 0.3. How far does the block slide along the floor before it stops?',
    options: ['2.0 m', '0.6 m', '1.8 m', '0.18 m'],
    correctIndex: 0,
    hint: 'The block stops when friction has removed all of its starting energy mgh. Friction removes μmg for every metre it slides, so μmg × s = mgh. Notice what cancels.',
    explanation: 'Setting the energy friction removes equal to the energy the block started with: μmg·s = mgh. The m and g cancel, leaving s = h/μ = 0.6/0.3 = 2.0 m. The answer doesn\'t depend on the block\'s mass at all — a heavier block has more energy but is also pushed back harder by friction.',
  },
  {
    id: 'power-lift-calc',
    question: 'A motor lifts a 50 kg crate 2 m at constant speed in 4 s (g = 10 m/s²). What power does the motor deliver?',
    options: ['250 W', '1000 W', '125 W', '4000 W'],
    correctIndex: 0,
    hint: 'Power = work ÷ time. At constant speed the motor just supplies the energy the crate gains: its gravitational potential energy mgh.',
    explanation: 'The work done is mgh = 50 × 10 × 2 = 1000 J, delivered over 4 s, so P = W/t = 1000/4 = 250 W. (1000 is the energy in joules, not the power.)',
  },
];

// ─── Scene geometry ───────────────────────────────────────────────────────────
const W = 600, H = 250;
const SCALE = 50;                     // pixels per metre
const FOOT_X = 5.6 * SCALE;           // x-pixel of the foot of the ramp (fixed so the patch never jumps)
const GROUND_Y = H - 40;
const THETA = (RAMP_ANGLE_DEG * Math.PI) / 180;
const SPRING_NATURAL = 3.2;           // metres from the end of the patch to the spring's wall
const BLOCK_W = 0.7 * SCALE;
const BLOCK_H = 0.52 * SCALE;
const BLEND_M = 0.6;                  // the block eases onto the flat over its last 0.6 m of ramp

const COLOR = {
  kinetic: '#16a34a',
  gravitational: '#4f46e5',
  elastic: '#b45309',
  heat: '#dc2626',
  block: '#4f46e5',
  ramp: '#eef1f7',
  rampLine: '#8890a3',
  text: 'rgba(23,27,38,0.6)',
};

// The mini-game: park the block inside this stretch of the patch. The friction
// is fixed so the answer is a clean h = μ·s, whatever the block's mass.
interface StopZone { mu: number; from: number; to: number }
const STOP_ZONE: StopZone = { mu: 0.5, from: 1.2, to: 1.8 };

const OUTCOME_LABEL: Record<RampOutcome, string> = {
  'stops-before-spring': 'It stops on the rough patch, before reaching the spring',
  'stops-after-rebound': 'It bounces off the spring, then stops on the rough patch',
  'returns-up-ramp': 'It bounces back and climbs up the ramp again',
};
const OUTCOME_ORDER: RampOutcome[] = ['stops-before-spring', 'stops-after-rebound', 'returns-up-ramp'];

function blockPose(sample: EnergySample, rampLen: number) {
  if (sample.u < rampLen) {
    const back = rampLen - sample.u;
    return {
      x: FOOT_X - back * Math.cos(THETA) * SCALE,
      y: GROUND_Y - back * Math.sin(THETA) * SCALE,
      angle: THETA * Math.min(1, back / BLEND_M),
    };
  }
  return { x: FOOT_X + (sample.u - rampLen) * SCALE, y: GROUND_Y, angle: 0 };
}

function drawScene(ctx: CanvasRenderingContext2D, params: EnergyRampParams, sample: EnergySample, zone?: StopZone) {
  const rampLen = rampLength(params.height);
  const run = rampLen * Math.cos(THETA) * SCALE;
  const rise = params.height * SCALE;
  const patchStartX = FOOT_X;
  const patchEndX = FOOT_X + PATCH_LENGTH * SCALE;
  const wallX = patchEndX + SPRING_NATURAL * SCALE;

  ctx.clearRect(0, 0, W, H);

  // Floor
  ctx.fillStyle = '#e2e5ee';
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.strokeStyle = COLOR.rampLine;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, GROUND_Y); ctx.lineTo(W, GROUND_Y); ctx.stroke();

  // Ramp (smooth)
  ctx.fillStyle = COLOR.ramp;
  ctx.strokeStyle = '#c7ccdb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(FOOT_X - run, GROUND_Y - rise);
  ctx.lineTo(FOOT_X, GROUND_Y);
  ctx.lineTo(FOOT_X - run, GROUND_Y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = COLOR.rampLine;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(FOOT_X - run, GROUND_Y - rise); ctx.lineTo(FOOT_X, GROUND_Y); ctx.stroke();

  // Release-height marker
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(79,70,229,0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(FOOT_X - run, GROUND_Y - rise); ctx.lineTo(FOOT_X - run, GROUND_Y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = COLOR.gravitational;
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`h = ${params.height.toFixed(1)} m`, Math.max(4, FOOT_X - run + 6), GROUND_Y - rise / 2);

  // Rough patch
  ctx.fillStyle = 'rgba(180,83,9,0.14)';
  ctx.fillRect(patchStartX, GROUND_Y - 5, patchEndX - patchStartX, 5);
  ctx.strokeStyle = 'rgba(180,83,9,0.55)';
  ctx.lineWidth = 1.5;
  for (let x = patchStartX; x < patchEndX; x += 7) {
    ctx.beginPath(); ctx.moveTo(x, GROUND_Y); ctx.lineTo(x + 4, GROUND_Y - 5); ctx.stroke();
  }
  ctx.fillStyle = COLOR.elastic;
  ctx.textAlign = 'center';
  ctx.fillText(`rough patch  μ = ${params.mu.toFixed(2)}`, (patchStartX + patchEndX) / 2, GROUND_Y + 16);

  // Stop Zone (mini-game): a green band on the patch showing where to park the block
  if (zone) {
    const zx = patchStartX + zone.from * SCALE;
    const zw = (zone.to - zone.from) * SCALE;
    ctx.fillStyle = 'rgba(22,163,74,0.2)';
    ctx.fillRect(zx, GROUND_Y - 34, zw, 34);
    ctx.setLineDash([4, 3]);
    ctx.strokeStyle = COLOR.kinetic;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(zx, GROUND_Y - 34, zw, 34);
    ctx.setLineDash([]);
    ctx.fillStyle = COLOR.kinetic;
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('STOP ZONE', zx + zw / 2, GROUND_Y - 40);
  }

  // Block
  const pose = blockPose(sample, rampLen);

  // Spring: anchored to the wall, its free end is where the block's right edge first touches it
  const freeEndX = patchEndX + BLOCK_W / 2;
  const blockRightX = pose.x + BLOCK_W / 2;
  const springEndX = Math.max(freeEndX, blockRightX);
  const springY = GROUND_Y - BLOCK_H / 2;
  ctx.fillStyle = '#8890a3';
  ctx.fillRect(wallX, GROUND_Y - 42, 6, 42);
  ctx.strokeStyle = COLOR.elastic;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wallX, springY);
  const coils = 12;
  for (let i = 1; i <= coils; i++) {
    const px = wallX - ((wallX - springEndX) * i) / (coils + 1);
    ctx.lineTo(px, springY + (i % 2 === 0 ? 7 : -7));
  }
  ctx.lineTo(springEndX, springY);
  ctx.stroke();
  ctx.fillStyle = COLOR.elastic;
  ctx.textAlign = 'center';
  ctx.fillText(`spring k = ${params.k} N/m`, wallX - 60, GROUND_Y - 50);

  ctx.save();
  ctx.translate(pose.x, pose.y);
  ctx.rotate(pose.angle);
  ctx.fillStyle = 'rgba(79,70,229,0.16)';
  ctx.strokeStyle = COLOR.block;
  ctx.lineWidth = 2;
  ctx.fillRect(-BLOCK_W / 2, -BLOCK_H, BLOCK_W, BLOCK_H);
  ctx.strokeRect(-BLOCK_W / 2, -BLOCK_H, BLOCK_W, BLOCK_H);
  ctx.fillStyle = COLOR.block;
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${params.mass}kg`, 0, -BLOCK_H / 2 + 3);
  ctx.restore();

  // Readout
  ctx.fillStyle = 'rgba(23,27,38,0.75)';
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(`t = ${sample.t.toFixed(2)} s`, 8, 18);
  ctx.fillText(`v = ${Math.abs(sample.v).toFixed(2)} m/s`, 8, 34);
  ctx.fillStyle = COLOR.text;
  ctx.font = '12px JetBrains Mono, monospace';
  ctx.fillText(`smooth ramp ${RAMP_ANGLE_DEG}°`, 8, 50);
}

function EnergyCanvas({ params, sample, zone }: { params: EnergyRampParams; sample: EnergySample; zone?: StopZone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawScene(ctx, params, sample, zone);
  }, [params, sample, zone]);

  // The hook wipes the canvas whenever layout changes its size (e.g. late in
  // a hard page load), so it repaints via onResize rather than staying blank.
  useHiDPICanvas(canvasRef, W, H, draw);

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-label="Energy ramp: a block on a smooth ramp, a rough patch, and a spring bumper"
      role="img"
    />
  );
}

// ─── Live energy ledger ───────────────────────────────────────────────────────
const LEDGER_ROWS: { key: 'kinetic' | 'gravitational' | 'elastic' | 'heat'; label: string; color: string }[] = [
  { key: 'kinetic', label: 'Kinetic  K', color: COLOR.kinetic },
  { key: 'gravitational', label: 'Gravitational  U', color: COLOR.gravitational },
  { key: 'elastic', label: 'Spring  U', color: COLOR.elastic },
  { key: 'heat', label: 'Heat (friction)', color: COLOR.heat },
];

function EnergyLedger({ sample, totalEnergy }: { sample: EnergySample; totalEnergy: number }) {
  const sum = sample.kinetic + sample.gravitational + sample.elastic + sample.heat;
  return (
    <div className={styles.ledger} role="group" aria-label="Energy ledger: where the block's energy is right now">
      <h4>Energy ledger</h4>
      {LEDGER_ROWS.map(({ key, label, color }) => {
        const value = sample[key];
        const pct = totalEnergy > 0 ? Math.min(100, (value / totalEnergy) * 100) : 0;
        return (
          <div className={styles.ledgerRow} key={key}>
            <span className={styles.ledgerLabel}>{label}</span>
            <div className={styles.ledgerTrack} aria-hidden="true">
              <div className={styles.ledgerFill} style={{ width: `${pct}%`, background: color }} />
            </div>
            <strong className={styles.ledgerValue}>{value.toFixed(1)} J</strong>
          </div>
        );
      })}
      <div className={`${styles.ledgerRow} ${styles.ledgerTotal}`}>
        <span className={styles.ledgerLabel}>Total</span>
        <span className={styles.ledgerTotalNote}>always equals mgh</span>
        <strong className={styles.ledgerValue}>{sum.toFixed(1)} J</strong>
      </div>
    </div>
  );
}

// ─── Shared playback (drives the main replay and the mini-game) ──────────────
function useTimelinePlayback(timeline: EnergyTimeline, autoplay: boolean) {
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
      elapsedRef.current = Math.min(timeline.duration, elapsedRef.current + dt * (slowMo ? 0.25 : 1));
      setElapsed(elapsedRef.current);
      if (elapsedRef.current >= timeline.duration) setPlaying(false);
      else raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, slowMo, timeline.duration]);

  const sample = useMemo(() => sampleTimelineAt(timeline, elapsed), [timeline, elapsed]);
  const finished = elapsed >= timeline.duration;

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

  return { elapsed, playing, setPlaying, slowMo, setSlowMo, sample, finished, seek, replay };
}

// ─── Energy bar chart builder (Predict) ──────────────────────────────────────
const BAR_META: Record<keyof EnergyBars, { label: string; short: string; color: string }> = {
  kinetic: { label: 'Kinetic', short: 'K', color: COLOR.kinetic },
  gravitational: { label: 'Gravitational', short: 'Ug', color: COLOR.gravitational },
  elastic: { label: 'Spring', short: 'Us', color: COLOR.elastic },
  heat: { label: 'Heat', short: 'Q', color: COLOR.heat },
};
const EMPTY_BARS: EnergyBars = { kinetic: 0, gravitational: 0, elastic: 0, heat: 0 };
const RELEASE_BARS: EnergyBars = { kinetic: 0, gravitational: 100, elastic: 0, heat: 0 };

function BarColumn({
  id,
  value,
  totalEnergy,
  onChange,
}: {
  id: keyof EnergyBars;
  value: number;
  totalEnergy: number;
  /** Omit for a read-only bar. */
  onChange?: (id: keyof EnergyBars, percent: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const meta = BAR_META[id];
  const joules = (value / 100) * totalEnergy;

  const setFromPointer = (clientY: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    // An unmeasured track would divide by zero and poison the value with NaN.
    if (!rect || rect.height === 0) return;
    const raw = ((rect.bottom - clientY) / rect.height) * 100;
    if (!Number.isFinite(raw)) return;
    onChange?.(id, Math.max(0, Math.min(100, Math.round(raw / BAR_STEP) * BAR_STEP)));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!onChange) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    setFromPointer(e.clientY);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) setFromPointer(e.clientY);
  };
  const handlePointerEnd = () => { dragging.current = false; };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onChange) return;
    const next: Record<string, number> = {
      ArrowUp: value + BAR_STEP,
      ArrowRight: value + BAR_STEP,
      ArrowDown: value - BAR_STEP,
      ArrowLeft: value - BAR_STEP,
      PageUp: value + 25,
      PageDown: value - 25,
      Home: 0,
      End: 100,
    };
    if (e.key in next) {
      e.preventDefault();
      onChange(id, Math.max(0, Math.min(100, next[e.key])));
    }
  };

  return (
    <div className={styles.barCol}>
      <div
        ref={trackRef}
        className={`${styles.barTrack} ${onChange ? '' : styles.barTrackLocked}`}
        role={onChange ? 'slider' : 'img'}
        tabIndex={onChange ? 0 : undefined}
        aria-label={`${meta.label} energy bar`}
        aria-orientation={onChange ? 'vertical' : undefined}
        aria-valuemin={onChange ? 0 : undefined}
        aria-valuemax={onChange ? 100 : undefined}
        aria-valuenow={onChange ? value : undefined}
        aria-valuetext={`${value}% of the starting energy, ${joules.toFixed(1)} joules`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {[25, 50, 75].map((g) => (
          <span key={g} className={styles.barGrid} style={{ bottom: `${g}%` }} aria-hidden="true" />
        ))}
        <div className={styles.barFill} style={{ height: `${value}%`, background: meta.color }} />
      </div>
      <span className={styles.barValue}>{value}%</span>
      <span className={styles.barJoules}>{joules.toFixed(1)} J</span>
      <span className={styles.barName} style={{ color: meta.color }}>{meta.short}</span>
    </div>
  );
}

function EnergyBarBuilder({
  bars,
  totalEnergy,
  onChange,
  onReset,
}: {
  bars: EnergyBars;
  totalEnergy: number;
  onChange: (id: keyof EnergyBars, percent: number) => void;
  onReset: () => void;
}) {
  const total = BAR_KEYS.reduce((sum, k) => sum + bars[k], 0);
  return (
    <div className={styles.chartBuilder}>
      <h4>📊 Energy accounting <span className={styles.optionalTag}>optional · +20 XP and a badge</span></h4>
      <p className={styles.hint}>
        Every bar is a share of the energy the block starts with. On the left is the chart at release (given). On the right, build
        the chart for the <strong>first moment the block is momentarily at rest</strong> — at the spring's maximum squash, or
        wherever it stops on the patch. Drag a bar, or focus it and use the arrow keys.
      </p>
      <div className={styles.chartPair}>
        <div className={styles.chartPanel}>
          <h5>At release (given)</h5>
          <div className={styles.barRow}>
            {BAR_KEYS.map((k) => <BarColumn key={k} id={k} value={RELEASE_BARS[k]} totalEnergy={totalEnergy} />)}
          </div>
        </div>
        <div className={styles.chartPanel}>
          <h5>First moment at rest (yours)</h5>
          <div className={styles.barRow}>
            {BAR_KEYS.map((k) => <BarColumn key={k} id={k} value={bars[k]} totalEnergy={totalEnergy} onChange={onChange} />)}
          </div>
        </div>
      </div>
      <div className={styles.chartFooter}>
        <span className={styles.chartSum} data-balanced={total === 100}>
          Your bars add up to {total}% of mgh {total === 100 ? '✓ balanced' : '— energy is conserved, so they must match the left chart'}
        </span>
        <button className="btn btn--secondary" onClick={onReset} disabled={total === 0}>↺ Reset bars</button>
      </div>
    </div>
  );
}

// ─── Chart-vs-actual comparison (Observe) ────────────────────────────────────
type ChartOutcome = 'none' | 'earned' | 'missed';

function ChartComparison({
  student,
  expected,
  grade,
  outcome,
  onJump,
}: {
  student: EnergyBars;
  expected: EnergyBars;
  grade: EnergyBarsGrade | null;
  outcome: ChartOutcome;
  onJump: () => void;
}) {
  return (
    <div className={styles.comparison} role="group" aria-label="Your energy chart compared with the real one">
      <h4>📊 Energy chart check — the first moment at rest</h4>
      {grade === null && (
        <p className={styles.hint}>You skipped the optional energy chart. The real chart is below — try building one next time to earn the Energy Accountant badge.</p>
      )}
      {grade?.isCorrect && (
        <p className={styles.verdictGood}>
          ✓ Your chart matches: every bar is within ±{BAR_TOLERANCE}% of mgh.
          {outcome === 'earned' && ' 🏆 Energy Accountant earned (+20 XP).'}
        </p>
      )}
      {grade && !grade.isCorrect && (
        <div className={styles.verdictBad}>
          <p><strong>Not quite — score {grade.score}%.</strong>{outcome === 'missed' && ' (The badge goes to your first graded attempt.)'}</p>
          <ul>
            {grade.errors.map((e) => (
              <li key={e.bar}>{BAR_META[e.bar].label}: you set {e.actual}%, the real value is about {Math.round(e.expected)}%</li>
            ))}
            {!grade.balanced && <li>Your bars added up to {grade.total}% — they should always add up to 100% of mgh.</li>}
          </ul>
        </div>
      )}
      <div className={styles.compareList}>
        {BAR_KEYS.map((k) => (
          <div className={styles.compareRow} key={k}>
            <span className={styles.compareLabel} style={{ color: BAR_META[k].color }}>{BAR_META[k].label}</span>
            <div className={styles.compareTracks} aria-hidden="true">
              {grade !== null && (
                <div className={styles.compareTrack}>
                  <div className={styles.compareYou} style={{ width: `${student[k]}%`, borderColor: BAR_META[k].color }} />
                </div>
              )}
              <div className={styles.compareTrack}>
                <div className={styles.compareFill} style={{ width: `${expected[k]}%`, background: BAR_META[k].color }} />
              </div>
            </div>
            <strong className={styles.compareNums}>{grade !== null ? `${student[k]}% vs ` : ''}{Math.round(expected[k])}%</strong>
          </div>
        ))}
      </div>
      <p className={styles.hint}>{grade !== null ? 'Outlined bar = your chart · solid bar = the real one' : 'Solid bars = the real chart'}</p>
      <button className="btn btn--secondary" onClick={onJump}>⏭ Jump to that moment in the replay</button>
    </div>
  );
}

// ─── Stop Zone mini-game (Observe) ───────────────────────────────────────────
function StopZoneRun({
  params,
  timeline,
  released,
  result,
  inZone,
}: {
  params: EnergyRampParams;
  timeline: EnergyTimeline;
  released: boolean;
  result: EnergyRampResult;
  inZone: boolean;
}) {
  const playback = useTimelinePlayback(timeline, released);
  const stop = result.stopPosition;

  let verdict: string;
  if (inZone) {
    verdict = `✅ Parked! It stopped ${stop!.toFixed(2)} m along the patch, inside the zone.`;
  } else if (result.outcome !== 'stops-before-spring') {
    verdict = '💥 Too much energy: it crossed the whole patch and hit the spring. Release it from lower down.';
  } else {
    verdict = `It stopped ${stop!.toFixed(2)} m along the patch — ${stop! < STOP_ZONE.from ? 'short of' : 'past'} the zone (${STOP_ZONE.from}–${STOP_ZONE.to} m). ${stop! < STOP_ZONE.from ? 'It needs more energy.' : 'It had too much energy.'}`;
  }

  return (
    <>
      <EnergyCanvas params={params} sample={playback.sample} zone={STOP_ZONE} />
      {released && playback.finished && (
        <p className={inZone ? styles.verdictGood : styles.verdictBad} role="status">{verdict}</p>
      )}
    </>
  );
}

function StopZoneGame({
  attempts,
  cleared,
  onRelease,
}: {
  attempts: number;
  cleared: boolean;
  onRelease: (success: boolean) => void;
}) {
  const [mass, setMass] = useState(2);
  const [height, setHeight] = useState(1.0);
  // null = nothing released yet for the current settings; each release bumps it
  // so the run (and its animation) restarts, even with unchanged sliders.
  const [run, setRun] = useState<number | null>(null);

  const params = useMemo(() => ({ mass, height, mu: STOP_ZONE.mu, k: 200 }), [mass, height]);
  const result = useMemo(() => computeEnergyRamp(params), [params]);
  const timeline = useMemo(() => generateEnergyTimeline(params), [params]);
  const inZone =
    result.outcome === 'stops-before-spring' &&
    result.stopPosition !== null &&
    result.stopPosition >= STOP_ZONE.from &&
    result.stopPosition <= STOP_ZONE.to;

  const release = () => {
    onRelease(inZone);
    setRun((r) => (r ?? 0) + 1);
  };

  return (
    <div className={styles.gameCard}>
      <div className={styles.gameHeader}>
        <span className={styles.gameIcon}>🅿️</span>
        <div>
          <h4>Stop Zone Challenge</h4>
          <p>
            Friction on the patch is fixed at <strong>μ = {STOP_ZONE.mu.toFixed(2)}</strong>. Choose a release height so the block comes
            to rest inside the green zone, <strong>{STOP_ZONE.from}–{STOP_ZONE.to} m</strong> along the patch. Work it out with energy
            rather than guessing — the badge goes to a first-release success.
          </p>
        </div>
      </div>

      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="zone-height">Release height (h) <span className="value">{height.toFixed(2)} m</span></label>
          <input id="zone-height" type="range" min="0.5" max="3" step="0.05" value={height}
            onChange={(e) => { setHeight(+e.target.value); setRun(null); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="zone-mass">Block mass (m) <span className="value">{mass} kg</span></label>
          <input id="zone-mass" type="range" min="1" max="5" step="0.5" value={mass}
            onChange={(e) => { setMass(+e.target.value); setRun(null); }} />
        </div>
      </div>

      <StopZoneRun
        key={`${mass}-${height}-${run ?? 'idle'}`}
        params={params}
        timeline={timeline}
        released={run !== null}
        result={result}
        inZone={inZone}
      />

      <div className={styles.playRow}>
        <button className="btn btn--primary" onClick={release}>🚀 Release!</button>
        <span className={styles.gameStatus}>
          Releases so far: <strong>{attempts}</strong>{cleared && ' · ✅ Zone cleared'}
        </span>
      </div>
      {attempts > 0 && !cleared && (
        <p className={styles.hint}>
          💡 The block stops when friction has used up <em>all</em> of its starting energy: μmg × s = mgh. Solve for the height h that
          makes s land in the zone — and notice what happens to the mass.
        </p>
      )}
    </div>
  );
}

// ─── Observe stage: playback + live ledger ────────────────────────────────────
function EnergyStage({
  params,
  result,
  timeline,
  predicted,
  studentBars,
  expectedBars,
  chartGrade,
  chartOutcome,
  stopZone,
}: {
  params: EnergyRampParams;
  result: EnergyRampResult;
  timeline: EnergyTimeline;
  predicted: RampOutcome | null;
  studentBars: EnergyBars;
  expectedBars: EnergyBars;
  chartGrade: EnergyBarsGrade | null;
  chartOutcome: ChartOutcome;
  stopZone: { attempts: number; cleared: boolean; onRelease: (success: boolean) => void };
}) {
  const playback = useTimelinePlayback(timeline, true);
  const { sample, elapsed, playing, finished, slowMo } = playback;

  const fmt = (v: number, unit: string, show = true) => (show ? `${v.toFixed(2)} ${unit}` : '—');
  const reached = result.outcome !== 'stops-before-spring';

  return (
    <div className={styles.observeWrap}>
      {predicted && (
        <div className={styles.predictionFeedback}>
          <span>Your prediction:</span>
          <strong className={predicted === result.outcome ? 'text-green' : 'text-amber'}>
            {predicted === result.outcome ? '✓ Correct' : '✗ Not quite'}
          </strong>
          <span className={styles.actualOutcome}>Actual: {OUTCOME_LABEL[result.outcome]}</span>
        </div>
      )}

      <EnergyCanvas params={params} sample={sample} />

      <div className={styles.scrubberWrap}>
        <div className={styles.playRow}>
          <button
            className={`btn ${playing ? 'btn--secondary' : 'btn--primary'}`}
            onClick={() => (playing ? playback.setPlaying(false) : finished ? playback.replay() : playback.setPlaying(true))}
          >
            {playing ? '⏸ Pause' : finished ? '↺ Replay' : '▶ Play'}
          </button>
          <button
            className="btn btn--secondary"
            onClick={() => playback.setSlowMo((s) => !s)}
            aria-pressed={slowMo}
          >
            🐢 Slow motion {slowMo ? 'on' : 'off'}
          </button>
        </div>
        <label className="slider-label" htmlFor="energy-scrubber">
          ⏱ Scrub through the trip
          <span className="value">{sample.region === 'ramp' ? 'On the ramp' : sample.region === 'patch' ? 'On the rough patch' : 'Squashing the spring'}</span>
        </label>
        <input
          id="energy-scrubber"
          type="range"
          min={0}
          max={timeline.duration}
          step={0.01}
          value={elapsed}
          onChange={(e) => playback.seek(parseFloat(e.target.value))}
          aria-label="Scrub through the block's trip"
        />
      </div>

      <EnergyLedger sample={sample} totalEnergy={result.totalEnergy} />

      <ChartComparison
        student={studentBars}
        expected={expectedBars}
        grade={chartGrade}
        outcome={chartOutcome}
        onJump={() => playback.seek(firstRestTime(timeline))}
      />

      <div className={styles.readoutsGrid}>
        <div className={styles.readout}><span>Energy at release (mgh)</span><strong className="text-cyan">{fmt(result.totalEnergy, 'J')}</strong></div>
        <div className={styles.readout}><span>Cost of one crossing</span><strong className="text-amber">{fmt(result.frictionCostPerCrossing, 'J')}</strong></div>
        <div className={styles.readout}><span>Speed at foot of ramp</span><strong className="text-green">{fmt(result.speedAtBottom, 'm/s')}</strong></div>
        <div className={styles.readout}><span>Speed reaching spring</span><strong className="text-green">{fmt(result.speedAtSpring, 'm/s', reached)}</strong></div>
        <div className={styles.readout}><span>Max spring squash</span><strong className="text-amber">{fmt(result.maxCompression, 'm', reached)}</strong></div>
        <div className={styles.readout}><span>Heat produced</span><strong className="text-amber">{fmt(result.heatDissipated, 'J')}</strong></div>
        {result.stopPosition !== null && (
          <div className={styles.readout}><span>Stops on patch at</span><strong className="text-cyan">{fmt(result.stopPosition, 'm')}</strong></div>
        )}
        {result.outcome === 'returns-up-ramp' && (
          <div className={styles.readout}><span>Climbs back to</span><strong className="text-cyan">{fmt(result.returnHeight, 'm')}</strong></div>
        )}
      </div>

      <FormulaPanel
        title="Work–Energy Equations"
        formulas={[
          { label: 'Kinetic', latex: 'K = \\tfrac{1}{2}mv^2', liveValue: `= ${sample.kinetic.toFixed(1)} J`, accentColor: 'green' },
          { label: 'Gravitational', latex: 'U_g = mgy', liveValue: `= ${sample.gravitational.toFixed(1)} J`, accentColor: 'violet' },
          { label: 'Spring', latex: 'U_s = \\tfrac{1}{2}kx^2', liveValue: `= ${sample.elastic.toFixed(1)} J`, accentColor: 'amber' },
          { label: 'Friction', latex: 'Q = \\mu mg \\times (\\text{distance on patch})', liveValue: `= ${sample.heat.toFixed(1)} J`, accentColor: 'amber' },
          { label: 'Conservation', latex: 'K + U_g + U_s + Q = mgh', liveValue: `mgh = ${result.totalEnergy.toFixed(1)} J`, accentColor: 'cyan' },
        ]}
      />

      <StopZoneGame attempts={stopZone.attempts} cleared={stopZone.cleared} onRelease={stopZone.onRelease} />
    </div>
  );
}

// ─── Main Energy Module ───────────────────────────────────────────────────────
const DEFAULTS = { mass: 2, height: 2, mu: 0.4, k: 200 };

export function EnergyModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();

  const [mass, setMass] = useState(DEFAULTS.mass);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [mu, setMu] = useState(DEFAULTS.mu);
  const [k, setK] = useState(DEFAULTS.k);
  const [predicted, setPredicted] = useState<RampOutcome | null>(null);
  const [predictionLocked, setPredictionLocked] = useState(false);
  const [bars, setBars] = useState<EnergyBars>(EMPTY_BARS);
  // 'none' until the chart is first graded; only that first graded attempt can
  // earn the badge, whether or not it was right.
  const [chartOutcome, setChartOutcome] = useState<ChartOutcome>('none');
  const [stopAttempts, setStopAttempts] = useState(0);
  const [stopCleared, setStopCleared] = useState(false);

  const params: EnergyRampParams = useMemo(() => ({ mass, height, mu, k }), [mass, height, mu, k]);
  const result = useMemo(() => computeEnergyRamp(params), [params]);
  const timeline = useMemo(() => generateEnergyTimeline(params), [params]);
  const startSample = timeline.samples[0];
  const expectedBars = useMemo(() => expectedRestBars(result), [result]);
  const chartAttempted = BAR_KEYS.some((key) => bars[key] > 0);
  const chartGrade = useMemo(
    () => (chartAttempted ? gradeEnergyBars(bars, expectedBars) : null),
    [chartAttempted, bars, expectedBars],
  );

  const handleBarChange = (id: keyof EnergyBars, percent: number) => {
    setBars((prev) => ({ ...prev, [id]: percent }));
  };

  const handleLockPrediction = () => {
    // Only award XP the first time — if the student uses Back to revisit
    // Predict and re-locks, this must stay a no-op for scoring purposes.
    if (!predictionLocked) { addXP(10); setPredictionLocked(true); }
    // The chart is a prediction too, graded once, the first time it's locked in.
    if (chartGrade && chartOutcome === 'none') {
      if (chartGrade.isCorrect) {
        setChartOutcome('earned');
        addXP(20);
        unlockBadge('energy-accountant');
      } else {
        setChartOutcome('missed');
      }
    }
    setPOEPhase('observe');
  };

  const handleStopRelease = (success: boolean) => {
    const firstRelease = stopAttempts === 0;
    setStopAttempts((n) => n + 1);
    if (success && !stopCleared) {
      setStopCleared(true);
      addXP(30);
      if (firstRelease) unlockBadge('perfect-parking');
    }
  };

  const handleComplete = (score: number, perfectExplain: boolean) => {
    addXP(50 + score);
    unlockBadge('energy-architect');
    if (perfectExplain) unlockBadge('sharp-shooter');
    completeModule('energy');
  };

  // "Try Again" hands back a fresh attempt — without this, a stale
  // predictionLocked flag would make the +10 XP for predicting unreachable.
  const handleTryAgain = () => {
    setMass(DEFAULTS.mass);
    setHeight(DEFAULTS.height);
    setMu(DEFAULTS.mu);
    setK(DEFAULTS.k);
    setPredicted(null);
    setPredictionLocked(false);
    setBars(EMPTY_BARS);
    setChartOutcome('none');
    setStopAttempts(0);
    setStopCleared(false);
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="en-height">Release height (h) <span className="value">{height.toFixed(1)} m</span></label>
          <input id="en-height" type="range" min="0.5" max="3" step="0.1" value={height} onChange={(e) => setHeight(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="en-mu">
            Friction on the rough patch (μ)
            <span className="value">{mu === 0 ? 'none' : mu.toFixed(2)}</span>
          </label>
          <input id="en-mu" type="range" min="0" max="0.6" step="0.05" value={mu} onChange={(e) => setMu(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="en-mass">Block mass (m) <span className="value">{mass} kg</span></label>
          <input id="en-mass" type="range" min="1" max="5" step="0.5" value={mass} onChange={(e) => setMass(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="en-k">Spring constant (k) <span className="value">{k} N/m</span></label>
          <input id="en-k" type="range" min="50" max="500" step="10" value={k} onChange={(e) => setK(+e.target.value)} />
        </div>
      </div>

      <EnergyCanvas params={params} sample={startSample} />

      <div className={styles.statusCard}>
        <div className={styles.statusRow}>
          <span>Energy the block starts with (mgh)</span>
          <strong className="text-cyan">{result.totalEnergy.toFixed(1)} J</strong>
        </div>
        <div className={styles.statusRow}>
          <span>Cost of ONE crossing of the patch (μmg × {PATCH_LENGTH} m)</span>
          <strong className="text-amber">{result.frictionCostPerCrossing.toFixed(1)} J</strong>
        </div>
        <p className={styles.hint}>
          The block is released from rest at the top of the smooth ramp. g = {G} m/s².
        </p>
      </div>

      <EnergyBarBuilder
        bars={bars}
        totalEnergy={result.totalEnergy}
        onChange={handleBarChange}
        onReset={() => setBars(EMPTY_BARS)}
      />

      <div className={styles.questionCard}>
        <p className={styles.questionText}>
          A {mass} kg block is released from {height.toFixed(1)} m. Following it for one round trip (down, across the patch, off the spring, and back), what will happen?
        </p>
        <div className={styles.predOptions} role="radiogroup" aria-label="Predicted outcome">
          {OUTCOME_ORDER.map((outcome) => (
            <button
              key={outcome}
              className={`${styles.predBtn} ${predicted === outcome ? styles.predBtnActive : ''}`}
              onClick={() => setPredicted(outcome)}
              role="radio"
              aria-checked={predicted === outcome}
            >
              {OUTCOME_LABEL[outcome]}
            </button>
          ))}
        </div>
        {predicted && (
          <button className="btn btn--primary" onClick={handleLockPrediction}>
            🔮 Lock In Prediction
          </button>
        )}
      </div>
    </div>
  );

  const ObservePhase = (
    <EnergyStage
      params={params}
      result={result}
      timeline={timeline}
      predicted={predicted}
      studentBars={bars}
      expectedBars={expectedBars}
      chartGrade={chartGrade}
      chartOutcome={chartOutcome}
      stopZone={{ attempts: stopAttempts, cleared: stopCleared, onRelease: handleStopRelease }}
    />
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <h2>🔋 Energy Ramp: Work, Energy &amp; Power</h2>
        <p>Follow one block's energy from ramp to rough patch to spring — and see why energy accounting beats tracking every force.</p>
      </div>

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Work, Energy & Power"
          intro="What work really means, how it changes kinetic energy, and why total energy is always conserved."
          sections={ENERGY_CONCEPTS}
        />
        <ConceptNotes
          variant="challenge"
          title="Work, Energy & Power"
          intro="Work as an integral, the work-energy theorem from Newton's second law, and force as the slope of a potential energy curve."
          sections={ENERGY_CHALLENGE}
        />
      </div>

      <POEShell
        moduleId="energy"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={ENERGY_EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
        onTryAgain={handleTryAgain}
        predictHint="Compare the two numbers on the card: the energy the block starts with (mgh) and the energy ONE crossing of the rough patch costs (μmg × 3 m). If it starts with less than one crossing's cost, it can't get past the patch. If it can afford one crossing but not two, it reaches the spring and bounces back but can't make it home. If it can afford more than two, it climbs the ramp again."
      />
    </div>
  );
}
