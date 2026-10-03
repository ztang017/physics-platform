import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  type KinematicsParams,
  generateTimeSeries,
  type KinematicsDataPoint,
  scoreGraphMatch,
  predictVelocityShape,
  predictPositionShape,
  type GraphShape,
} from '../../core/physics/kinematics';
import { useAnimationLoop } from '../../components/canvas/useAnimationLoop';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { KINEMATICS_CONCEPTS, KINEMATICS_CHALLENGE } from './kinematicsConcepts';
import styles from './KinematicsModule.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const SIM_DURATION = 8;    // seconds
const CANVAS_W = 600;
const CANVAS_H = 160;
const GRAPH_W = 280;
const GRAPH_H = 160;
const TRACK_MARGIN = 60;

// Fixed hidden target for the Graph-Match challenge (never changes at runtime).
const MATCH_TARGET_PARAMS: KinematicsParams = { x0: 0, v0: 3, a: -1.5 };

// Colour tokens for the light "whiteboard" canvas surface (kept separate from
// CSS variables since canvas fills can't reference custom properties).
const COLOR = {
  particle:   '#4f46e5',
  track:      '#e2e5ee',
  trackLine:  '#c7ccdb',
  velocity:   '#16a34a',
  accel:      '#b45309',
  position:   '#4f46e5',
  gridLine:   'rgba(23,27,38,0.06)',
  axisLine:   'rgba(23,27,38,0.28)',
  text:       'rgba(23,27,38,0.6)',
};

// ─── Explain Questions ─────────────────────────────────────────────────────────
export const KINEMATICS_EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'displacement-vs-distance',
    question: "You walk 5 m east and then 5 m back west. What are your distance travelled and your displacement?",
    options: ["Distance 10 m, displacement 0 m", "Distance 0 m, displacement 10 m", "Distance 10 m, displacement 10 m", "Distance 0 m, displacement 0 m"],
    correctIndex: 0,
    hint: "Distance counts every step you take. Displacement only compares where you ended up with where you started.",
    explanation: "Distance adds up all the ground you covered: 5 + 5 = 10 m. Displacement is the final position minus the starting position. You ended where you began, so it is 0 m.",
  },
  {
    id: 'meaning-of-ms2',
    question: "An object has an acceleration of 3 m/s². What does that mean?",
    options: ["Its velocity changes by 3 m/s every second", "It moves 3 metres every second", "It is moving at a steady 3 m/s", "It has travelled 3 metres in total"],
    correctIndex: 0,
    hint: "Read the unit as \"metres per second, per second\": a change in velocity (m/s) for every second that passes.",
    explanation: "m/s² means (m/s) per second. An acceleration of 3 m/s² means the velocity grows by 3 m/s every second: 3, 6, 9 m/s and so on. Moving 3 m each second would be a steady velocity of 3 m/s, which has zero acceleration.",
  },
  {
    id: 'slope-meaning',
    question: 'On a velocity-time graph, what does the slope of the line represent?',
    options: [
      'The position of the object',
      'The acceleration of the object',
      'The displacement of the object',
      'The speed at the start',
    ],
    correctIndex: 1,
    hint: 'Think about what a slope measures in general: change in the vertical axis (velocity) divided by change in the horizontal axis (time). What quantity is defined that way?',
    explanation:
      'The slope of a v-t graph is Δv/Δt, which is the definition of acceleration. A steeper slope means greater acceleration.',
  },
  {
    id: 'zero-accel',
    question: 'When acceleration is zero, what must be true about velocity?',
    options: [
      'Velocity must also be zero',
      'Velocity must be increasing',
      'Velocity is constant (unchanged)',
      'The object must be at the origin',
    ],
    correctIndex: 2,
    hint: "Acceleration is how fast the velocity changes. If it is zero, is the velocity changing at all?",
    explanation:
      "Zero acceleration means the velocity is not changing, so the object keeps moving at the same speed in the same direction. It does not slow down on its own. It only slows if a force, like friction, acts on it.",
  },
  {
    id: 'xt-curvature',
    question: 'When acceleration is non-zero and constant, the x-t graph is a:',
    options: [
      'Straight horizontal line',
      'Straight diagonal line',
      'Parabola (curved line)',
      'Sinusoidal wave',
    ],
    correctIndex: 2,
    hint: 'Look at the position equation: x = x₀ + v₀t + ½at². The t² term is the giveaway — what shape does a squared term trace out?',
    explanation:
      'Since x = x₀ + v₀t + ½at², the t² term makes it a parabola when acceleration is non-zero. Only constant velocity (a=0) gives a straight diagonal line.',
  },
  {
    id: 'compute-accel-from-graph',
    question: 'A velocity-time graph is a straight line starting at +4 m/s and reaching 0 m/s at t = 4 s. What is the acceleration?',
    options: ['−1 m/s²', '+1 m/s²', '−4 m/s²', '+0.25 m/s²'],
    correctIndex: 0,
    hint: 'Acceleration is the slope: (change in velocity) ÷ (change in time). The velocity went from +4 to 0 — how much did it change, and over how long?',
    explanation: 'a = Δv/Δt = (0 − 4)/(4 − 0) = −1 m/s². The negative sign means it\'s decelerating (slowing down), consistent with velocity shrinking toward zero.',
  },
  {
    id: 'area-under-at-graph',
    question: 'The area under an acceleration-time graph, between two times, represents:',
    options: ['The displacement', 'The change in velocity (Δv)', 'The average acceleration', 'The final position'],
    correctIndex: 1,
    hint: "Area is height × width. Here the height is acceleration and the width is time. What are the units of (m/s²) × s?",
    explanation: "Area is height × width. On an a-t graph the height is acceleration (m/s²) and the width is time (s), and (m/s²) × s = m/s, which is a change in velocity. So the area under an a-t graph is Δv, in the same way that the area under a v-t graph is a displacement.",
  },
  {
    id: 'rendezvous-calc',
    question: 'Ball A is thrown straight up at 15 m/s. Exactly 1 second later, Ball B is thrown straight up from the same spot at 25 m/s. Measuring t from the moment Ball A is thrown, at what time do the two balls collide? (g = 10 m/s²)',
    options: ['1.5 s', '1.0 s', '2.0 s', '2.5 s'],
    correctIndex: 0,
    hint: 'Write a position equation x = v₀t − ½gt² for each ball, using the SAME t for both. Ball B\'s clock starts 1 s late, so wherever Ball A\'s equation has "t", Ball B\'s equation should have "(t − 1)". Set the two expressions equal and solve for t.',
    explanation: 'Using x = v₀t − ½gt² for each ball (with Ball B\'s equation using (t−1) since it launches 1 s late) and setting the two heights equal: 15t − 5t² = 25(t−1) − 5(t−1)². Solving gives t = 1.5 s, at which point both balls are 11.25 m up — confirming the meeting point. It\'s the same position equation you already use, just written twice and solved as a system.',
  },
];

// ─── Simulation Canvas ────────────────────────────────────────────────────────
function SimulationCanvas({
  params,
  running,
  onDataUpdate,
  targetSeries,
}: {
  params: KinematicsParams;
  running: boolean;
  onDataUpdate: (point: KinematicsDataPoint, elapsed: number) => void;
  /** Optional reference v-t curve (Graph-Match challenge) drawn as a dashed overlay. */
  targetSeries?: KinematicsDataPoint[];
}) {
  const simCanvasRef = useRef<HTMLCanvasElement>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const historyRef = useRef<KinematicsDataPoint[]>([]);
  const fullSeriesRef = useRef(generateTimeSeries(params, SIM_DURATION));
  const elapsedRef = useRef(0);
  // Axis ranges computed once per parameter set from the FULL trajectory, so
  // the graph never clips a still-rising curve into a false "plateau" and
  // never rescales mid-animation.
  const rangesRef = useRef({ x: 60, v: 20, a: 10 });

  // The shared canvas hook clears the picture whenever layout resizes the canvas, so repaint when that happens.
  const [redrawTick, setRedrawTick] = useState(0);
  const bumpRedraw = useCallback(() => setRedrawTick((n) => n + 1), []);
  useHiDPICanvas(simCanvasRef, CANVAS_W, CANVAS_H, bumpRedraw);
  useHiDPICanvas(graphCanvasRef, GRAPH_W * 3 + 20, GRAPH_H, bumpRedraw);

  // Regenerate series when params change
  useEffect(() => {
    const series = generateTimeSeries(params, SIM_DURATION);
    fullSeriesRef.current = series;
    historyRef.current = [];
    elapsedRef.current = 0;

    const maxAbs = (key: 'x' | 'v' | 'a', pts: KinematicsDataPoint[]) =>
      pts.reduce((m, pt) => Math.max(m, Math.abs(pt[key])), 0);
    const targetVMax = targetSeries ? maxAbs('v', targetSeries) : 0;
    rangesRef.current = {
      x: maxAbs('x', series) * 1.15 || 5,
      v: Math.max(maxAbs('v', series), targetVMax) * 1.15 || 2,
      a: maxAbs('a', series) * 1.15 || 1,
    };
  }, [params.v0, params.a, params.x0, targetSeries]);

  const drawSimulation = useCallback((elapsed: number) => {
    const canvas = simCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const t = Math.min(elapsed, SIM_DURATION);
    const x = params.x0 + params.v0 * t + 0.5 * params.a * t * t;
    const v = params.v0 + params.a * t;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Track background
    ctx.fillStyle = COLOR.track;
    ctx.fillRect(0, CANVAS_H / 2 - 12, CANVAS_W, 24);

    // Track lines
    ctx.strokeStyle = COLOR.trackLine;
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_W; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, CANVAS_H / 2 - 12);
      ctx.lineTo(i + 15, CANVAS_H / 2 + 12);
      ctx.stroke();
    }

    // Map x position to canvas (centered, ±50m range)
    const range = 50;
    const canvasX = TRACK_MARGIN + ((x + range) / (2 * range)) * (CANVAS_W - 2 * TRACK_MARGIN);
    const clampedX = Math.max(TRACK_MARGIN - 10, Math.min(CANVAS_W - TRACK_MARGIN + 10, canvasX));

    // Particle
    ctx.beginPath();
    ctx.arc(clampedX, CANVAS_H / 2, 14, 0, Math.PI * 2);
    ctx.fillStyle = COLOR.particle;
    ctx.shadowBlur = 20;
    ctx.shadowColor = COLOR.particle;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Velocity arrow
    if (Math.abs(v) > 0.1) {
      const arrowLen = Math.min(Math.abs(v) * 8, 80);
      const dir = v > 0 ? 1 : -1;
      drawArrow(ctx, clampedX, CANVAS_H / 2 - 28, clampedX + dir * arrowLen, CANVAS_H / 2 - 28, COLOR.velocity, 'v');
    }

    // Acceleration arrow (if non-zero)
    if (Math.abs(params.a) > 0.05) {
      const arrowLen = Math.min(Math.abs(params.a) * 14, 60);
      const dir = params.a > 0 ? 1 : -1;
      drawArrow(ctx, clampedX, CANVAS_H / 2 + 28, clampedX + dir * arrowLen, CANVAS_H / 2 + 28, COLOR.accel, 'a');
    }

    // Origin marker
    const originX = TRACK_MARGIN + (range / (2 * range)) * (CANVAS_W - 2 * TRACK_MARGIN);
    ctx.fillStyle = COLOR.axisLine;
    ctx.fillRect(originX - 1, CANVAS_H / 2 - 20, 2, 40);
    ctx.fillStyle = COLOR.text;
    ctx.font = '12px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('0', originX, CANVAS_H - 8);

    // Time readout
    ctx.fillStyle = 'rgba(23,27,38,0.75)';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`t = ${t.toFixed(2)}s`, 8, 20);
    ctx.fillText(`x = ${x.toFixed(1)}m`, 8, 36);
    ctx.fillText(`v = ${v.toFixed(2)}m/s`, 8, 52);
  }, [params]);

  const drawGraphs = useCallback(() => {
    const canvas = graphCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const history = historyRef.current;
    ctx.clearRect(0, 0, GRAPH_W * 3 + 20, GRAPH_H);

    const ranges = rangesRef.current;
    const configs = [
      { key: 'x' as const, label: 'x-t', color: COLOR.position, unit: 'm', range: ranges.x },
      { key: 'v' as const, label: 'v-t', color: COLOR.velocity,  unit: 'm/s', range: ranges.v },
      { key: 'a' as const, label: 'a-t', color: COLOR.accel,     unit: 'm/s²', range: ranges.a },
    ];

    configs.forEach((cfg, i) => {
      const ox = i * (GRAPH_W + 10);
      const overlay = cfg.key === 'v' ? targetSeries : undefined;
      drawGraph(ctx, history, cfg.key, cfg.label, cfg.color, cfg.unit, cfg.range, ox, 0, GRAPH_W, GRAPH_H, overlay);
    });
  }, [targetSeries]);

  const { stop } = useAnimationLoop({
    running,
    onFrame: (_dt, elapsed) => {
      elapsedRef.current = elapsed;
      const series = fullSeriesRef.current;
      // Find the nearest data point
      const idx = Math.min(Math.floor(elapsed / 0.016), series.length - 1);
      const point = series[idx];
      historyRef.current = series.slice(0, idx + 1);
      onDataUpdate(point, elapsed);
      drawSimulation(elapsed);
      drawGraphs();
      if (elapsed >= SIM_DURATION) stop();
    },
  });

  // Draw static graphs on mount/param change
  useEffect(() => {
    drawSimulation(0);
    drawGraphs();
  }, [drawSimulation, drawGraphs, redrawTick]);

  return (
    <div className={styles.simWrap}>
      <canvas
        ref={simCanvasRef}
        className={styles.simCanvas}
        aria-label="Physics particle simulation on a 1D track"
        role="img"
      />
      <div className={styles.graphRow}>
        <canvas
          ref={graphCanvasRef}
          className={styles.graphCanvas}
          aria-label="Synchronized position, velocity, and acceleration graphs"
          role="img"
        />
      </div>
    </div>
  );
}

// ─── Canvas Drawing Helpers ────────────────────────────────────────────────────

function drawArrow(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number,
  x2: number, y2: number,
  color: string,
  label: string
) {
  const headLen = 8;
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // Arrowhead
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - 0.4), y2 - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - headLen * Math.cos(angle + 0.4), y2 - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  // Label
  ctx.font = 'bold 11px JetBrains Mono, monospace';
  ctx.fillText(label, x2 + 6, y2 + 4);
}

function drawGraph(
  ctx: CanvasRenderingContext2D,
  history: KinematicsDataPoint[],
  key: 'x' | 'v' | 'a',
  label: string,
  color: string,
  _unit: string,
  valueRange: number,
  ox: number, oy: number,
  w: number, h: number,
  overlay?: KinematicsDataPoint[]
) {
  const pad = { l: 32, r: 8, t: 18, b: 24 };
  const gx = ox + pad.l, gy = oy + pad.t;
  const gw = w - pad.l - pad.r, gh = h - pad.t - pad.b;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(23,27,38,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(ox, oy, w, h, 8);
  ctx.fill();
  ctx.stroke();

  // Label
  ctx.fillStyle = color;
  ctx.font = 'bold 12px JetBrains Mono, monospace';
  ctx.textAlign = 'left';
  ctx.fillText(label, ox + 4, oy + 12);

  // Grid lines
  ctx.strokeStyle = COLOR.gridLine;
  ctx.lineWidth = 1;
  for (let j = 0; j <= 4; j++) {
    const y = gy + (j / 4) * gh;
    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = COLOR.axisLine;
  ctx.lineWidth = 1.5;
  // x-axis (zero line, centered)
  const zeroY = gy + gh / 2;
  ctx.beginPath(); ctx.moveTo(gx, zeroY); ctx.lineTo(gx + gw, zeroY); ctx.stroke();
  // y-axis
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.stroke();

  // Axis labels
  ctx.fillStyle = COLOR.text;
  ctx.font = '11px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  const rangeLabel = valueRange >= 10 ? Math.round(valueRange) : Math.round(valueRange * 10) / 10;
  ctx.fillText(`+${rangeLabel}`, gx - 2, gy + 4);
  ctx.fillText(`-${rangeLabel}`, gx - 2, gy + gh);

  const toPoint = (pt: KinematicsDataPoint) => ({
    px: gx + (pt.t / SIM_DURATION) * gw,
    py: Math.max(gy, Math.min(gy + gh, zeroY - (pt[key] / valueRange) * (gh / 2))),
  });

  // Target overlay (Graph-Match challenge) — dashed, drawn under the live trace
  if (overlay && overlay.length >= 2) {
    ctx.save();
    ctx.strokeStyle = 'rgba(23,27,38,0.45)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    overlay.forEach((pt, i) => {
      const { px, py } = toPoint(pt);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(23,27,38,0.55)';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText('- - target', gx + gw - 2, gy + gh - 8);
  }

  // Plot data
  if (history.length < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 4;
  ctx.shadowColor = color;
  ctx.beginPath();

  history.forEach((pt, i) => {
    const { px, py } = toPoint(pt);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });

  ctx.stroke();
  ctx.shadowBlur = 0;
}

// ─── Graph Shape Picker (Predict phase) ───────────────────────────────────────

const SHAPE_OPTIONS: { id: GraphShape; label: string; svgPath: string }[] = [
  { id: 'linear-increasing', label: 'Rising line', svgPath: 'M10,90 L90,10' },
  { id: 'linear-decreasing', label: 'Falling line', svgPath: 'M10,10 L90,90' },
  { id: 'constant',          label: 'Flat line',   svgPath: 'M10,50 L90,50' },
  { id: 'parabolic-up',      label: 'Curve up',    svgPath: 'M10,90 Q50,10 90,40' },
  { id: 'parabolic-down',    label: 'Curve down',  svgPath: 'M10,10 Q50,90 90,60' },
];

function shapeLabel(shape: GraphShape | null): string {
  return SHAPE_OPTIONS.find((o) => o.id === shape)?.label ?? '(none chosen)';
}

/** Why the v-t graph has the shape it does, in plain words. */
function velocityReason(a: number): string {
  if (a > 0.01) return 'Why: a positive acceleration adds the same amount to the velocity every second, so the v-t graph climbs in a straight line. The slope of that line IS the acceleration.';
  if (a < -0.01) return 'Why: a negative acceleration takes the same amount off the velocity every second, so the v-t graph falls in a straight line. The slope of that line IS the acceleration.';
  return 'Why: with zero acceleration the velocity never changes, so the v-t graph is a flat line.';
}

/** Why the x-t graph has the shape it does, in plain words. */
function positionReason(v0: number, a: number): string {
  if (a > 0.01) return 'Why: the velocity keeps growing, so the object covers more ground each second than the second before. That makes the x-t graph curve upward (a parabola).';
  if (a < -0.01) return 'Why: the velocity keeps shrinking, so the object covers less ground each second than the second before. That makes the x-t graph bend downward (a parabola).';
  if (Math.abs(v0) <= 0.01) return 'Why: with no velocity and no acceleration the object does not move, so the x-t graph is flat.';
  return 'Why: the velocity is steady, so the same distance is covered every second. That makes the x-t graph a straight sloping line.';
}

function GraphShapePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: GraphShape | null;
  onChange: (v: GraphShape) => void;
}) {
  return (
    <div className={styles.pickerWrap}>
      <p className={styles.pickerLabel}>{label}</p>
      <div className={styles.pickerGrid} role="radiogroup" aria-label={label}>
        {SHAPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            className={`${styles.shapeBtn} ${value === opt.id ? styles.shapeBtnActive : ''}`}
            onClick={() => onChange(opt.id)}
            role="radio"
            aria-checked={value === opt.id}
            aria-label={opt.label}
            title={opt.label}
          >
            <svg viewBox="0 0 100 100" className={styles.shapeSvg} aria-hidden="true">
              <line x1="10" y1="50" x2="90" y2="50" stroke="rgba(23,27,38,0.15)" strokeWidth="1" />
              <path d={opt.svgPath} fill="none" stroke={value === opt.id ? '#4f46e5' : 'rgba(23,27,38,0.4)'} strokeWidth="3" strokeLinecap="round" />
            </svg>
            <span>{opt.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Kinematics Module ───────────────────────────────────────────────────

export function KinematicsModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();

  const [v0, setV0] = useState(5);
  const [a, setA] = useState(2);
  const [simRunning, setSimRunning] = useState(false);
  const [predictedVShape, setPredictedVShape] = useState<GraphShape | null>(null);
  const [predictedXShape, setPredictedXShape] = useState<GraphShape | null>(null);
  const [predictSubmitted, setPredictSubmitted] = useState(false);
  const [livePoint, setLivePoint] = useState<KinematicsDataPoint>({ t: 0, x: 0, v: v0, a });
  const restartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending restart timer on unmount so it can't call setState after
  // the component is gone (and so rapid clicking doesn't stack timers).
  useEffect(() => () => {
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
  }, []);

  const params: KinematicsParams = { x0: 0, v0, a };
  const correctVShape = predictVelocityShape(params);
  const correctXShape = predictPositionShape(params);

  // ─── Predict Submission ──────────────────────────────────────────────────────
  const handlePredictSubmit = () => {
    if (!predictedVShape || !predictedXShape) return;
    // Only award XP the first time — if the student uses Back to revisit
    // Predict and re-submits, this must stay a no-op for scoring purposes.
    if (!predictSubmitted) addXP(10);
    setPredictSubmitted(true);
    setPOEPhase('observe');
    setSimRunning(true);
  };

  // ─── Graph Match ──────────────────────────────────────────────────────────────
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const bestMatchScoreRef = useRef(0);
  const studentSeriesRef = useRef<KinematicsDataPoint[]>([]);
  const targetSeries = useMemo(
    () => generateTimeSeries(MATCH_TARGET_PARAMS, SIM_DURATION),
    []
  );

  const handleRunMatch = () => {
    const studentSeries = generateTimeSeries({ x0: 0, v0, a }, SIM_DURATION);
    const result = scoreGraphMatch(targetSeries, studentSeries);
    setMatchScore(result.score);
    // Only reward genuine improvement — otherwise re-clicking with unchanged
    // sliders would re-award XP for the same score indefinitely.
    const improvement = Math.max(0, result.score - bestMatchScoreRef.current);
    bestMatchScoreRef.current = Math.max(bestMatchScoreRef.current, result.score);
    addXP(Math.round(improvement * 0.5));
    if (result.isPerfect) {
      unlockBadge('graph-whisperer');
    }
  };

  // ─── Module Complete ──────────────────────────────────────────────────────────
  const handleComplete = (score: number, perfectExplain: boolean) => {
    addXP(50 + score);
    unlockBadge('motion-maestro');
    if (perfectExplain) unlockBadge('sharp-shooter');
    completeModule('kinematics');
  };

  // Resets everything "Try Again" should hand back to a fresh attempt —
  // without this, stale predictSubmitted/matchScore/bestMatchScore state would
  // let a student replay already-scored interactions for repeat XP.
  const handleTryAgain = () => {
    setV0(5);
    setA(2);
    setSimRunning(false);
    setPredictedVShape(null);
    setPredictedXShape(null);
    setPredictSubmitted(false);
    setMatchScore(null);
    bestMatchScoreRef.current = 0;
    studentSeriesRef.current = [];
  };

  // ─── Predict Phase ────────────────────────────────────────────────────────────
  const PredictPhase = (
    <div className={styles.predictWrap}>
      <div className={styles.paramsCard}>
        <h4>🛒 The scenario: a trolley on a straight track</h4>
        <p>
          A trolley starts at the middle of a straight track. You choose how fast it is already moving, and how it is being pushed.
          Then you predict what two graphs will look like: one for its <strong>velocity</strong> over time, and one for its <strong>position</strong> over time.
        </p>

        <div className={styles.sliders}>
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="slider-v0">
              Starting velocity (v₀): how fast it is already moving
              <span className="value">{v0 >= 0 ? '+' : ''}{v0} m/s</span>
            </label>
            <span className={styles.sliderHelp}>Positive means moving right, negative means moving left.</span>
            <input
              id="slider-v0"
              type="range" min="-15" max="15" step="0.5"
              value={v0} onChange={(e) => setV0(parseFloat(e.target.value))}
              aria-label={`Initial velocity: ${v0} meters per second`}
            />
          </div>

          <div className="slider-wrap">
            <label className="slider-label" htmlFor="slider-a">
              Acceleration (a): how its velocity is changing
              <span className="value">{a >= 0 ? '+' : ''}{a} m/s²</span>
            </label>
            <span className={styles.sliderHelp}>Positive pushes it to the right, negative pushes it to the left. A push against its motion slows it down.</span>
            <input
              id="slider-a"
              type="range" min="-8" max="8" step="0.25"
              value={a} onChange={(e) => setA(parseFloat(e.target.value))}
              aria-label={`Acceleration: ${a} meters per second squared`}
            />
          </div>
        </div>
      </div>

      <div className={styles.predictGraphs}>
        <GraphShapePicker
          label="What will the velocity-time graph look like?"
          value={predictedVShape}
          onChange={setPredictedVShape}
        />
        <GraphShapePicker
          label="What will the position-time graph look like?"
          value={predictedXShape}
          onChange={setPredictedXShape}
        />
      </div>

      <button
        className="btn btn--primary"
        onClick={handlePredictSubmit}
        disabled={!predictedVShape || !predictedXShape}
      >
        🔮 Lock In My Prediction
      </button>
    </div>
  );

  // ─── Observe Phase ────────────────────────────────────────────────────────────
  const ObservePhase = (
    <div className={styles.observeWrap}>
      {predictSubmitted && (
        <div className={styles.predictionFeedback}>
          <p className={styles.feedbackLine}>
            <span>Velocity-time graph, your prediction: </span>
            <strong>{shapeLabel(predictedVShape)}</strong>{' '}
            <strong className={predictedVShape === correctVShape ? 'text-green' : 'text-amber'}>
              {predictedVShape === correctVShape ? '✓ Correct' : `✗ It is actually a ${shapeLabel(correctVShape).toLowerCase()}`}
            </strong>
          </p>
          <p className={styles.feedbackWhy}>{velocityReason(a)}</p>
          <p className={styles.feedbackLine}>
            <span>Position-time graph, your prediction: </span>
            <strong>{shapeLabel(predictedXShape)}</strong>{' '}
            <strong className={predictedXShape === correctXShape ? 'text-green' : 'text-amber'}>
              {predictedXShape === correctXShape ? '✓ Correct' : `✗ It is actually a ${shapeLabel(correctXShape).toLowerCase()}`}
            </strong>
          </p>
          <p className={styles.feedbackWhy}>{positionReason(v0, a)}</p>
        </div>
      )}

      <SimulationCanvas
        params={params}
        running={simRunning}
        onDataUpdate={(pt, _elapsed) => {
          setLivePoint(pt);
          studentSeriesRef.current.push(pt);
        }}
        targetSeries={targetSeries}
      />

      <dl className={styles.liveReadout} aria-label="Live values from the simulation">
        <div><dt>Time</dt><dd>{livePoint.t.toFixed(2)} s</dd></div>
        <div><dt>Position (x)</dt><dd>{livePoint.x.toFixed(1)} m</dd></div>
        <div><dt>Velocity (v)</dt><dd>{livePoint.v.toFixed(2)} m/s</dd></div>
        <div><dt>Acceleration (a)</dt><dd>{livePoint.a.toFixed(2)} m/s²</dd></div>
      </dl>
      <p className={styles.sliderHelp}>
        The three graphs show position (x), velocity (v) and acceleration (a) against time. Watch how the slope of one graph is the height of the next.
      </p>

      <div className={styles.controlRow}>
        <button
          className="btn btn--secondary"
          onClick={() => {
            setSimRunning(false);
            if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
            restartTimeoutRef.current = setTimeout(() => setSimRunning(true), 100);
          }}
        >
          ↺ Restart
        </button>
        <button
          className="btn btn--secondary"
          onClick={() => setSimRunning((r) => !r)}
        >
          {simRunning ? '⏸ Pause' : '▶ Resume'}
        </button>
      </div>

      {/* Math mode formula panel */}
      <FormulaPanel
        title="Kinematics Equations"
        formulas={[
          {
            label: 'Position',
            latex: 'x = x_0 + v_0 t + \\tfrac{1}{2}at^2',
            liveValue: `= ${livePoint.x.toFixed(2)} m`,
            accentColor: 'cyan',
          },
          {
            label: 'Velocity',
            latex: 'v = v_0 + at',
            liveValue: `= ${livePoint.v.toFixed(2)} m/s`,
            accentColor: 'green',
          },
          {
            label: 'Acceleration',
            latex: 'a = \\text{const} = ' + a,
            liveValue: `= ${livePoint.a.toFixed(2)} m/s²`,
            accentColor: 'amber',
          },
          {
            label: 'Time',
            latex: 't = ' + livePoint.t.toFixed(2) + '\\text{ s}',
            accentColor: 'violet',
          },
        ]}
      />

      {/* Graph-Match Mini-game */}
      <div className={styles.matchCard}>
        <div className={styles.matchHeader}>
          <span className={styles.matchIcon}>🎮</span>
          <div>
            <h4>Graph-Match Challenge</h4>
            <p>
              The dashed gray line on the <strong>v-t graph</strong> above is a hidden target curve.
              Adjust the sliders below so your solid line traces over it as closely as possible,
              then check your score. (These are the same sliders as the simulation above — changing
              them updates both.)
            </p>
            <p className={styles.sliderHelp}>
              Tip: look at where the dashed line STARTS (that height is the starting velocity v₀), then at whether it slopes up or down
              (that is the sign of the acceleration a). Fix one slider at a time.
            </p>
          </div>
        </div>

        <div className={styles.sliders}>
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="match-v0">
              Initial Velocity (v₀)
              <span className="value">{v0 >= 0 ? '+' : ''}{v0} m/s</span>
            </label>
            <input
              id="match-v0"
              type="range" min="-15" max="15" step="0.5"
              value={v0} onChange={(e) => setV0(parseFloat(e.target.value))}
              aria-label={`Initial velocity: ${v0} meters per second`}
            />
          </div>
          <div className="slider-wrap">
            <label className="slider-label" htmlFor="match-a">
              Acceleration (a)
              <span className="value">{a >= 0 ? '+' : ''}{a} m/s²</span>
            </label>
            <input
              id="match-a"
              type="range" min="-8" max="8" step="0.25"
              value={a} onChange={(e) => setA(parseFloat(e.target.value))}
              aria-label={`Acceleration: ${a} meters per second squared`}
            />
          </div>
        </div>

        <button className="btn btn--secondary" onClick={handleRunMatch}>
          📊 Score My Match
        </button>
        {matchScore !== null && (
          <div className={`${styles.matchScore} ${matchScore >= 95 ? styles.matchPerfect : matchScore >= 70 ? styles.matchGood : styles.matchTry}`}>
            <span className={styles.scoreNum}>{matchScore}</span>
            <span>/100</span>
            {matchScore >= 95 && <span className={styles.badge}>🏆 Perfect Match!</span>}
            {matchScore >= 70 && matchScore < 95 && <span className={styles.badge}>👍 Good Match!</span>}
            {matchScore < 70 && <span className={styles.badge}>📉 Keep Adjusting</span>}
            {matchScore < 95 && (
              <span className={styles.sliderHelp}>
                Hint: match the starting height first (v₀), then the steepness and direction of the slope (a).
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <div>
          <h2>📈 Vector Kinematics Grapher</h2>
          <p>Explore 1D constant-acceleration motion through synchronized real-time graphs.</p>
        </div>
      </div>

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Vector Kinematics"
          intro="Position, velocity, acceleration — and how to read their graphs."
          sections={KINEMATICS_CONCEPTS}
        />
        <ConceptNotes
          variant="challenge"
          title="Vector Kinematics"
          intro="Heading into H3 or university physics? See how derivatives and integrals formalize what you've already learned."
          sections={KINEMATICS_CHALLENGE}
        />
      </div>

      <POEShell
        moduleId="kinematics"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={KINEMATICS_EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
        onTryAgain={handleTryAgain}
        predictHint="Look at the SIGN of your acceleration slider compared to your initial velocity. Do they match (same sign) or oppose each other? That tells you whether the object is speeding up or slowing down, which shapes the v-t line. Separately: is acceleration exactly zero, or not? A non-zero, constant acceleration always curves the x-t graph — it can never be a straight line."
      />
    </div>
  );
}
