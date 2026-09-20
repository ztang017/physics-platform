import { useRef, useState, useEffect } from 'react';
import {
  type ProjectileParams, generateTrajectory, evaluateMission,
  type WallMissionParams, getRange, getMaxHeight,
} from '../../core/physics/projectile';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { PROJECTILE_CONCEPTS } from './projectileConcepts';
import styles from './ProjectileModule.module.css';

const EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'horizontal-force',
    question: 'What force acts on the projectile in the horizontal direction (ignoring air resistance)?',
    options: ['Gravity', 'The launch force', 'No force — horizontal velocity is constant', 'Friction'],
    correctIndex: 2,
    hint: 'Gravity always pulls straight down — it has no sideways component at all. With nothing else pushing or pulling sideways, what happens to a velocity that never gets a force applied to it?',
    explanation: 'With no air resistance, no horizontal force acts on the projectile. This is why horizontal velocity remains constant throughout the flight — it is unchanged from the moment of launch.',
  },
  {
    id: 'why-fell-short',
    question: 'If your package fell short of the target, which parameter would MOST directly fix this?',
    options: ['Decrease launch angle to 0°', 'Increase initial speed v₀', 'Add more mass to the package', 'Increase gravity'],
    correctIndex: 1,
    hint: 'Look at the range formula: R = v₀²sin(2θ)/g. Mass doesn\'t even appear in it, and gravity isn\'t something you control. Which of the remaining options directly increases R?',
    explanation: 'Range = v₀²sin(2θ)/g — increasing v₀ quadratically increases the range. You could also optimize the angle toward 45° for maximum range at a given speed.',
  },
  {
    id: 'max-range-angle',
    question: 'At what launch angle is the range maximized (on flat ground)?',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 1,
    hint: 'Range depends on sin(2θ). sin() reaches its largest possible value, 1, when its input is 90°. What value of θ makes 2θ equal 90°?',
    explanation: '45° maximizes range because sin(2θ) = sin(90°) = 1, which is its maximum value. At 30° and 60° you get the same range as each other, but less than at 45°.',
  },
];

// Canvas constants
const W = 600, H = 320;
const SCALE = 4; // pixels per meter
const ORIGIN_X = 40, ORIGIN_Y = H - 40;

const MISSION: WallMissionParams = {
  v0: 20, angleDeg: 45, x0: 0, y0: 0,
  wallX: 25, wallHeight: 12,
  targetX: 60, targetTolerance: 5,
};

function ProjectileCanvas({
  params,
  crosshair,
  onCrosshairMove,
  onFire,
  fired,
}: {
  params: ProjectileParams;
  crosshair: { x: number; y: number } | null;
  onCrosshairMove: (pos: { x: number; y: number }) => void;
  onFire: () => void;
  fired: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useHiDPICanvas(canvasRef, W, H);

  const worldToCanvas = (wx: number, wy: number) => ({
    cx: ORIGIN_X + wx * SCALE,
    cy: ORIGIN_Y - wy * SCALE,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, W, H);

    // Sky wash
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(79, 70, 229, 0.06)');
    grad.addColorStop(1, 'rgba(79, 70, 229, 0.01)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = '#e2e5ee';
    ctx.fillRect(0, ORIGIN_Y, W, H - ORIGIN_Y);
    ctx.strokeStyle = '#8890a3';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, ORIGIN_Y); ctx.lineTo(W, ORIGIN_Y); ctx.stroke();

    // Wall
    const wall = worldToCanvas(MISSION.wallX, MISSION.wallHeight);
    ctx.fillStyle = 'rgba(220, 38, 38, 0.18)';
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.fillRect(wall.cx - 4, wall.cy, 8, ORIGIN_Y - wall.cy);
    ctx.strokeRect(wall.cx - 4, wall.cy, 8, ORIGIN_Y - wall.cy);
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${MISSION.wallHeight}m`, wall.cx, wall.cy - 6);

    // Target zone
    const targetStart = worldToCanvas(MISSION.targetX - MISSION.targetTolerance, 0);
    const targetEnd = worldToCanvas(MISSION.targetX + MISSION.targetTolerance, 0);
    ctx.fillStyle = 'rgba(22, 163, 74, 0.15)';
    ctx.strokeStyle = '#16a34a';
    ctx.lineWidth = 2;
    ctx.fillRect(targetStart.cx, ORIGIN_Y - 12, targetEnd.cx - targetStart.cx, 12);
    ctx.strokeRect(targetStart.cx, ORIGIN_Y - 12, targetEnd.cx - targetStart.cx, 12);
    ctx.fillStyle = '#16a34a';
    ctx.fillText('TARGET', worldToCanvas(MISSION.targetX, 0).cx, ORIGIN_Y - 16);

    // Trajectory (if fired)
    if (fired) {
      const traj = generateTrajectory(params);
      ctx.strokeStyle = '#4f46e5';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      traj.forEach((pt, i) => {
        const { cx, cy } = worldToCanvas(pt.x, pt.y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();

      // Landing point
      const land = traj[traj.length - 1];
      const { cx } = worldToCanvas(land.x, land.y);
      ctx.beginPath(); ctx.arc(cx, ORIGIN_Y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309';
      ctx.fill();
    }

    // Crosshair (predict mode)
    if (crosshair && !fired) {
      const { x: cx, y: cy } = crosshair;
      ctx.strokeStyle = 'rgba(180, 83, 9, 0.7)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#b45309';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`${((cx - ORIGIN_X) / SCALE).toFixed(0)}m`, cx + 12, cy - 4);
    }

    // Axis labels
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(23,27,38,0.4)';
    ctx.font = '10px JetBrains Mono';
    for (let x = 0; x <= 120; x += 20) {
      const { cx } = worldToCanvas(x, 0);
      if (cx > W) break;
      ctx.fillText(`${x}m`, cx - 8, ORIGIN_Y + 16);
    }

    return () => cancelAnimationFrame(animRef.current);
  }, [params, crosshair, fired]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    onCrosshairMove({ x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY });
  };

  // Keyboard alternative to mouse-aiming: focus the canvas, nudge the
  // crosshair with arrow keys, confirm with Enter/Space. Without this, a
  // keyboard-only student could never complete this module's Predict phase.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    if (fired) return;
    const STEP = SCALE; // one on-screen step ≈ 1 world meter
    const current = crosshair ?? { x: ORIGIN_X + 100, y: ORIGIN_Y - 100 };

    const moves: Record<string, { x: number; y: number }> = {
      ArrowRight: { x: current.x + STEP, y: current.y },
      ArrowLeft:  { x: current.x - STEP, y: current.y },
      ArrowUp:    { x: current.x, y: current.y - STEP },
      ArrowDown:  { x: current.x, y: current.y + STEP },
    };

    if (moves[e.key]) {
      e.preventDefault();
      onCrosshairMove({
        x: Math.max(ORIGIN_X, Math.min(W, moves[e.key].x)),
        y: Math.max(0, Math.min(ORIGIN_Y, moves[e.key].y)),
      });
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!crosshair) onCrosshairMove(current);
      onFire();
    }
  };

  const aimMeters = crosshair ? ((crosshair.x - ORIGIN_X) / SCALE).toFixed(0) : null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseMove={!fired ? handleMouseMove : undefined}
        onClick={!fired ? onFire : undefined}
        onKeyDown={!fired ? handleKeyDown : undefined}
        aria-label={
          fired
            ? 'Projectile motion simulation showing the fired trajectory'
            : `Projectile aiming canvas. Use arrow keys to aim, Enter to fire. Current aim: ${aimMeters ?? 'not set'} meters.`
        }
        role="img"
        tabIndex={0}
      />
      <span className="sr-only" role="status" aria-live="polite">
        {!fired && crosshair ? `Aiming at ${aimMeters} meters` : ''}
      </span>
    </>
  );
}

export function ProjectileModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();

  const [v0, setV0] = useState(20);
  const [angleDeg, setAngleDeg] = useState(45);
  const [crosshair, setCrosshair] = useState<{ x: number; y: number } | null>(null);
  const [predictFired, setPredictFired] = useState(false);
  const [simFired, setSimFired] = useState(false);
  const [consecutiveHits, setConsecutiveHits] = useState(0);

  const params: ProjectileParams = { v0, angleDeg };
  const range = getRange(params);
  const maxH = getMaxHeight(params);

  const handleCrosshairFire = () => {
    // Only award XP the first time — if the student uses Back to revisit
    // Predict and re-aims, this must stay a no-op for scoring purposes.
    if (!predictFired) addXP(10);
    setPredictFired(true);
    setPOEPhase('observe');
  };

  const handleFire = () => {
    setSimFired(true);
    const result = evaluateMission({ ...params, ...MISSION, v0, angleDeg });
    if (result.isSuccess) {
      const hits = consecutiveHits + 1;
      setConsecutiveHits(hits);
      addXP(30);
      if (hits >= 3) unlockBadge('relief-pilot');
    } else {
      setConsecutiveHits(0);
    }
  };

  const handleComplete = (score: number) => {
    addXP(50 + score);
    unlockBadge('trajectory-ace');
    completeModule('projectile');
  };

  // Without this, "Try Again" only reset POE/session state — predictFired and
  // simFired stayed true, and the Predict-phase canvas is always clickable
  // (fired is hardcoded false there), so a student could replay the crosshair
  // click for repeat +10 XP indefinitely.
  const handleTryAgain = () => {
    setV0(20);
    setAngleDeg(45);
    setCrosshair(null);
    setPredictFired(false);
    setSimFired(false);
    setConsecutiveHits(0);
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <div className={styles.storyCard}>
        <span className={styles.storyIcon}>✈️</span>
        <div>
          <h4>Mission: Aerial Relief Drop</h4>
          <p>You need to launch relief packages over a <strong>12m wall</strong> (25m away) to land them in the target zone (<strong>55–65m</strong> from you). Set your parameters and click on the canvas to predict where your package will land!</p>
        </div>
      </div>

      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="proj-v0">
            Launch Speed (v₀) <span className="value">{v0} m/s</span>
          </label>
          <input id="proj-v0" type="range" min="5" max="40" step="1" value={v0} onChange={(e) => setV0(+e.target.value)} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="proj-angle">
            Launch Angle (θ) <span className="value">{angleDeg}°</span>
          </label>
          <input id="proj-angle" type="range" min="5" max="85" step="1" value={angleDeg} onChange={(e) => setAngleDeg(+e.target.value)} />
        </div>
      </div>

      <p className={styles.hint}>
        📍 <strong>Click on the canvas</strong> to place your predicted landing spot, then submit.
        {' '}Keyboard users: focus the canvas, aim with the arrow keys, then press Enter.
      </p>

      <ProjectileCanvas
        params={params}
        crosshair={crosshair}
        onCrosshairMove={setCrosshair}
        onFire={handleCrosshairFire}
        fired={false}
      />
      {!predictFired && <p className={styles.hint}>Click canvas (or use arrow keys + Enter) to lock in your prediction.</p>}
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
      <ProjectileCanvas
        params={params}
        crosshair={null}
        onCrosshairMove={() => {}}
        onFire={handleFire}
        fired={simFired}
      />

      <div className={styles.readouts}>
        <div className={styles.readout}><span>Range</span><strong className="text-cyan">{range.toFixed(1)} m</strong></div>
        <div className={styles.readout}><span>Max Height</span><strong className="text-green">{maxH.toFixed(1)} m</strong></div>
        <div className={styles.readout}><span>Angle</span><strong className="text-amber">{angleDeg}°</strong></div>
      </div>

      {!simFired && (
        <button className="btn btn--primary" onClick={handleFire}>🚀 Fire!</button>
      )}

      <FormulaPanel
        title="Projectile Equations"
        formulas={[
          { label: 'Horizontal', latex: 'x(t) = v_0 \\cos\\theta \\cdot t', liveValue: `vₓ = ${(v0 * Math.cos(angleDeg * Math.PI / 180)).toFixed(1)} m/s`, accentColor: 'cyan' },
          { label: 'Vertical',   latex: 'y(t) = v_0 \\sin\\theta \\cdot t - \\tfrac{1}{2}gt^2', accentColor: 'green' },
          { label: 'Range',      latex: 'R = \\frac{v_0^2 \\sin 2\\theta}{g}', liveValue: `= ${range.toFixed(1)} m`, accentColor: 'amber' },
        ]}
      />
    </div>
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <h2>🚀 Projectile Motion Sandbox</h2>
        <p>Launch relief packages, explore the independence of orthogonal motion components.</p>
      </div>

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Projectile Motion"
          intro="Why horizontal and vertical motion never interfere with each other."
          sections={PROJECTILE_CONCEPTS}
        />
      </div>

      <POEShell
        moduleId="projectile"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
        onTryAgain={handleTryAgain}
        predictHint="You don't need to click exactly right — think in two separate pieces. How FAR it can travel sideways depends on v₀ and the angle together; how LONG it stays airborne depends mostly on the vertical piece of the launch (v₀·sinθ). A higher, steeper shot spends longer in the air but may not travel as far sideways."
      />
    </div>
  );
}
