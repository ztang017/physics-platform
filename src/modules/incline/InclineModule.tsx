import { useRef, useState, useEffect } from 'react';
import { computeInclineForces, type InclineParams } from '../../core/physics/incline';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { type ExplainQuestion } from '../../core/store/sessionStore';
import styles from './InclineModule.module.css';

const EXPLAIN_QUESTIONS: ExplainQuestion[] = [
  {
    id: 'normal-direction',
    question: 'Why does the normal force point perpendicular to the surface — not straight up?',
    options: [
      'Because friction acts upward',
      'Because the surface can only push perpendicular to itself',
      'Because gravity is always horizontal',
      'Because the block is accelerating',
    ],
    correctIndex: 1,
    explanation: 'Correct! The normal force is a contact force — surfaces can only push objects perpendicular to their own plane. It cannot pull, and it always opposes the component of force pressing into the surface.',
  },
  {
    id: 'friction-doubles-mass',
    question: 'If you double the mass of the block (angle unchanged), what happens to the frictional force?',
    options: ['It stays the same', 'It doubles', 'It halves', 'It becomes zero'],
    correctIndex: 1,
    explanation: 'Correct! Friction = μN = μ·mg·cos(θ). Doubling m doubles N, which doubles friction. The coefficient μ does not change — it depends only on the surface materials.',
  },
  {
    id: 'critical-angle',
    question: 'At the critical angle where the block just starts to slide, what is true?',
    options: [
      'Normal force = 0',
      'The parallel gravity component equals maximum static friction',
      'Kinetic friction equals zero',
      'The block has infinite acceleration',
    ],
    correctIndex: 1,
    explanation: 'Right! At the critical angle: mg·sin(θ) = μₛ·mg·cos(θ), which simplifies to tan(θ) = μₛ. This is how we measure the coefficient of static friction experimentally.',
  },
];

const W = 400, H = 300;

function drawIncline(ctx: CanvasRenderingContext2D, angleDeg: number, forces: ReturnType<typeof computeInclineForces>, validated: boolean) {
  ctx.clearRect(0, 0, W, H);

  const angle = (angleDeg * Math.PI) / 180;
  const baseX = 30, baseY = H - 30;
  const hyp = 300;

  // Incline surface
  ctx.strokeStyle = '#2a3555';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#1a2440';
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY - hyp * Math.sin(angle));
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Surface line
  ctx.strokeStyle = '#2a3555';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY - hyp * Math.sin(angle));
  ctx.stroke();

  // Block position (midway up incline)
  const bx = baseX + (hyp * 0.45) * Math.cos(angle);
  const by = baseY - (hyp * 0.45) * Math.sin(angle);

  // Block
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(-angle);
  const bSize = 30;
  ctx.fillStyle = validated ? 'rgba(0, 212, 255, 0.3)' : 'rgba(124, 58, 237, 0.3)';
  ctx.strokeStyle = validated ? '#00d4ff' : '#7c3aed';
  ctx.lineWidth = 2;
  ctx.fillRect(-bSize / 2, -bSize, bSize, bSize);
  ctx.strokeRect(-bSize / 2, -bSize, bSize, bSize);
  ctx.restore();

  // Force vectors (always show weight)
  const scale = 4;

  // Weight (straight down)
  drawVector(ctx, bx, by - 15, 0, forces.weight * scale, '#ef4444', 'W');

  if (validated) {
    // Normal (perpendicular to surface)
    const nx = -Math.sin(angle) * forces.normal * scale;
    const ny = -Math.cos(angle) * forces.normal * scale;
    drawVector(ctx, bx, by - 15, nx, -ny, '#00d4ff', 'N');

    // Friction (up the slope)
    const fx = -Math.cos(angle) * (forces.isStationary ? forces.weightParallel : forces.frictionKinetic) * scale;
    const fy = -Math.sin(angle) * (forces.isStationary ? forces.weightParallel : forces.frictionKinetic) * scale;
    drawVector(ctx, bx, by - 15, fx, fy, '#10b981', 'f');
  }

  // Angle arc
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(baseX, baseY, 35, -angle, 0);
  ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.fillText(`${angleDeg}°`, baseX + 38, baseY - 6);
}

function drawVector(ctx: CanvasRenderingContext2D, ox: number, oy: number, dx: number, dy: number, color: string, label: string) {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return;
  const angle = Math.atan2(dy, dx);
  const headLen = 8;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 8;
  ctx.shadowColor = color;

  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + dx, oy + dy);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(ox + dx, oy + dy);
  ctx.lineTo(ox + dx - headLen * Math.cos(angle - 0.4), oy + dy - headLen * Math.sin(angle - 0.4));
  ctx.lineTo(ox + dx - headLen * Math.cos(angle + 0.4), oy + dy - headLen * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;

  ctx.font = 'bold 11px JetBrains Mono';
  ctx.fillText(label, ox + dx + 6, oy + dy - 2);
}

export function InclineModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [angleDeg, setAngleDeg] = useState(30);
  const [muStatic, setMuStatic] = useState(0.4);
  const [mass, setMass] = useState(5);
  const [validated, setValidated] = useState(false);
  const [firstAttempt, setFirstAttempt] = useState(true);

  const inclineParams: InclineParams = { mass, angleDeg, muStatic, muKinetic: muStatic * 0.75 };
  const forces = computeInclineForces(inclineParams);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    drawIncline(ctx, angleDeg, forces, validated);
  }, [angleDeg, forces, validated]);

  const handleValidate = () => {
    if (firstAttempt) {
      unlockBadge('force-whisperer');
      setFirstAttempt(false);
    }
    setValidated(true);
    addXP(25);
  };

  const handleComplete = (score: number) => {
    addXP(50 + score);
    unlockBadge('equilibrium-master');
    completeModule('incline');
  };

  const PredictPhase = (
    <div className={styles.predictWrap}>
      <div className={styles.sliders}>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-angle">Incline Angle <span className="value">{angleDeg}°</span></label>
          <input id="inc-angle" type="range" min="5" max="75" step="1" value={angleDeg} onChange={(e) => { setAngleDeg(+e.target.value); setValidated(false); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-mu">Static Friction (μₛ) <span className="value">{muStatic.toFixed(2)}</span></label>
          <input id="inc-mu" type="range" min="0.1" max="0.9" step="0.05" value={muStatic} onChange={(e) => { setMuStatic(+e.target.value); setValidated(false); }} />
        </div>
        <div className="slider-wrap">
          <label className="slider-label" htmlFor="inc-mass">Mass (m) <span className="value">{mass} kg</span></label>
          <input id="inc-mass" type="range" min="1" max="20" step="1" value={mass} onChange={(e) => { setMass(+e.target.value); setValidated(false); }} />
        </div>
      </div>

      <div className={styles.statusCard}>
        <div className={styles.statusRow}>
          <span>Weight (mg)</span><strong className="text-amber">{forces.weight.toFixed(1)} N</strong>
        </div>
        <div className={styles.statusRow}>
          <span>∥ Component</span><strong className="text-amber">{forces.weightParallel.toFixed(1)} N</strong>
        </div>
        <div className={styles.statusRow}>
          <span>⊥ Component</span><strong className="text-cyan">{forces.weightPerpendicular.toFixed(1)} N</strong>
        </div>
        <div className={styles.statusRow}>
          <span>Max Static Friction</span><strong className="text-green">{forces.frictionMax.toFixed(1)} N</strong>
        </div>
        <div className={`${styles.statusRow} ${styles.statusResult}`}>
          <span>Block will:</span>
          <strong className={forces.isStationary ? 'text-green' : 'text-amber'}>
            {forces.isStationary ? '✓ Stay still' : '⚡ Slide down!'}
          </strong>
        </div>
      </div>

      <p className={styles.hint}>When you're ready, submit your FBD to see the force vectors appear!</p>

      <button className="btn btn--primary" onClick={handleValidate}>
        ⚡ Submit My FBD
      </button>
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
      <canvas
        ref={canvasRef}
        width={W} height={H}
        className={styles.canvas}
        aria-label="Free body diagram of block on incline showing force vectors"
        role="img"
      />

      <FormulaPanel
        title="Incline Force Equations"
        formulas={[
          { label: 'Weight', latex: 'W = mg', liveValue: `= ${forces.weight.toFixed(1)} N`, accentColor: 'amber' },
          { label: 'Parallel', latex: 'W_\\parallel = mg\\sin\\theta', liveValue: `= ${forces.weightParallel.toFixed(1)} N`, accentColor: 'amber' },
          { label: 'Normal', latex: 'N = mg\\cos\\theta', liveValue: `= ${forces.normal.toFixed(1)} N`, accentColor: 'cyan' },
          { label: 'Friction', latex: 'f \\leq \\mu_s N', liveValue: `max = ${forces.frictionMax.toFixed(1)} N`, accentColor: 'green' },
        ]}
      />
    </div>
  );

  return (
    <div className={styles.module}>
      <div className={styles.moduleHeader}>
        <h2>⚖️ Free-Body Diagram on an Incline</h2>
        <p>Decompose forces on a block and explore static vs. kinetic friction.</p>
      </div>
      <POEShell
        moduleId="incline"
        predictComponent={PredictPhase}
        observeComponent={ObservePhase}
        explainQuestions={EXPLAIN_QUESTIONS}
        onComplete={handleComplete}
      />
    </div>
  );
}
