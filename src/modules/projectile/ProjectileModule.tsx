import { useRef, useState, useEffect } from 'react';
import {
  type ProjectileParams, generateTrajectory, evaluateMission,
  type WallMissionParams, getRange, getMaxHeight,
} from '../../core/physics/projectile';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import styles from './ProjectileModule.module.css';

const EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'horizontal-force',
    question: 'What force acts on the projectile in the horizontal direction (ignoring air resistance)?',
    options: ['Gravity', 'The launch force', 'No force — horizontal velocity is constant', 'Friction'],
    correctIndex: 2,
    explanation: 'Correct! With no air resistance, no horizontal force acts on the projectile. This is why horizontal velocity remains constant throughout the flight — it is unchanged from the moment of launch.',
  },
  {
    id: 'why-fell-short',
    question: 'If your package fell short of the target, which parameter would MOST directly fix this?',
    options: ['Decrease launch angle to 0°', 'Increase initial speed v₀', 'Add more mass to the package', 'Increase gravity'],
    correctIndex: 1,
    explanation: 'Correct! Range = v₀²sin(2θ)/g — increasing v₀ quadratically increases the range. You could also optimize the angle toward 45° for maximum range at a given speed.',
  },
  {
    id: 'max-range-angle',
    question: 'At what launch angle is the range maximized (on flat ground)?',
    options: ['30°', '45°', '60°', '90°'],
    correctIndex: 1,
    explanation: 'Exactly! 45° maximizes range because sin(2θ) = sin(90°) = 1, which is its maximum value. At 30° and 60° you get the same range as each other, but less than at 45°.',
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

  const worldToCanvas = (wx: number, wy: number) => ({
    cx: ORIGIN_X + wx * SCALE,
    cy: ORIGIN_Y - wy * SCALE,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, W, H);

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(7, 12, 28, 0.9)');
    grad.addColorStop(1, 'rgba(15, 22, 41, 0.6)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Ground
    ctx.fillStyle = '#1a2440';
    ctx.fillRect(0, ORIGIN_Y, W, H - ORIGIN_Y);
    ctx.strokeStyle = '#2a3555';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, ORIGIN_Y); ctx.lineTo(W, ORIGIN_Y); ctx.stroke();

    // Wall
    const wall = worldToCanvas(MISSION.wallX, MISSION.wallHeight);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.fillRect(wall.cx - 4, wall.cy, 8, ORIGIN_Y - wall.cy);
    ctx.strokeRect(wall.cx - 4, wall.cy, 8, ORIGIN_Y - wall.cy);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${MISSION.wallHeight}m`, wall.cx, wall.cy - 6);

    // Target zone
    const targetStart = worldToCanvas(MISSION.targetX - MISSION.targetTolerance, 0);
    const targetEnd = worldToCanvas(MISSION.targetX + MISSION.targetTolerance, 0);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.fillRect(targetStart.cx, ORIGIN_Y - 12, targetEnd.cx - targetStart.cx, 12);
    ctx.strokeRect(targetStart.cx, ORIGIN_Y - 12, targetEnd.cx - targetStart.cx, 12);
    ctx.fillStyle = '#10b981';
    ctx.fillText('TARGET', worldToCanvas(MISSION.targetX, 0).cx, ORIGIN_Y - 16);

    // Trajectory (if fired)
    if (fired) {
      const traj = generateTrajectory(params);
      ctx.strokeStyle = '#00d4ff';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.shadowBlur = 8; ctx.shadowColor = '#00d4ff';
      ctx.beginPath();
      traj.forEach((pt, i) => {
        const { cx, cy } = worldToCanvas(pt.x, pt.y);
        if (i === 0) ctx.moveTo(cx, cy);
        else ctx.lineTo(cx, cy);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Landing point
      const land = traj[traj.length - 1];
      const { cx } = worldToCanvas(land.x, land.y);
      ctx.beginPath(); ctx.arc(cx, ORIGIN_Y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();
    }

    // Crosshair (predict mode)
    if (crosshair && !fired) {
      const { x: cx, y: cy } = crosshair;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`${((cx - ORIGIN_X) / SCALE).toFixed(0)}m`, cx + 12, cy - 4);
    }

    // Axis labels
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
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

  return (
    <canvas
      ref={canvasRef}
      width={W} height={H}
      className={styles.canvas}
      onMouseMove={!fired ? handleMouseMove : undefined}
      onClick={!fired ? onFire : undefined}
      aria-label="Projectile motion simulation canvas — click to set predicted landing spot"
      role="img"
      tabIndex={0}
    />
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
    setPredictFired(true);
    addXP(10);
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

      <p className={styles.hint}>📍 <strong>Click on the canvas</strong> to place your predicted landing spot, then submit.</p>

      <ProjectileCanvas
        params={params}
        crosshair={crosshair}
        onCrosshairMove={setCrosshair}
        onFire={handleCrosshairFire}
        fired={false}
      />
      {!predictFired && <p className={styles.hint}>Click canvas to lock in your prediction.</p>}
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
      <POEShell
        moduleId="projectile"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
      />
    </div>
  );
}
