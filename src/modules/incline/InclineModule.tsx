import { useRef, useState, useEffect } from 'react';
import { useHiDPICanvas } from '../../components/canvas/useHiDPICanvas';
import { computeInclineForces, type InclineParams } from '../../core/physics/incline';
import { POEShell } from '../../components/poe/POEShell';
import { FormulaPanel } from '../../components/ui/FormulaPanel';
import { useGameStore } from '../../core/store/gameStore';
import { useSessionStore, type ExplainQuestion } from '../../core/store/sessionStore';
import { ConceptNotes } from '../../components/concepts/ConceptNotes';
import { INCLINE_CONCEPTS } from './inclineConcepts';
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
    hint: 'Think about what a solid surface physically CAN do to an object touching it — can it grab and pull, or only push?',
    explanation: 'The normal force is a contact force — surfaces can only push objects perpendicular to their own plane. It cannot pull, and it always opposes the component of force pressing into the surface.',
  },
  {
    id: 'friction-doubles-mass',
    question: 'If you double the mass of the block (angle unchanged), what happens to the frictional force?',
    options: ['It stays the same', 'It doubles', 'It halves', 'It becomes zero'],
    correctIndex: 1,
    hint: 'Friction depends on the normal force N, and N itself depends on weight (mg·cosθ). If you double m, what happens to N first — and then to friction?',
    explanation: 'Friction = μN = μ·mg·cos(θ). Doubling m doubles N, which doubles friction. The coefficient μ does not change — it depends only on the surface materials.',
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
    hint: '"Just starts to slide" means the block is right on the edge of equilibrium — the force pulling it down the slope must be exactly balanced by something. What force has been holding it in place up to this point?',
    explanation: 'At the critical angle: mg·sin(θ) = μₛ·mg·cos(θ), which simplifies to tan(θ) = μₛ. This is how we measure the coefficient of static friction experimentally.',
  },
];

const W = 420, H = 300;

// Vector colors — also used by the HTML legend so the two stay in sync.
const VEC_COLOR = { weight: '#dc2626', normal: '#4f46e5', friction: '#16a34a', angle: '#b45309' };

function drawIncline(ctx: CanvasRenderingContext2D, angleDeg: number, forces: ReturnType<typeof computeInclineForces>, validated: boolean) {
  ctx.clearRect(0, 0, W, H);

  const angle = (angleDeg * Math.PI) / 180;
  const baseX = 40, baseY = H - 40;
  const hyp = 280;

  // Incline surface (a right triangle: horizontal ground, vertical back, hypotenuse ramp)
  ctx.strokeStyle = '#c7ccdb';
  ctx.lineWidth = 2;
  ctx.fillStyle = '#eef1f7';
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY - hyp * Math.sin(angle));
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Ramp surface line, drawn heavier so it clearly reads as the contact surface
  ctx.strokeStyle = '#8890a3';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + hyp * Math.cos(angle), baseY - hyp * Math.sin(angle));
  ctx.stroke();

  // Block position (midway up incline), resting ON the surface line
  const bx = baseX + (hyp * 0.45) * Math.cos(angle);
  const by = baseY - (hyp * 0.45) * Math.sin(angle);
  // Vectors are drawn from the block's geometric centre, not its surface contact point
  const cx = bx - Math.sin(angle) * 15;
  const cy = by - Math.cos(angle) * 15;

  // Block
  ctx.save();
  ctx.translate(bx, by);
  ctx.rotate(-angle);
  const bSize = 32;
  ctx.fillStyle = 'rgba(79, 70, 229, 0.12)';
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 2;
  ctx.fillRect(-bSize / 2, -bSize, bSize, bSize);
  ctx.strokeRect(-bSize / 2, -bSize, bSize, bSize);
  ctx.restore();

  // Force vectors (always show weight; the rest appear once the FBD is verified)
  const scale = 4;

  // Weight: mg, straight down — always vertical regardless of incline angle
  drawVector(ctx, cx, cy, 0, forces.weight * scale, VEC_COLOR.weight, 'W');

  if (validated) {
    // Normal: perpendicular to the surface, pointing AWAY from the ramp material
    // (up and to the left of the slope, not into it).
    const nx = -Math.sin(angle) * forces.normal * scale;
    const ny = -Math.cos(angle) * forces.normal * scale;
    drawVector(ctx, cx, cy, nx, ny, VEC_COLOR.normal, 'N');

    // Friction: along the surface, pointing UP the slope (same direction the
    // ramp rises), opposing the block's tendency to slide down.
    const fMag = forces.isStationary ? forces.weightParallel : forces.frictionKinetic;
    const fx = Math.cos(angle) * fMag * scale;
    const fy = -Math.sin(angle) * fMag * scale;
    drawVector(ctx, cx, cy, fx, fy, VEC_COLOR.friction, 'f');
  }

  // Angle arc + label
  ctx.strokeStyle = VEC_COLOR.angle;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(baseX, baseY, 35, -angle, 0);
  ctx.stroke();
  ctx.fillStyle = VEC_COLOR.angle;
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.fillText(`${angleDeg}°`, baseX + 40, baseY - 8);
}

function drawVector(ctx: CanvasRenderingContext2D, ox: number, oy: number, dx: number, dy: number, color: string, label: string) {
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 5) return;
  const angle = Math.atan2(dy, dx);
  const headLen = 9;

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;

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

  // White halo behind the label so it stays legible over the ramp fill or block
  const lx = ox + dx + 8, ly = oy + dy - 2;
  ctx.font = 'bold 12px JetBrains Mono';
  ctx.textAlign = 'left';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.strokeText(label, lx, ly);
  ctx.fillStyle = color;
  ctx.fillText(label, lx, ly);
}

// Rendered fresh each time the Observe phase mounts, so its Hi-DPI sizing
// effect always attaches to a canvas that actually exists in the DOM (unlike
// a ref/effect declared in the parent, which never remounts across phases).
function InclineCanvas({
  angleDeg,
  forces,
  validated,
}: {
  angleDeg: number;
  forces: ReturnType<typeof computeInclineForces>;
  validated: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useHiDPICanvas(canvasRef, W, H);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    drawIncline(ctx, angleDeg, forces, validated);
  }, [angleDeg, forces, validated]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.canvas}
      aria-label="Free body diagram of block on incline showing force vectors"
      role="img"
    />
  );
}

export function InclineModule() {
  const { addXP, unlockBadge, completeModule } = useGameStore();
  const { setPOEPhase } = useSessionStore();

  const [angleDeg, setAngleDeg] = useState(30);
  const [muStatic, setMuStatic] = useState(0.4);
  const [mass, setMass] = useState(5);
  const [validated, setValidated] = useState(false);
  const [firstAttempt, setFirstAttempt] = useState(true);

  const inclineParams: InclineParams = { mass, angleDeg, muStatic, muKinetic: muStatic * 0.75 };
  const forces = computeInclineForces(inclineParams);

  const handleValidate = () => {
    if (firstAttempt) {
      unlockBadge('force-whisperer');
      setFirstAttempt(false);
    }
    setValidated(true);
    addXP(25);
    setPOEPhase('observe');
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

      <p className={styles.hint}>Predicted whether it slides? Verify your FBD to see the real force vectors.</p>

      <button className="btn btn--primary" onClick={handleValidate}>
        ⚡ Verify My FBD
      </button>
    </div>
  );

  const ObservePhase = (
    <div className={styles.observeWrap}>
      <InclineCanvas angleDeg={angleDeg} forces={forces} validated={validated} />

      <div className={styles.legend}>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: VEC_COLOR.weight }} />W — Weight (mg), straight down</span>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: VEC_COLOR.normal }} />N — Normal force, perpendicular to the ramp</span>
        <span className={styles.legendItem}><span className={styles.legendSwatch} style={{ background: VEC_COLOR.friction }} />f — Friction, up the slope</span>
      </div>

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

      <div className={styles.conceptWrap}>
        <ConceptNotes
          title="Forces on an Incline"
          intro="Normal force, friction, and why gravity splits into two pieces on a slope."
          sections={INCLINE_CONCEPTS}
        />
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
